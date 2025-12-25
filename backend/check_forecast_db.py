import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import forecast_models
import models

def check_db():
    db = SessionLocal()
    try:
        count = db.query(forecast_models.DemandForecast).count()
        print(f"Total Forecasts in DB: {count}")
        
        products = db.query(models.Product).count()
        print(f"Total Products in DB: {products}")
        
        if count == 0:
            print("WARNING: No forecasts found. Please click 'Sync Data' in the UI.")
        else:
            print("SUCCESS: Forecasts exist in the database.")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
