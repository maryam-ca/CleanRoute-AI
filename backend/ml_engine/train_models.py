import pandas as pd
import numpy as np
from models import WasteMLModels

# Sample training data (replace with real data later)
def generate_sample_data():
    # For Naive Bayes - complaint classification
    X_nb = np.random.rand(1000, 5)  # 5 features: image_quality, description_length, etc.
    y_nb = np.random.randint(0, 3, 1000)  # 3 complaint types
    
    # For Decision Tree - priority
    X_dt = np.random.rand(1000, 4)  # features: distance_to_school, distance_to_hospital, etc.
    y_dt = np.random.randint(0, 2, 1000)  # 0=normal, 1=urgent
    
    # For K-Means - locations (latitude, longitude)
    locations = np.random.rand(200, 2) * 180 - 90  # random coordinates
    
    # For Linear Regression - waste prediction
    X_lr = np.random.rand(500, 3)  # features: day_of_week, population_density, etc.
    y_lr = np.random.rand(500) * 100  # waste amount in kg
    
    return X_nb, y_nb, X_dt, y_dt, locations, X_lr, y_lr

if __name__ == "__main__":
    ml = WasteMLModels()
    X_nb, y_nb, X_dt, y_dt, locations, X_lr, y_lr = generate_sample_data()
    
    print("Training Naive Bayes...")
    ml.train_naive_bayes(X_nb, y_nb)
    
    print("Training Decision Tree...")
    ml.train_decision_tree(X_dt, y_dt)
    
    print("Training K-Means...")
    ml.train_kmeans(locations)
    
    print("Training Linear Regression...")
    ml.train_linear_regression(X_lr, y_lr)
    
    print("All models trained and saved!")
    