
import sys
import os
import pandas as pd

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import models
from forecasting import DemandForecaster

def test_accuracy():
    db = SessionLocal()
    try:
        # Get a product with sales
        products = db.query(models.Product).all()
        target_product = None
        for p in products:
            # Check if it has order items
            count = db.query(models.OrderItem).filter(models.OrderItem.product_id == p.id).count()
            if count > 10:
                target_product = p
                break
        
        if not target_product:
            print("No product with enough sales found. Please run generate_demo_data.py.")
            return

        print(f"Testing accuracy for product: {target_product.name} (ID: {target_product.id})")
        
        forecaster = DemandForecaster(db)
        
        # 1. Prepare Data
        df = forecaster.prepare_sales_history(target_product.id, days=90)
        print(f"Data loaded: {len(df)} days")
        
        # 2. Engineer Features
        df = forecaster.engineer_features(df)
        print("Features engineered: ", df.columns.tolist())
        
        # 3. Train Models (with Grid Search)
        print("\n--- Starting Training & Tuning ---")
        metrics = forecaster.train_models(df)
        
        print("\n--- Results ---")
        print(f"Best Model: {metrics['best_model']}")
        print(f"Linear Regression RMSE: {metrics['lr_rmse']:.4f}")
        print(f"Random Forest RMSE:     {metrics['rf_rmse']:.4f}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_accuracy()
