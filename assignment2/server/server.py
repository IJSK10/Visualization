from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json
from kneed import KneeLocator

app = Flask(__name__)
CORS(app)

print("Loading and preprocessing data...")
df = pd.read_csv("games.csv")
numerical_df = df.select_dtypes(include=[np.number])

scaler = StandardScaler()
scaled_data = scaler.fit_transform(numerical_df)

pca = PCA(n_components=2)
pca_transformed = pca.fit_transform(scaled_data)

columns = list(numerical_df.columns)

def compute_elbow_method(data):
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
    
    return optimal_k, mse_scores

@app.route("/api/kmeans", methods=["GET"])
def get_kmeans_info():
    elbow_k, mse_scores = compute_elbow_method(scaled_data)
    
    response = {
        "optimal_k": int(elbow_k),
        "mse_scores": mse_scores,
        "columns": columns
    }
    
    return jsonify(response)

@app.route("/api/pca", methods=["GET"])
def get_pca_info():
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(numerical_df)
    
    pca = PCA()
    pca.fit(scaled_data)
    
    response = {
        "eigenvalues": pca.explained_variance_.tolist(),  # Convert NumPy array to list
        "eigenvectors": pca.components_.tolist() 
    }

    return jsonify(response)

@app.route("/api/biplot", methods=["GET"])
def get_biplot_data():
    di = int(request.args.get("di", 2)) 
    num_clusters = int(request.args.get("k", 3))
    
    if di != pca.n_components:
        temp_pca = PCA(n_components=di)
        temp_transformed = temp_pca.fit_transform(scaled_data)
        pca_result = temp_transformed
        pca_components = temp_pca.components_
    else:
        pca_result = pca_transformed
        pca_components = pca.components_
    
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(pca_result).tolist()
    
    feature_vectors = []
    for i, feature in enumerate(columns):
        if di >= 2:
            vector = {
                "feature": feature,
                "x": 0,
                "y": 0,
                "dx": pca_components[0, i],
                "dy": pca_components[1, i],
                "length": np.sqrt(pca_components[0, i]**2 + pca_components[1, i]**2)
            }
            feature_vectors.append(vector)
    
    points_with_clusters = []
    for i in range(len(pca_result)):
        if di >= 2:
            point = {
                "x": float(pca_result[i, 0]),
                "y": float(pca_result[i, 1]),
                "cluster": cluster_labels[i]
            }
            points_with_clusters.append(point)
    
    response = {
        "points": points_with_clusters,
        "feature_vectors": feature_vectors,
        "num_clusters": num_clusters
    }
    
    return jsonify(response)

@app.route("/api/scatterplot", methods=["GET"])
def get_scatterplot_data():
    di = int(request.args.get("di", 2))
    
    if di != pca.n_components:
        temp_pca = PCA(n_components=di)
        temp_pca.fit(scaled_data)
        squared_sums = np.sum(temp_pca.components_ ** 2, axis=0)
    else:
        squared_sums = np.sum(pca.components_ ** 2, axis=0)

    top_indices = np.argsort(squared_sums)[-4:][::-1]

    top_attributes = [numerical_df.columns[i] for i in top_indices]

    scatter_data = scaled_data[:, top_indices].tolist()

    response = {
        "top_attributes": top_attributes,
        "squared_sums": squared_sums[top_indices].tolist(),
        "scatter_data": scatter_data
    }

    return jsonify(response)

@app.route("/api/mse_plot", methods=["GET"])
def get_mse_plot_data():
    mse_scores = []
    k_range = range(1, 11)
    
    for i in k_range:
        kmeans = KMeans(n_clusters=i, random_state=42, n_init=10)
        kmeans.fit(scaled_data)
        mse_scores.append(kmeans.inertia_)
    
    response = {
        "k_values": list(k_range),
        "mse_scores": mse_scores
    }
    
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)