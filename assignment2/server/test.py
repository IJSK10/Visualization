import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import dash
from dash import dcc, html, Input, Output, dash_table
import base64
from io import BytesIO

def perform_pca(data):
    """
    Perform PCA on input data.
    
    Parameters:
    - data: pandas DataFrame with numerical features
    
    Returns:
    - Dictionary containing PCA results
    """
    # Extract numerical features
    features = data.select_dtypes(include=[np.number]).columns.tolist()
    
    # Scale the data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(data[features])
    
    # Perform PCA
    n_components = min(len(features), data.shape[0], 10)  # Limit to max 10 components for visualization
    pca = PCA(n_components=n_components)
    pca.fit(X_scaled)
    
    # Get component scores
    scores = pca.transform(X_scaled)
    
    # Calculate loadings
    loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
    
    return {
        'pca': pca,
        'features': features,
        'X_scaled': X_scaled,
        'scores': scores,
        'loadings': loadings,
        'components': pca.components_,
        'explained_variance': pca.explained_variance_,
        'explained_variance_ratio': pca.explained_variance_ratio_
    }

def create_scree_plot(pca_results):
    """Create a Plotly scree plot for PCA results."""
    exp_var_ratio = pca_results['explained_variance_ratio']
    cum_exp_var = np.cumsum(exp_var_ratio)
    
    # Create figure with secondary y-axis
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    
    # Add bar chart for explained variance
    fig.add_trace(
        go.Bar(
            x=list(range(1, len(exp_var_ratio) + 1)),
            y=exp_var_ratio,
            name="Explained Variance",
            marker_color='rgba(55, 83, 109, 0.7)'
        ),
        secondary_y=False,
    )
    
    # Add line chart for cumulative explained variance
    fig.add_trace(
        go.Scatter(
            x=list(range(1, len(exp_var_ratio) + 1)),
            y=cum_exp_var,
            name="Cumulative Explained Variance",
            marker_color='red',
            mode='lines+markers'
        ),
        secondary_y=True,
    )
    
    # Add shapes and annotations for currently selected threshold (to be updated by callback)
    fig.update_layout(
        title_text="Scree Plot: Explained Variance by Principal Component",
        xaxis_title_text="Principal Component",
        yaxis_title_text="Explained Variance Ratio",
        yaxis2_title_text="Cumulative Explained Variance",
        height=500,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        ),
        template="plotly_white"
    )
    
    return fig

def create_biplot(pca_results):
    """Create a Plotly biplot for PCA results."""
    # Extract required data
    scores = pca_results['scores']
    loadings = pca_results['loadings']
    features = pca_results['features']
    exp_var_ratio = pca_results['explained_variance_ratio']
    
    # Create scatter plot of PC scores
    fig = go.Figure()
    
    # Add data points (scores)
    fig.add_trace(
        go.Scatter(
            x=scores[:, 0],
            y=scores[:, 1],
            mode='markers',
            marker=dict(
                color='blue',
                opacity=0.6,
                size=8
            ),
            text=[f"Sample {i}" for i in range(len(scores))],
            name='Data Points'
        )
    )
    
    # Add feature vectors (loadings)
    for i, feature in enumerate(features):
        fig.add_trace(
            go.Scatter(
                x=[0, loadings[i, 0]],
                y=[0, loadings[i, 1]],
                mode='lines+text',
                line=dict(color='red', width=1),
                text=['', feature],
                textposition='top center',
                name=feature
            )
        )
    
    # Customize layout
    fig.update_layout(
        title='PCA Biplot',
        xaxis=dict(
            title=f'PC1 ({exp_var_ratio[0]:.2%} explained variance)',
            zeroline=True
        ),
        yaxis=dict(
            title=f'PC2 ({exp_var_ratio[1]:.2%} explained variance)',
            zeroline=True
        ),
        height=600,
        width=800,
        template="plotly_white",
        showlegend=False
    )
    
    # Set equal scaling
    max_range = max(
        abs(scores[:, 0].max()), abs(scores[:, 0].min()),
        abs(scores[:, 1].max()), abs(scores[:, 1].min()),
        abs(loadings[:, 0].max()), abs(loadings[:, 0].min()),
        abs(loadings[:, 1].max()), abs(loadings[:, 1].min())
    )
    
    fig.update_xaxes(range=[-max_range*1.2, max_range*1.2])
    fig.update_yaxes(range=[-max_range*1.2, max_range*1.2])
    
    return fig

def find_top_features(pca_results, selected_dim):
    """
    Find the top 4 features with highest squared sum of PCA loadings
    for the first selected_dim principal components.
    
    Parameters:
    - pca_results: dictionary of PCA results
    - selected_dim: number of principal components to consider
    
    Returns:
    - pandas DataFrame with top features and their squared loadings
    """
    loadings = pca_results['loadings']
    features = pca_results['features']
    
    if selected_dim > loadings.shape[1]:
        selected_dim = loadings.shape[1]
        
    # Calculate squared sum of loadings for each feature
    loadings_subset = loadings[:, :selected_dim]
    squared_sum = np.sum(loadings_subset**2, axis=1)
    
    # Get indices of top 4 features
    top_indices = np.argsort(squared_sum)[::-1][:4]
    
    # Get feature names and their squared sum values
    feature_names = [features[i] for i in top_indices]
    feature_values = squared_sum[top_indices]
    
    # Create a DataFrame for display
    top_features_df = pd.DataFrame({
        'Feature': feature_names,
        'Squared Sum of Loadings': feature_values
    })
    
    return top_features_df

