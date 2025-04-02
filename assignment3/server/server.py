from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from kneed import KneeLocator

app = Flask(__name__)
CORS(app)

file_path = "games.csv"
df = pd.read_csv(file_path)

df = df[~df.eq('tbd').any(axis=1)]
df = df.dropna()


numerical_columns = [
    'Metascore', 'Userscore', 'Year', 'Rank', 
    'Positive %', 'Mixed %', 'Negative %',
    'NA_Sales', 'Global_Sales', 'User_Count'
]
categorical_columns = df.select_dtypes(exclude=[np.number]).columns.tolist()


df1 = df.copy()
categorical_mappings1 = {}
for col in categorical_columns:
    df1[col] = df1[col].astype(str)
    top_15_categories = df1[col].value_counts().nlargest(23).index.tolist()
    df1 = df1[df1[col].isin(top_15_categories)]
    categorical_mappings1[col] = top_15_categories


scaler = StandardScaler()
scaled_data = scaler.fit_transform(df1[numerical_columns])


def find_optimal_k(data, max_k=10):
    mse_scores = []
    k_range = list(range(1, 11))
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(data)
        mse_scores.append(kmeans.inertia_)
    
    kneedle = KneeLocator(
        k_range, 
        mse_scores, 
        curve="convex", 
        direction="decreasing",
        S=1.0 
    )
    
    optimal_k = kneedle.elbow
    
    if optimal_k is None:
        diffs = np.diff(mse_scores, 2)
        elbow_index = np.argmax(diffs) + 1
        optimal_k = k_range[elbow_index]
    
    return optimal_k


optimal_k = find_optimal_k(scaled_data)
kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
df1['Cluster_ID'] = kmeans.fit_predict(scaled_data)


pca = PCA(n_components=len(numerical_columns))
pca_transformed = pca.fit_transform(scaled_data)


mds = MDS(n_components=2, dissimilarity='euclidean', random_state=42)
mds_data_points = mds.fit_transform(scaled_data)

def format_mds_data():
    return [
        {"x": float(mds_data_points[i, 0]), "y": float(mds_data_points[i, 1]), "cluster": int(df1['Cluster_ID'].iloc[i])}
        for i in range(len(df1))
    ]


corr_matrix = df1[numerical_columns].corr()
dist_matrix = 1 - np.abs(corr_matrix)
mds_vars = MDS(n_components=2, dissimilarity="precomputed", random_state=42)
mds_variables = mds_vars.fit_transform(dist_matrix)

def format_mds_variables():
    return [
        {"x": float(mds_variables[i, 0]), "y": float(mds_variables[i, 1]), "variable": numerical_columns[i]}
        for i in range(len(numerical_columns))
    ]

@app.route('/mds_data', methods=['GET'])
def get_mds_data():
    return jsonify(format_mds_data())

@app.route('/mds_variables', methods=['GET'])
def get_mds_variables():
    return jsonify(format_mds_variables())

@app.route('/pcp_data', methods=['GET'])
def get_pcp_data():
    return jsonify({"data":df1.to_dict(orient="records")})

@app.route("/mse_plot", methods=["GET"])
def get_mse_plot_data():
    selected_components = pca_transformed[:, [0, 1]]  
    
    mse_scores = []
    k_range = range(1, 11)
    
    for i in k_range:
        kmeans = KMeans(n_clusters=i, random_state=42, n_init=10)
        kmeans.fit(selected_components)
        mse_scores.append(kmeans.inertia_)
    
    response = {
        "k_values": list(k_range),
        "mse_scores": mse_scores,
        "optimal_k":int(optimal_k)
    }
    
    return jsonify(response)

@app.route("/set_k", methods=["POST"])
def set_k():
    global optimal_k, df1
    data = request.get_json()
    new_k = data.get("k")
    
    if not isinstance(new_k, int) or new_k < 1:
        return jsonify({"error": "Invalid k value"}), 400
    
    optimal_k = new_k
    kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    df1['Cluster_ID'] = kmeans.fit_predict(scaled_data)
    
    return jsonify({"message": "Updated k value", "new_k": optimal_k})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)