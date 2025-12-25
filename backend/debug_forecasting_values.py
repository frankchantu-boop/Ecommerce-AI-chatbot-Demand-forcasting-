from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pandas as pd
import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from backend import models, forecasting, database

def debug_products():
    db = database.SessionLocal()
    forecaster = forecasting.DemandForecaster(db)
    
    products = db.query(models.Product).limit(5).all()
    
    print(f"Checking {len(products)} products...")
    
    for product in products:
        print(f"\n--- Product: {product.name} (ID: {product.id}) ---")
        df = forecaster.prepare_sales_history(product.id, days=60)
        total_sales = df['sales'].sum()
        print(f"Total Sales (Last 60 Days): {total_sales}")
        
        if total_sales > 0:
            df_eng = forecaster.engineer_features(df)
            df_eng = df_eng.fillna(0)
            
            # Show last 3 rows of features
            cols = ['sales', 'rolling_mean_7', 'rolling_mean_30', 'sales_lag_7']
            print("Last 3 rows of features:")
            print(df_eng[cols].tail(3))
            
            # Predict
            try:
                # Train
                metrics = forecaster.train_models(df_eng)
                print(f"Model Metrics: {metrics}")
                
                # Predict Future
                future = forecaster.predict_future(df_eng, days_ahead=7)
                pred_sum = future['predicted_demand'].sum()
                print(f"7-Day Forecast Sum: {pred_sum}")
                print(f"First 3 predictions: {future['predicted_demand'].tolist()[:3]}")
            except Exception as e:
                print(f"Prediction Error: {e}")
        else:
            print("No sales to analyze.")

if __name__ == "__main__":
    debug_products()