def create_scatterplot_matrix(data, top_features):
    """
    Create a scatterplot matrix using plotly for the top features.
    
    Parameters:
    - data: original pandas DataFrame
    - top_features: list of top feature names
    
    Returns:
    - plotly figure
    """
    # Create subset with only top features
    subset_data = data[top_features]
    
    # Create scatterplot matrix
    fig = px.scatter_matrix(
        subset_data,
        dimensions=top_features,
        title="Scatterplot Matrix of Top Features",
        opacity=0.7
    )
    
    # Update layout
    fig.update_layout(
        height=700,
        width=800
    )
    
    # Update traces for better visibility
    fig.update_traces(
        diagonal_visible=True,
        showupperhalf=True,
        marker=dict(size=5)
    )
    
    return fig

def create_dash_app(data):
    """
    Create a Dash app for interactive PCA visualization.
    
    Parameters:
    - data: pandas DataFrame with numerical features
    """
    # Perform PCA
    pca_results = perform_pca(data)
    
    # Create Dash app
    app = dash.Dash(__name__)
    
    # Define layout
    app.layout = html.Div([
        html.H1("Interactive PCA Visualization", style={'textAlign': 'center'}),
        
        html.Div([
            html.H3("Task 1: PCA Dimension Reduction", style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Select Intrinsic Dimensionality (di):"),
                dcc.Slider(
                    id='dimensionality-slider',
                    min=1,
                    max=len(pca_results['explained_variance_ratio']),
                    value=2,
                    marks={i+1: str(i+1) for i in range(len(pca_results['explained_variance_ratio']))},
                    step=1
                ),
                html.Div(id='slider-output-container')
            ], style={'marginBottom': '20px'}),
            
            dcc.Graph(id='scree-plot', figure=create_scree_plot(pca_results)),
            
            dcc.Graph(id='biplot', figure=create_biplot(pca_results))
        ]),
        
        html.Div([
            html.H3("Task 2: Top Feature Analysis", style={'marginTop': '30px', 'marginBottom': '20px'}),
            
            html.Div(id='top-features-container', style={'marginBottom': '20px'}),
            
            dcc.Graph(id='scatterplot-matrix')
        ])
    ], style={'maxWidth': '1200px', 'margin': '0 auto', 'padding': '20px'})
    
    # Define callbacks
    @app.callback(
        [Output('scree-plot', 'figure'),
         Output('slider-output-container', 'children'),
         Output('top-features-container', 'children'),
         Output('scatterplot-matrix', 'figure')],
        [Input('dimensionality-slider', 'value')]
    )
    def update_visualizations(selected_dim):
        # Update scree plot with selected dimensionality
        fig_scree = create_scree_plot(pca_results)
        
        # Add vertical line for selected dimensionality
        fig_scree.add_vline(
            x=selected_dim, 
            line_dash="dash", 
            line_color="green",
            annotation_text=f"Selected di: {selected_dim}",
            annotation_position="top right"
        )
        
        # Add horizontal line for cumulative variance at selected dim
        cum_var = np.cumsum(pca_results['explained_variance_ratio'])[selected_dim-1]
        fig_scree.add_hline(
            y=cum_var,
            line_dash="dot",
            line_color="green",
            secondary_y=True,
            annotation_text=f"{cum_var:.2%} variance explained",
            annotation_position="left"
        )
        
        # Get top features
        top_features_df = find_top_features(pca_results, selected_dim)
        
        # Create data table for top features
        table = dash_table.DataTable(
            id='top-features-table',
            columns=[
                {"name": "Feature", "id": "Feature"},
                {"name": "Squared Sum of Loadings", "id": "Squared Sum of Loadings", "type": "numeric", "format": {"specifier": ".4f"}}
            ],
            data=top_features_df.to_dict('records'),
            sort_action="native",
            style_header={
                'backgroundColor': 'rgb(230, 230, 230)',
                'fontWeight': 'bold'
            },
            style_cell={
                'padding': '10px',
                'textAlign': 'left'
            }
        )
        
        # Create scatterplot matrix
        top_features = top_features_df['Feature'].tolist()
        fig_scatter = create_scatterplot_matrix(data, top_features)
        
        # Return all updated components
        return (
            fig_scree, 
            f"Selected intrinsic dimensionality (di): {selected_dim}", 
            html.Div([
                html.H4("Top 4 Features with Highest Squared Sum of PCA Loadings"),
                table
            ]),
            fig_scatter
        )
    
    return app

# Example usage with sample data
def generate_sample_data(n_samples=100, n_features=10):
    """Generate sample data for demonstration."""
    np.random.seed(42)
    X = np.random.randn(n_samples, n_features)
    
    # Add some correlation between features
    X[:, 1] = X[:, 0] + np.random.randn(n_samples) * 0.5
    X[:, 2] = X[:, 0] + X[:, 1] + np.random.randn(n_samples) * 0.3
    X[:, 3] = X[:, 2] + np.random.randn(n_samples) * 0.2
    
    # Create a DataFrame
    feature_names = [f'Feature_{i+1}' for i in range(n_features)]
    df = pd.DataFrame(X, columns=feature_names)
    
    return df

# Main function to run the app
def main():
    # Load data (replace with your own data)
    data = pd.read_csv("games.csv")
    
    # Create and run the Dash app
    app = create_dash_app(data)
    return app

if __name__ == "__main__":
    app = main()
    app.run_server(debug=True)