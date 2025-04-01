from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import MDS

app = Flask(__name__)
CORS(app)

# Load dataset
file_path = "games.csv"
df = pd.read_csv(file_path)

df = df[~df.eq('tbd').any(axis=1)]

# Identify numerical and categorical columns
numerical_columns = [
        'Metascore', 'Userscore', 'Year', 'Rank', 
        'Positive %', 'Mixed %', 'Negative %',
        'NA_Sales', 'Global_Sales', 'User_Count'
    ]
categorical_columns = df.select_dtypes(exclude=[np.number]).columns.tolist()

# Remove NaN values
df = df.dropna()

# Standardize numerical data
scaler = StandardScaler()
scaled_data = scaler.fit_transform(df[numerical_columns])

# PCA for clustering
pca = PCA(n_components=len(numerical_columns))
pca_transformed = pca.fit_transform(scaled_data)
k = 4
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
df['Cluster_ID'] = kmeans.fit_predict(pca_transformed[:, :2])

# Create a filtered dataframe with only the top 10 categories in each categorical column
df1 = df.copy()
categorical_mappings1 = {}  # To store filtered categorical values
for col in categorical_columns:
    df1[col] = df1[col].astype(str)  # Ensure string type
    top_15_categories = df1[col].value_counts().nlargest(15).index.tolist()
    df1 = df1[df1[col].isin(top_15_categories)]
    categorical_mappings1[col] = top_15_categories  # Store string categories

# MDS for data points (Euclidean distance)
mds = MDS(n_components=2, dissimilarity='euclidean', random_state=42)
mds_data_points = mds.fit_transform(scaled_data)

def format_mds_data():
    return [
        {"x": float(mds_data_points[i, 0]), "y": float(mds_data_points[i, 1]), "cluster": int(df['Cluster_ID'].iloc[i])}
        for i in range(len(df))
    ]

# MDS for variable ordering (1 - |correlation| distance)
corr_matrix = df[numerical_columns].corr()
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

@app.route('/pca_clusters', methods=['GET'])
def get_pca_clusters():
    return jsonify([
        {"pc1": float(pca_transformed[i, 0]), "pc2": float(pca_transformed[i, 1]), "cluster": int(df['Cluster_ID'].iloc[i])}
        for i in range(len(df))
    ])

@app.route('/pcp_data', methods=['GET'])
def get_pcp_data():
    return jsonify({
        "data": df1.to_dict(orient="records"),
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_mappings1,  # Send string mappings for D3.js
        "mds_variables": format_mds_variables()
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
