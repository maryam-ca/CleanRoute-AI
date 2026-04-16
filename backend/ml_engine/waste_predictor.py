"""
Waste Prediction Model using Linear Regression
Prefers real local datasets and complaint history before falling back to generated data.
"""

import pickle
import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = Path(__file__).resolve().parent / 'models'
MODEL_PATH = MODEL_DIR / 'waste_predictor.pkl'


class WastePredictor:
    def __init__(self):
        self.model = None
        self.metrics = {'rmse': None, 'r2': None, 'source': 'uninitialized'}

    def generate_sample_data(self, days=180):
        """Generate fallback waste data when no project data is available."""
        dates = pd.date_range(end=datetime.now().date(), periods=days, freq='D')
        waste = []

        for idx, date in enumerate(dates):
            day_of_week = date.weekday()
            base_waste = 42
            if day_of_week >= 5:
                base_waste = 54
            elif day_of_week == 0:
                base_waste = 58

            seasonal = 4 * np.sin((date.timetuple().tm_yday / 365) * 2 * np.pi)
            waste.append(base_waste + seasonal + random.uniform(-4, 4))

        return pd.DataFrame({
            'date': dates,
            'waste_kg': np.clip(waste, 10, None),
            'source': 'generated_fallback'
        })

    def _load_dataset(self):
        dataset_candidates = [
            PROJECT_ROOT / 'complete_waste_data.csv',
            PROJECT_ROOT / 'backend' / 'ml_engine' / 'complete_waste_data.csv',
        ]

        for dataset_path in dataset_candidates:
            if dataset_path.exists():
                df = pd.read_csv(dataset_path)
                if 'date' not in df.columns:
                    continue
                if 'waste_kg' not in df.columns and 'waste_generated' in df.columns:
                    df = df.rename(columns={'waste_generated': 'waste_kg'})
                if 'waste_kg' in df.columns:
                    df['source'] = str(dataset_path.name)
                    return df

        try:
            from complaints.models import Complaint

            complaint_df = pd.DataFrame(list(
                Complaint.objects.exclude(created_at__isnull=True)
                .values('created_at', 'fill_level_before')
            ))
            if not complaint_df.empty:
                complaint_df['date'] = pd.to_datetime(complaint_df['created_at']).dt.date
                grouped = complaint_df.groupby('date').agg(
                    waste_kg=('fill_level_before', lambda s: float(max(s.sum(), len(s) * 15)))
                ).reset_index()
                grouped['source'] = 'complaints_history'
                return grouped
        except Exception:
            pass

        return self.generate_sample_data()

    def _prepare_training_frame(self, df):
        df = df.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df['waste_kg'] = pd.to_numeric(df['waste_kg'], errors='coerce')
        df = df.dropna(subset=['date', 'waste_kg'])

        if df.empty:
            df = self.generate_sample_data()
            df['date'] = pd.to_datetime(df['date'])

        daily = df.groupby(df['date'].dt.date, as_index=False)['waste_kg'].mean()
        daily['date'] = pd.to_datetime(daily['date'])
        daily['day_of_week'] = daily['date'].dt.dayofweek
        daily['month'] = daily['date'].dt.month
        daily['day'] = daily['date'].dt.day
        daily['is_weekend'] = (daily['day_of_week'] >= 5).astype(int)
        daily['lag_1'] = daily['waste_kg'].shift(1)
        daily['lag_7'] = daily['waste_kg'].shift(7)
        daily['rolling_mean_3'] = daily['waste_kg'].rolling(3, min_periods=1).mean()
        daily['rolling_mean_7'] = daily['waste_kg'].rolling(7, min_periods=1).mean()
        daily = daily.dropna().reset_index(drop=True)

        if daily.empty:
            fallback = self.generate_sample_data()
            return self._prepare_training_frame(fallback)

        return daily

    def train(self):
        """Train the linear regression model from local project data."""
        raw_df = self._load_dataset()
        training_df = self._prepare_training_frame(raw_df)

        feature_cols = [
            'day_of_week', 'month', 'day', 'is_weekend',
            'lag_1', 'lag_7', 'rolling_mean_3', 'rolling_mean_7'
        ]
        X = training_df[feature_cols]
        y = training_df['waste_kg']

        self.model = LinearRegression()
        self.model.fit(X, y)

        y_pred = self.model.predict(X)
        self.metrics = {
            'rmse': float(np.sqrt(mean_squared_error(y, y_pred))),
            'r2': float(r2_score(y, y_pred)) if len(training_df) > 1 else 0.0,
            'source': str(raw_df['source'].iloc[0]) if 'source' in raw_df.columns else 'unknown',
        }

        MODEL_DIR.mkdir(exist_ok=True)
        with MODEL_PATH.open('wb') as f:
            pickle.dump({'model': self.model, 'metrics': self.metrics}, f)

        return self.model

    def _ensure_model(self):
        if self.model is not None:
            if getattr(self.model, 'n_features_in_', 8) != 8:
                self.model = None
                self.train()
            return

        if MODEL_PATH.exists():
            with MODEL_PATH.open('rb') as f:
                saved = pickle.load(f)
                if isinstance(saved, dict):
                    self.model = saved.get('model')
                    self.metrics = saved.get('metrics', self.metrics)
                else:
                    self.model = saved
        if self.model is not None and getattr(self.model, 'n_features_in_', 8) != 8:
            self.model = None
        if self.model is None:
            self.train()

    def predict_future(self, days=7, recent_waste=None):
        """Predict waste for future days."""
        self._ensure_model()

        history_df = self._prepare_training_frame(self._load_dataset())
        history = history_df['waste_kg'].tolist()

        if recent_waste is not None and len(recent_waste) >= 7:
            history = list(recent_waste)

        predictions = []
        history_buffer = history[:]

        for i in range(days):
            target_date = datetime.now().date() + timedelta(days=i + 1)
            last_value = history_buffer[-1]
            lag_7 = history_buffer[-7] if len(history_buffer) >= 7 else history_buffer[0]
            rolling_mean_3 = float(np.mean(history_buffer[-3:]))
            rolling_mean_7 = float(np.mean(history_buffer[-7:]))

            features = np.array([[
                target_date.weekday(),
                target_date.month,
                target_date.day,
                1 if target_date.weekday() >= 5 else 0,
                last_value,
                lag_7,
                rolling_mean_3,
                rolling_mean_7,
            ]])

            feature_frame = pd.DataFrame(features, columns=[
                'day_of_week', 'month', 'day', 'is_weekend',
                'lag_1', 'lag_7', 'rolling_mean_3', 'rolling_mean_7'
            ])

            pred = float(self.model.predict(feature_frame)[0])
            pred = max(5.0, round(pred, 1))
            predictions.append(pred)
            history_buffer.append(pred)

        return predictions

    def get_forecast(self, days=7):
        predictions = self.predict_future(days)
        return {
            'forecast': predictions,
            'days': days,
            'total': round(sum(predictions), 1),
            'average': round(sum(predictions) / days, 1),
            'peak': max(predictions),
            'peak_day': predictions.index(max(predictions)) + 1,
            'unit': 'kg',
            'rmse': self.metrics.get('rmse'),
            'r2': self.metrics.get('r2'),
            'source': self.metrics.get('source'),
        }


if __name__ == "__main__":
    predictor = WastePredictor()
    predictor.train()
    forecast = predictor.get_forecast(7)
    print(f"\n7-Day Forecast: {forecast['forecast']}")
