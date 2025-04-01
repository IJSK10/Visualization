import pandas as pd
from flask_cors import CORS
import numpy as np
from sklearn.manifold import MDS
from flask import Flask, jsonify
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import json

app = Flask(__name__)
CORS(app)

# Load and preprocess data
def load_data():
    # Read CSV file
    df = pd.read_csv('games.csv')
    
    # Remove rows with 'tbd' values
    df = df[~df.eq('tbd').any(axis=1)]
    
    # Select desired columns
    selected_columns = [
        'Metascore', 'Userscore', 'Year', 'Rank', 
        'Positive %', 'Mixed %', 'Negative %',
        'NA_Sales', 'Global_Sales', 'User_Count'
    ]
    
    # Filter columns that exist in the dataframe
    selected_columns = [col for col in selected_columns if col in df.columns]
    
    # Convert to numeric where possible
    for col in selected_columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except:
            print(f"Couldn't convert {col} to numeric. Keeping as is.")
    
    # Choose only rows with complete data for the selected columns
    df_numeric = df[selected_columns].dropna()
    
    # Perform PCA and K-means clustering
    X = df_numeric[selected_columns].values
    X_scaled = StandardScaler().fit_transform(X)
    
    # Apply PCA using all selected columns as components
    n_components = len(selected_columns)
    pca = PCA(n_components=n_components)
    pca_result_full = pca.fit_transform(X_scaled)
    
    # Take just the top 2 components for clustering
    pca_result = pca_result_full[:, :2]
    
    # Apply K-means clustering with k=4
    kmeans = KMeans(n_clusters=4, random_state=42)
    cluster_labels = kmeans.fit_predict(pca_result)
    
    # Add cluster_id to the dataframe
    df_numeric['cluster_id'] = cluster_labels
    
    # Add PCA components as columns
    df_numeric['pca_1'] = pca_result[:, 0]
    df_numeric['pca_2'] = pca_result[:, 1]
    
    # Add cluster_id to original dataframe
    df = df.loc[df_numeric.index].copy()
    df['cluster_id'] = cluster_labels
    df['pca_1'] = pca_result[:, 0]
    df['pca_2'] = pca_result[:, 1]
    
    # Add explained variance information
    explained_variance = pca.explained_variance_ratio_
    # print(f"Explained variance by components: {explained_variance}")
    # print(f"Cumulative explained variance: {np.cumsum(explained_variance)}")
    print("hello")
    return df, df_numeric, selected_columns

# Task 4(a): Data MDS plot with Euclidean distance
@app.route('/api/mds-data', methods=['GET'])
def mds_data():
    _, df_numeric, selected_columns = load_data()
    
    # Extract features and standardize
    print("1")
    X = df_numeric[selected_columns].values
    X_scaled = StandardScaler().fit_transform(X)
    print("2")
    # Apply MDS
    mds = MDS(n_components=2, metric=True, random_state=42)
    print("5")
    mds_data = mds.fit_transform(X_scaled)
    print("3")
    # Prepare results
    result = {
        'x': mds_data[:, 0].tolist(),
        'y': mds_data[:, 1].tolist(),
        'cluster_id': df_numeric['cluster_id'].tolist(),
        'stress': mds.stress_
    }
    #print(result)
    return jsonify(result)

# Task 4(b): Variables MDS plot with (1-|correlation|) distance
@app.route('/api/mds-variables', methods=['GET'])
def mds_variables():
    df,df_numeric, selected_columns = load_data()
    
    # Compute correlation matrix
    print("1")
    corr_matrix = df_numeric[selected_columns].corr().abs()
    
    print("2")
    # Convert to distance matrix (1 - |correlation|)
    dist_matrix = 1 - corr_matrix
    print("3")
    # Apply MDS to the distance matrix
    mds = MDS(n_components=2, metric=True, dissimilarity='precomputed', random_state=42)
    mds_result = mds.fit_transform(dist_matrix)
    print("4")
    # Prepare results
    result = {
        'variables': selected_columns,
        'x': mds_result[:, 0].tolist(),
        'y': mds_result[:, 1].tolist(),
        'stress': mds.stress_
    }
    
    return jsonify(result)

# Task 5: Parallel Coordinates Plot data
@app.route('/api/pcp-data', methods=['GET'])
def pcp_data():
    df, df_numeric, selected_columns = load_data()
    
    # Get all columns (numeric and categorical)
    all_columns = [col for col in df.columns if col != 'cluster_id' and col not in ['pca_1', 'pca_2']]
    
    # For each row, create a list of values
    pcp_data = []
    for _, row in df.iterrows():
        if not row.isna().any():
            data_point = {
                'cluster_id': row.get('cluster_id', 0),
                'values': {col: row[col] for col in all_columns if col in row}
            }
            pcp_data.append(data_point)
    
    # Get column types for frontend rendering
    column_types = {}
    for col in all_columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            column_types[col] = 'numeric'
            # Include min and max for scaling
            column_types[col + '_min'] = df[col].min()
            column_types[col + '_max'] = df[col].max()
        else:
            column_types[col] = 'categorical'
            # Include unique values for categorical axes
            column_types[col + '_values'] = df[col].unique().tolist()
    
    result = {
        'data': pcp_data[:500],  # Limit to 500 points to avoid overloading the browser
        'columns': all_columns,
        'column_types': column_types
    }
    
    return jsonify(result)

# Task 6: Get correlation data for PCP axis ordering
@app.route('/api/correlations', methods=['GET'])
def correlations():
    _, df_numeric, selected_columns = load_data()
    
    # Compute correlation matrix
    corr_matrix = df_numeric[selected_columns].corr().round(3)
    
    # Convert to dictionary format
    corr_dict = {}
    for col in selected_columns:
        corr_dict[col] = corr_matrix[col].to_dict()
    
    return jsonify(corr_dict)

# Endpoint to get ordered columns based on user selection
@app.route('/api/order-columns/<ordering>', methods=['GET'])
def order_columns(ordering):
    try:
        # Parse the ordering (comma-separated column names)
        ordered_columns = ordering.split(',')
        
        # Load data to get all columns
        _, _, selected_columns = load_data()
        
        # Check if ordered columns are valid
        for col in ordered_columns:
            if col not in selected_columns:
                return jsonify({'error': f'Column {col} not found in dataset'}), 400
        
        # Add any remaining columns not in the ordering
        remaining_columns = [col for col in selected_columns if col not in ordered_columns]
        final_ordering = ordered_columns + remaining_columns
        
        return jsonify({'ordering': final_ordering})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# New endpoint to get PCA results
@app.route('/api/pca-data', methods=['GET'])
def pca_data():
    df, _, _ = load_data()
    
    result = {
        'x': df['pca_1'].tolist(),
        'y': df['pca_2'].tolist(),
        'cluster_id': df['cluster_id'].tolist()
    }
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)