import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class ComplaintClassifier:
    def __init__(self):
        self.type_classifier = None  # Naive Bayes for complaint type
        self.priority_classifier = None  # Decision Tree for priority
        self.type_encoders = {}
        self.priority_encoders = {}
        
    def prepare_features(self, df):
        """Prepare features for training"""
        
        # Encode categorical variables
        categorical_cols = ['complaint_type', 'area', 'day_of_week', 'weather']
        
        for col in categorical_cols:
            le = LabelEncoder()
            df[col + '_encoded'] = le.fit_transform(df[col])
            self.type_encoders[col] = le
        
        # Features for type classification
        type_features = ['area_encoded', 'day_of_week_encoded', 'weather_encoded', 
                        'population_density', 'distance_to_bin_km', 
                        'hours_since_last_collection', 'near_sensitive_area']
        
        # Features for priority classification
        priority_features = ['complaint_type_encoded', 'area_encoded', 'day_of_week_encoded',
                            'weather_encoded', 'population_density', 'hours_since_last_collection',
                            'near_sensitive_area']
        
        return type_features, priority_features
    
    def train(self, data_path='complaint_dataset.csv'):
        """Train both classification models"""
        
        print("Loading dataset...")
        df = pd.read_csv(data_path)
        
        # Prepare features
        type_features, priority_features = self.prepare_features(df)
        
        # Train Complaint Type Classifier (Naive Bayes)
        print("Training Complaint Type Classifier...")
        X_type = df[type_features]
        y_type = df['complaint_type']
        
        X_type_train, X_type_test, y_type_train, y_type_test = train_test_split(
            X_type, y_type, test_size=0.2, random_state=42
        )
        
        self.type_classifier = GaussianNB()
        self.type_classifier.fit(X_type_train, y_type_train)
        
        y_type_pred = self.type_classifier.predict(X_type_test)
        type_accuracy = accuracy_score(y_type_test, y_type_pred)
        print(f"Type Classification Accuracy: {type_accuracy:.4f}")
        
        # Train Priority Classifier (Decision Tree)
        print("Training Priority Classifier...")
        
        # Encode priority labels
        priority_le = LabelEncoder()
        y_priority = priority_le.fit_transform(df['priority'])
        self.priority_encoders['priority'] = priority_le
        
        X_priority = df[priority_features]
        
        X_priority_train, X_priority_test, y_priority_train, y_priority_test = train_test_split(
            X_priority, y_priority, test_size=0.2, random_state=42
        )
        
        self.priority_classifier = DecisionTreeClassifier(max_depth=10, random_state=42)
        self.priority_classifier.fit(X_priority_train, y_priority_train)
        
        y_priority_pred = self.priority_classifier.predict(X_priority_test)
        priority_accuracy = accuracy_score(y_priority_test, y_priority_pred)
        print(f"Priority Classification Accuracy: {priority_accuracy:.4f}")
        
        # Save models
        self.save_models()
        
        return {
            'type_accuracy': type_accuracy,
            'priority_accuracy': priority_accuracy
        }
    
    def predict_complaint_type(self, features):
        """Predict complaint type from features"""
        # Prepare feature vector
        feature_vector = np.array([[
            self.type_encoders['area'].transform([features['area']])[0],
            self.type_encoders['day_of_week'].transform([features['day_of_week']])[0],
            self.type_encoders['weather'].transform([features['weather']])[0],
            features['population_density'],
            features['distance_to_bin_km'],
            features['hours_since_collection'],
            features['near_sensitive']
        ]])
        
        prediction = self.type_classifier.predict(feature_vector)[0]
        probabilities = self.type_classifier.predict_proba(feature_vector)[0]
        confidence = max(probabilities)
        
        return prediction, confidence
    
    def predict_priority(self, features):
        """Predict priority level from features"""
        feature_vector = np.array([[
            self.type_encoders['complaint_type'].transform([features['complaint_type']])[0],
            self.type_encoders['area'].transform([features['area']])[0],
            self.type_encoders['day_of_week'].transform([features['day_of_week']])[0],
            self.type_encoders['weather'].transform([features['weather']])[0],
            features['population_density'],
            features['hours_since_collection'],
            features['near_sensitive']
        ]])
        
        prediction_encoded = self.priority_classifier.predict(feature_vector)[0]
        prediction = self.priority_encoders['priority'].inverse_transform([prediction_encoded])[0]
        
        probabilities = self.priority_classifier.predict_proba(feature_vector)[0]
        confidence = max(probabilities)
        
        return prediction, confidence
    
    def save_models(self):
        """Save trained models"""
        os.makedirs('ml_models', exist_ok=True)
        joblib.dump(self.type_classifier, 'ml_models/type_classifier.pkl')
        joblib.dump(self.priority_classifier, 'ml_models/priority_classifier.pkl')
        joblib.dump(self.type_encoders, 'ml_models/type_encoders.pkl')
        joblib.dump(self.priority_encoders, 'ml_models/priority_encoders.pkl')
        print("Models saved successfully!")
    
    def load_models(self):
        """Load trained models"""
        self.type_classifier = joblib.load('ml_models/type_classifier.pkl')
        self.priority_classifier = joblib.load('ml_models/priority_classifier.pkl')
        self.type_encoders = joblib.load('ml_models/type_encoders.pkl')
        self.priority_encoders = joblib.load('ml_models/priority_encoders.pkl')
        print("Models loaded successfully!")

if __name__ == "__main__":
    classifier = ComplaintClassifier()
    classifier.train()