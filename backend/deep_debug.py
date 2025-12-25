import os
import sys
import pandas as pd
import numpy as np

# Adjust path to handle backend imports
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    import database
    import models
    import forecasting
    import forecast_models
except ImportError as e:
    print(f"Import Error: {e}")
    # Fallback to absolute imports if needed
    from backend import database, models, forecasting, forecast_models

def run_deep_debug():
    db = database.SessionLocal()
    forecaster = forecasting.DemandForecaster(db)
    
    # Get products that actually have some sales history
    products = db.query(models.Product).limit(5).all()
    
    for product in products:
        print(f"\n==========================================")
        print(f"PRODUCT: {product.name} (ID: {product.id})")
        print(f"CURRENT STOCK: {product.stock_quantity}")
        
        # 1. Check Sales History
        df = forecaster.prepare_sales_history(product.id, days=60)
        total_sales = df['sales'].sum()
        print(f"TOTAL SALES (60d): {total_sales}")
        
        if total_sales == 0:
            print("SKIPPING: No sales history. Forecast will naturally be 0.")
            continue
            
        # 2. Check Features
        df_eng = forecaster.engineer_features(df)
        df_eng = df_eng.fillna(0)
        
        # 3. Check training data points
        valid_rows = len(df_eng)
        print(f"TRAINING ROWS: {valid_rows}")
        
        # 4. Generate Forecast
        result = forecaster.generate_forecasts(product.id)
        
        if result:
            print(f"MODEL USED: {result['model_used']}")
            preds = result['predictions']
            pred_values = [p['predicted_demand'] for p in preds]
            print(f"DAILY PREDICTIONS (First 10): {pred_values[:10]}")
            print(f"SUM OF PREDICTIONS (30d): {sum(pred_values)}")
            
            if sum(pred_values) == 0:
                print("!!! ALERT: ZERO FORECAST DETECTED DESPITE HISTORY !!!")
                # Inspect model weights if linear
                if forecaster.best_model_name == 'linear_regression':
                    print(f"LR Coefs: {forecaster.lr_model.coef_}")
                    print(f"LR Intercept: {forecaster.lr_model.intercept_}")
        else:
            print("FORECAST GENERATION FAILED (returned None)")

if __name__ == "__main__":
    run_deep_debug()
