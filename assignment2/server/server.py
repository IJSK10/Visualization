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

df = df[~df.eq('tbd').any(axis=1)]

selected_columns = [
    'Metascore', 'Userscore', 'Year', 'Rank', 
    'Positive %', 'Mixed %', 'Negative %',
    'NA_Sales', 'Global_Sales', 'User_Count'
]

numerical_df = df[selected_columns]

scaler = StandardScaler()
scaled_data = scaler.fit_transform(numerical_df)

n_components = len(selected_columns)
pca = PCA(n_components=n_components)
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
    comp1 = int(request.args.get("comp1", 0))
    comp2 = int(request.args.get("comp2", 1))
    
    selected_components = pca_transformed[:,]
    
    elbow_k, mse_scores = compute_elbow_method(selected_components)
    
    response = {
        "optimal_k": int(elbow_k),
        "mse_scores": mse_scores,
        "columns": columns,
        "selected_components": [comp1, comp2]
    }
    
    return jsonify(response)

@app.route("/api/pca", methods=["GET"])
def get_pca_info():
    response = {
        "eigenvalues": pca.explained_variance_.tolist(),
    }
    return jsonify(response)

@app.route("/api/biplot", methods=["GET"])
def get_biplot_data():
    comp1 = int(request.args.get("comp1", 0))
    comp2 = int(request.args.get("comp2", 1))
    num_clusters = int(request.args.get("k", 3))
    
    selected_components = pca_transformed[:, [comp1, comp2]]
    
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(selected_components).tolist()
    
    feature_vectors = []
    for i, feature in enumerate(columns):
        vector = {
            "feature": feature,
            "x": 0,
            "y": 0,
            "dx": pca.components_[comp1, i],
            "dy": pca.components_[comp2, i],
            "length": np.sqrt(pca.components_[comp1, i]**2 + pca.components_[comp2, i]**2)
        }
        feature_vectors.append(vector)
    
    points_with_clusters = []
    for i in range(len(selected_components)):
        point = {
            "x": float(selected_components[i, 0]),
            "y": float(selected_components[i, 1]),
            "cluster": cluster_labels[i]
        }
        points_with_clusters.append(point)
    
    response = {
        "points": points_with_clusters,
        "feature_vectors": feature_vectors,
    }
    
    return jsonify(response)

@app.route("/api/scatterplot", methods=["GET"])
def get_scatterplot_data():

    comp1 = int(request.args.get("comp1", 0))
    comp2 = int(request.args.get("comp2", 1))
    num_clusters = int(request.args.get("k", 3))
    
    di = int(request.args.get("di", 2))
    
    di = min(di, n_components)

    selected_components = pca_transformed[:, [comp1, comp2]]

    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(selected_components).tolist()
    
    squared_sums = np.sum(pca.components_[:di] ** 2, axis=0)
    top_indices = np.argsort(squared_sums)[-4:][::-1]
    
    top_attributes = [numerical_df.columns[i] for i in top_indices]
    
    scatter_data = numerical_df.iloc[:, top_indices].values.tolist()
    
    response = {
        "top_attributes": top_attributes,
        "squared_sums": squared_sums[top_indices].tolist(),
        "scatter_data": scatter_data,
        "cluster" : cluster_labels
    }
    
    return jsonify(response)

@app.route("/api/mse_plot", methods=["GET"])
def get_mse_plot_data():
    comp1 = int(request.args.get("comp1", 0))
    comp2 = int(request.args.get("comp2", 1))
    
    selected_components = pca_transformed[:, [comp1, comp2]]
    
    mse_scores = []
    k_range = range(1, 11)
    
    for i in k_range:
        kmeans = KMeans(n_clusters=i, random_state=42, n_init=10)
        kmeans.fit(selected_components)
        mse_scores.append(kmeans.inertia_)
    
    response = {
        "k_values": list(k_range),
        "mse_scores": mse_scores,
    }
    
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)