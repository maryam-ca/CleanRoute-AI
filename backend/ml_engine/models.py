from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
import joblib
import os

class WasteMLModels:
    def __init__(self):
        self.naive_bayes = None
        self.decision_tree = None
        self.kmeans = None
        self.linear_reg = None
        
    def train_naive_bayes(self, X_train, y_train):
        """Complaint type classification"""
        self.naive_bayes = GaussianNB()
        self.naive_bayes.fit(X_train, y_train)
        joblib.dump(self.naive_bayes, 'ml_models/naive_bayes.pkl')
        return self.naive_bayes
    
    def train_decision_tree(self, X_train, y_train):
        """Priority detection (urgent/normal)"""
        self.decision_tree = DecisionTreeClassifier()
        self.decision_tree.fit(X_train, y_train)
        joblib.dump(self.decision_tree, 'ml_models/decision_tree.pkl')
        return self.decision_tree
    
    def train_kmeans(self, locations, n_clusters=5):
        """Route optimization"""
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.kmeans.fit(locations)
        joblib.dump(self.kmeans, 'ml_models/kmeans.pkl')
        return self.kmeans
    
    def train_linear_regression(self, X_train, y_train):
        """Waste prediction"""
        self.linear_reg = LinearRegression()
        self.linear_reg.fit(X_train, y_train)
        joblib.dump(self.linear_reg, 'ml_models/linear_reg.pkl')
        return self.linear_reg