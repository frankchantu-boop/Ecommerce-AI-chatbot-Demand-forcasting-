import sys
import os

# Fix for Windows uvicorn reloader finding logic
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import SessionLocal, engine
from pydantic import BaseModel
import forecasting
import forecast_models
import chatbot

# Create the database tables
models.Base.metadata.create_all(bind=engine)
forecast_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce AI Backend")

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-commerce AI Backend"}

@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product



# --- Admin Endpoints ---

class LoginRequest(BaseModel):
    email: str
    password: str

class OrderStats(BaseModel):
    total_sales: float
    monthly_sales: float
    total_orders: int
    total_products: int
    recent_orders: List[schemas.Order]

@app.post("/admin/login")
def admin_login(login: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=login.email)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Simple password check (matching seed.py logic)
    fake_hashed_password = login.password + "notreallyhashed"
    if user.hashed_password != fake_hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized as admin")
        
    return {"token": "fake-jwt-token-for-admin", "user_email": user.email}

@app.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_order(db=db, order=order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # In a real app, verify admin token here
    orders = db.query(models.Order).order_by(models.Order.id.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/admin/stats", response_model=OrderStats)
def get_admin_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from datetime import datetime
    
    # 1. Basic counts
    total_orders = db.query(func.count(models.Order.id)).scalar()
    total_products = db.query(func.count(models.Product.id)).scalar()
    
    # 2. Total Sales
    total_sales = db.query(func.sum(models.Order.total_amount)).scalar() or 0
    
    # 3. Monthly Sales
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    monthly_sales = db.query(func.sum(models.Order.total_amount))\
        .filter(models.Order.created_at >= month_start).scalar() or 0
    
    # 4. Recent Orders (Latest 10)
    recent_orders = db.query(models.Order).order_by(models.Order.id.desc()).limit(10).all()
    
    return {
        "total_sales": total_sales,
        "monthly_sales": monthly_sales,
        "total_orders": total_orders,
        "total_products": total_products,
        "recent_orders": recent_orders
    }

@app.put("/orders/{order_id}/status", response_model=schemas.Order)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    db_order = crud.update_order_status(db, order_id, status_update.status)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    success = crud.delete_order(db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Basic cleanup: remove trailing/leading spaces from name
    if product_update.name:
        product_update.name = product_update.name.strip()
        
    for key, value in product_update.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# --- AI Chatbot Endpoint ---

class ChatRequest(BaseModel):
    message: str

@app.post("/chat/message")
def chat_message(chat: ChatRequest, db: Session = Depends(get_db)):
    # 1. Get response from Gemini (with RAG context)
    ai_reply = chatbot.get_chat_response(db, chat.message)
    return {"reply": ai_reply}


# --- Demand Forecasting Endpoints ---

@app.post("/forecasting/train")
def train_forecasting_models(db: Session = Depends(get_db)):
    """Train ML models for all products"""
    try:
        # Create tables if they don't exist
        # forecast_models.Base.metadata.create_all(bind=engine) # Already done at startup
        
        results = forecasting.train_all_products(db)
        return {
            "message": "Forecasting models trained successfully",
            "products_trained": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecasting/predictions")
def get_all_predictions(db: Session = Depends(get_db)):
    """Get predictions for all products, returning empty predictions for those without history"""
    # 1. Get ALL products first
    products = db.query(models.Product).all()
    
    # 2. Get ALL forecasts
    forecasts = db.query(forecast_models.DemandForecast).all()
    
    # 3. Optimize lookup
    forecast_map = {}
    for f in forecasts:
        if f.product_id not in forecast_map:
            forecast_map[f.product_id] = []
        
        forecast_map[f.product_id].append({
            "date": f.forecast_date.isoformat(),
            "predicted_demand": f.predicted_demand,
            "confidence_lower": f.confidence_lower,
            "confidence_upper": f.confidence_upper,
            "model_used": f.model_used
        })
    
    # 4. Construct response including ALL products
    results = []
    for product in products:
        results.append({
            "product_id": product.id,
            "product_name": product.name,
            "current_stock": product.stock_quantity,
            "predictions": forecast_map.get(product.id, [])  # Empty list if no forecasts
        })
    
    return results


@app.get("/forecasting/predictions/{product_id}")
def get_product_predictions(product_id: int, db: Session = Depends(get_db)):
    """Get predictions for a specific product"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    forecasts = db.query(forecast_models.DemandForecast).filter(
        forecast_models.DemandForecast.product_id == product_id
    ).order_by(forecast_models.DemandForecast.forecast_date).all()
    
    predictions = [{
        "date": f.forecast_date.isoformat(),
        "predicted_demand": f.predicted_demand,
        "confidence_lower": f.confidence_lower,
        "confidence_upper": f.confidence_upper,
        "model_used": f.model_used
    } for f in forecasts]
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "current_stock": product.stock_quantity,
        "predictions": predictions
    }


@app.get("/forecasting/alerts")
def get_stock_alerts(db: Session = Depends(get_db)):
    """Get all active stock alerts"""
    alerts = db.query(forecast_models.StockAlert).filter(
        forecast_models.StockAlert.status == "active"
    ).order_by(forecast_models.StockAlert.alert_type).all()
    
    return [{
        "id": a.id,
        "product_id": a.product_id,
        "product_name": a.product.name if a.product else "Unknown",
        "alert_type": a.alert_type,
        "message": a.message,
        "recommended_order_qty": a.recommended_order_qty,
        "days_until_stockout": a.days_until_stockout,
        "created_at": a.created_at.isoformat()
    } for a in alerts]


@app.put("/forecasting/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    """Dismiss a stock alert"""
    alert = db.query(forecast_models.StockAlert).filter(
        forecast_models.StockAlert.id == alert_id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "dismissed"
    db.commit()
    
    return {"message": "Alert dismissed successfully"}


@app.get("/forecasting/trends/{product_id}")
def get_product_trends(product_id: int, days: int = 60, db: Session = Depends(get_db)):
    """Get historical sales trends for a product"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    forecaster = forecasting.DemandForecaster(db)
    df = forecaster.prepare_sales_history(product_id, days=days)
    
    trends = [{
        "date": row['date'].isoformat(),
        "sales": int(row['sales'])
    } for _, row in df.iterrows()]
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "trends": trends
    }


