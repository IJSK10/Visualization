import pandas as pd
import numpy as np

# Load the dataset
try:
    df = pd.read_csv('games.csv')
    print(f"Successfully loaded games.csv with shape: {df.shape}")
    
    # Print all column names
    print("\nAll columns:")
    for i, col in enumerate(df.columns):
        print(f"{i+1}. {col}")
    
    # Identify numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    print(f"\nNumeric columns ({len(numeric_cols)}):")
    for i, col in enumerate(numeric_cols):
        print(f"{i+1}. {col}")
    
    # Check for missing values in numeric columns
    missing_values = df[numeric_cols].isnull().sum()
    cols_with_missing = missing_values[missing_values > 0]
    
    if len(cols_with_missing) > 0:
        print("\nNumeric columns with missing values:")
        print(cols_with_missing)
    else:
        print("\nNo missing values in numeric columns")
    
    # Show sample of numeric data
    print("\nSample of numeric data (first 5 rows):")
    print(df[numeric_cols].head(5))
    
    # Suggest columns for PCA
    print("\nRecommended columns for initial PCA:")
    # Take columns with no missing values, up to 10 columns
    recommended = [col for col in numeric_cols if df[col].isnull().sum() == 0][:10]
    for col in recommended:
        print(f"- {col}")
    
except Exception as e:
    print(f"Error analyzing dataset: {str(e)}")