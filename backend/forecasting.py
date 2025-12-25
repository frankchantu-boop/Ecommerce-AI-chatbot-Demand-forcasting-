"""
Demand Forecasting Engine using Linear Regression and Random Forest
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sqlalchemy.orm import Session
import models
import forecast_models


class DemandForecaster:
    """ML-based demand forecasting for inventory management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.lr_model = LinearRegression()
        self.rf_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
        self.best_model = None
        self.best_model_name = None
        
    def prepare_sales_history(self, product_id: int, days: int = 60) -> pd.DataFrame:
        """
        Extract and prepare sales history for a product
        """
        # Get orders from last 'days' days
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Query order items for this product
        order_items = self.db.query(
            models.OrderItem
        ).join(
            models.Order
        ).filter(
            models.OrderItem.product_id == product_id,
            models.Order.created_at >= cutoff_date
        ).all()
        
        # Aggregate by date
        sales_by_date = {}
        for item in order_items:
            date = item.order.created_at.date()
            if date not in sales_by_date:
                sales_by_date[date] = 0
            sales_by_date[date] += item.quantity
        
        # Create date range and fill missing dates with 0
        start_date = cutoff_date.date()
        end_date = datetime.utcnow().date()
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        df = pd.DataFrame({'date': date_range})
        df['sales'] = df['date'].apply(lambda x: sales_by_date.get(x.date(), 0))
        
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features for ML models
        """
        df = df.copy()
        
        # Time-based features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['day_of_month'] = df['date'].dt.day
        
        # Long-term Lag features (Stable Trends)
        df['sales_lag_7'] = df['sales'].shift(7).fillna(0)
        df['sales_lag_14'] = df['sales'].shift(14).fillna(0)
        df['sales_lag_30'] = df['sales'].shift(30).fillna(0)

        # Rolling statistics (Previous Multiple Days)
        df['rolling_mean_3'] = df['sales'].rolling(window=3, min_periods=1).mean()
        df['rolling_mean_5'] = df['sales'].rolling(window=5, min_periods=1).mean()
        df['rolling_mean_7'] = df['sales'].rolling(window=7, min_periods=1).mean()
        df['rolling_mean_30'] = df['sales'].rolling(window=30, min_periods=1).mean()
        df['rolling_mean_60'] = df['sales'].rolling(window=60, min_periods=1).mean()
        df['rolling_std_7'] = df['sales'].rolling(window=7, min_periods=1).std().fillna(0)
        
        # Trend
        df['trend'] = range(len(df))
        
        return df
    
    def train_models(self, df: pd.DataFrame):
        """
        Train both Linear Regression and Random Forest models
        """
        # Fill NaNs with 0 instead of dropping to allow training on limited history
        df = df.fillna(0)
        
        if len(df) < 7:  # Lowered requirement from 20 to 7 days
            print("⚠️ Warning: Very limited data history for training (< 7 days)")
            # Try to proceed but results might be flat
            
        # Features and target
        feature_cols = ['day_of_week', 'month', 'is_weekend', 'day_of_month',
                       'sales_lag_7', 'sales_lag_14', 'sales_lag_30',
                       'rolling_mean_3', 'rolling_mean_5',
                       'rolling_mean_7', 'rolling_mean_30', 'rolling_mean_60', 'rolling_std_7', 'trend']
        
        X = df[feature_cols]
        y = df['sales']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # Train Linear Regression
        self.lr_model.fit(X_train, y_train)
        lr_pred = self.lr_model.predict(X_test)
        lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
        lr_mae = mean_absolute_error(y_test, lr_pred)
        lr_r2 = r2_score(y_test, lr_pred)
        
        # Optimize Random Forest with Grid Search
        print(">> Tuning Random Forest Hyperparameters...")
        param_grid = {
            'n_estimators': [50, 100],
            'max_depth': [10, None],
            'min_samples_split': [5]
        }
        
        tscv = TimeSeriesSplit(n_splits=3)
        grid_search = GridSearchCV(estimator=self.rf_model, param_grid=param_grid, 
                                   cv=tscv, scoring='neg_mean_squared_error', n_jobs=1) # n_jobs=1 to avoid concurrency issues
        grid_search.fit(X_train, y_train)
        
        self.rf_model = grid_search.best_estimator_
        print(f">> Best RF Params: {grid_search.best_params_}")
        
        rf_pred = self.rf_model.predict(X_test)
        rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
        rf_mae = mean_absolute_error(y_test, rf_pred)
        rf_r2 = r2_score(y_test, rf_pred)
        
        # Select best model (lower RMSE is better)
        if lr_rmse <= rf_rmse:
            self.best_model = self.lr_model
            self.best_model_name = "linear_regression"
            print(f">> Linear Regression selected (RMSE: {lr_rmse:.2f}, MAE: {lr_mae:.2f}, R2: {lr_r2:.2f})")
        else:
            self.best_model = self.rf_model
            self.best_model_name = "random_forest"
            print(f">> Random Forest selected (RMSE: {rf_rmse:.2f}, MAE: {rf_mae:.2f}, R2: {rf_r2:.2f})")
        
        return {
            'lr_rmse': lr_rmse, 'lr_mae': lr_mae, 'lr_r2': lr_r2,
            'rf_rmse': rf_rmse, 'rf_mae': rf_mae, 'rf_r2': rf_r2,
            'best_model': self.best_model_name
        }
    
    def predict_future(self, df: pd.DataFrame, days_ahead: int = 30) -> pd.DataFrame:
        """
        Generate future predictions
        """
        predictions = []
        last_date = df['date'].max()
        
        feature_cols = ['day_of_week', 'month', 'is_weekend', 'day_of_month',
                       'sales_lag_7', 'sales_lag_14', 'sales_lag_30',
                       'rolling_mean_3', 'rolling_mean_5',
                       'rolling_mean_7', 'rolling_mean_30', 'rolling_mean_60', 'rolling_std_7', 'trend']

        # Use last row as base for predictions
        last_row = df.iloc[-1].copy()
        
        for i in range(1, days_ahead + 1):
            future_date = last_date + timedelta(days=i)
            
            # Create features for future date
            # Logic to fetch lags from 'predictions' list if we are far enough in future, else from history
            
            def get_lag_val(lag_days):
                if i <= lag_days:
                    # Look back in history
                    # We need the value from (last_date + i - lag_days)
                    # We can pick from df if it's there, or it's last_row's lags?
                    # Simplified: Use df tail logic or last_row shifting
                    # Ideally we maintain a 'rolling history' list
                    return last_row['sales'] if lag_days == 1 else last_row[f'sales_lag_{lag_days-1}'] # Approximation for simplicity
                else:
                    return predictions[i - lag_days - 1]['predicted_demand']

            # More robust lag retrieval
            # We construct a synthetic history array: [past_sales..., pred_1, pred_2, ...]
            # For simplicity in this function, we stick to the basic shift logic but updated for new lags
            
            # Helper to get value from N days ago (0-indexed relative to future_time)
            # future_date is index 'len(df) + i - 1'
            # value at 'len(df)' is pred[0]
            
            features = {
                'day_of_week': future_date.dayofweek,
                'month': future_date.month,
                'is_weekend': 1 if future_date.dayofweek >= 5 else 0,
                'day_of_month': future_date.day,
                'sales_lag_7': last_row['sales'] if i <= 7 else predictions[-7]['predicted_demand'],
                'sales_lag_14': last_row['sales_lag_7'] if i <= 14 else predictions[-14]['predicted_demand'],
                'sales_lag_30': last_row['sales_lag_14'] if i <= 30 else predictions[-30]['predicted_demand'],
                'rolling_mean_3': last_row.get('rolling_mean_3', 0),
                'rolling_mean_5': last_row.get('rolling_mean_5', 0),
                'rolling_mean_7': last_row.get('rolling_mean_7', 0),
                'rolling_mean_30': last_row.get('rolling_mean_30', 0),
                'rolling_mean_60': last_row.get('rolling_mean_60', 0),
                'rolling_std_7': last_row.get('rolling_std_7', 0),
                'trend': last_row['trend'] + i
            }
            
            # Predict
            X_future = pd.DataFrame([features])
            X_future = X_future[feature_cols]
            pred = self.best_model.predict(X_future)[0]

            # --- NAIVE FALLBACK (The Zero-Fixer) ---
            # If the ML model is too conservative and predicts 0, 
            # but the product has a 60-day history (rolling_mean_60 > 0),
            # fall back to the 60-day average so we don't show 0.
            history_signal = last_row.get('rolling_mean_60', 0)
            if pred < 0.05 and history_signal > 0:
                pred = history_signal * 0.95 # Use 95% of history as a safe floor
            # ---------------------------------------
            
            # --- REALISM FILTER (Growth Damping) ---
            max_hist_daily = df['sales'].max() if not df.empty else 1
            growth_cap = max(max_hist_daily * 1.8, 10) 
            pred = min(max(0, pred), growth_cap) 
            
            # Confidence interval
            std = last_row['rolling_std_7']
            
            predictions.append({
                'date': future_date,
                'predicted_demand': float(pred),
                'confidence_lower': float(max(0, pred - std)),
                'confidence_upper': float(pred + std)
            })
        
        return pd.DataFrame(predictions)
    
    def generate_forecasts(self, product_id: int, forecast_days: int = 30):
        """
        Complete forecasting pipeline for a product
        """
        try:
            # Step 1: Prepare data
            df = self.prepare_sales_history(product_id, days=60)
            
            if df['sales'].sum() == 0:
                print(f"[WARN] No sales history for product {product_id}")
                return None
            
            # Step 2: Engineer features
            df = self.engineer_features(df)
            
            # Step 3: Train models
            metrics = self.train_models(df)
            
            # Step 4: Generate predictions
            predictions_df = self.predict_future(df, days_ahead=forecast_days)
            
            # Step 5: Save to database
            self.save_forecasts(product_id, predictions_df)
            
            return {
                'product_id': product_id,
                'model_used': self.best_model_name,
                'metrics': metrics,
                'predictions': predictions_df.to_dict('records')
            }
            
        except Exception as e:
            print(f"[ERROR] forecasting for product {product_id}: {e}")
            return None
    
    def save_forecasts(self, product_id: int, predictions_df: pd.DataFrame):
        """
        Save predictions to database
        """
        # Delete old forecasts for this product
        self.db.query(forecast_models.DemandForecast).filter(
            forecast_models.DemandForecast.product_id == product_id
        ).delete()
        
        # Insert new forecasts
        for _, row in predictions_df.iterrows():
            forecast = forecast_models.DemandForecast(
                product_id=product_id,
                forecast_date=row['date'],
                predicted_demand=row['predicted_demand'],
                confidence_lower=row['confidence_lower'],
                confidence_upper=row['confidence_upper'],
                model_used=self.best_model_name
            )
            self.db.add(forecast)
        
        self.db.commit()
    
    def generate_stock_alerts(self, product_id: int):
        """
        Generate stock alerts based on predictions
        """
        product = self.db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            return
        
        # Get predictions for next 30 days
        forecasts = self.db.query(forecast_models.DemandForecast).filter(
            forecast_models.DemandForecast.product_id == product_id
        ).order_by(forecast_models.DemandForecast.forecast_date).limit(30).all()
        
        if not forecasts:
            return
        
        # Calculate total predicted demand
        total_demand_7 = sum([f.predicted_demand for f in forecasts[:7]])
        total_demand_14 = sum([f.predicted_demand for f in forecasts[:14]])
        total_demand_30 = sum([f.predicted_demand for f in forecasts[:30]])
        
        current_stock = product.stock_quantity
        
        # Calculate days until stockout
        avg_daily_demand = total_demand_30 / 30 if total_demand_30 > 0 else 0
        days_until_stockout = current_stock / avg_daily_demand if avg_daily_demand > 0 else 999
        
        # Delete old alerts for this product
        self.db.query(forecast_models.StockAlert).filter(
            forecast_models.StockAlert.product_id == product_id,
            forecast_models.StockAlert.status == "active"
        ).delete()
        
        # Generate alert if needed
        alert_type = None
        message = None
        recommended_qty = 0
        
        if days_until_stockout < 7:
            alert_type = "critical"
            message = f"🚨 CRITICAL: {product.name} will run out in {int(days_until_stockout)} days!"
            recommended_qty = int(round(total_demand_30))
        elif days_until_stockout < 14:
            alert_type = "warning"
            message = f"⚠️ WARNING: {product.name} stock low. {int(days_until_stockout)} days remaining."
            recommended_qty = int(round(total_demand_30))
        elif days_until_stockout < 30:
            alert_type = "info"
            message = f"ℹ️ INFO: {product.name} - Consider reordering soon."
            recommended_qty = int(round(total_demand_30))
        
        if alert_type:
            alert = forecast_models.StockAlert(
                product_id=product_id,
                alert_type=alert_type,
                message=message,
                recommended_order_qty=recommended_qty,
                days_until_stockout=int(days_until_stockout)
            )
            self.db.add(alert)
            self.db.commit()


def train_all_products(db: Session):
    """
    Train forecasting models for all products
    """
    forecaster = DemandForecaster(db)
    products = db.query(models.Product).all()
    
    results = []
    for product in products:
        print(f"\n📊 Training model for: {product.name}")
        result = forecaster.generate_forecasts(product.id, forecast_days=30)
        if result:
            forecaster.generate_stock_alerts(product.id)
            results.append(result)
    
    return results
