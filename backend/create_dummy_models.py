import joblib
import numpy as np
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression

print("Creating dummy ML models...")

# Create dummy data
X_dummy = np.random.rand(10, 5)
y_dummy_class = np.random.randint(0, 3, 10)
y_dummy_binary = np.random.randint(0, 2, 10)

# Create and train Naive Bayes
nb = GaussianNB()
nb.fit(X_dummy, y_dummy_class)
joblib.dump(nb, 'ml_models/naive_bayes.pkl')
print("✓ Naive Bayes model created")

# Create and train Decision Tree
dt = DecisionTreeClassifier()
dt.fit(X_dummy, y_dummy_binary)
joblib.dump(dt, 'ml_models/decision_tree.pkl')
print("✓ Decision Tree model created")

# Create and train KMeans
km = KMeans(n_clusters=3, random_state=42)
locations = np.random.rand(20, 2)
km.fit(locations)
joblib.dump(km, 'ml_models/kmeans.pkl')
print("✓ KMeans model created")

# Create and train Linear Regression
lr = LinearRegression()
X_lr = np.random.rand(10, 3)
y_lr = np.random.rand(10)
lr.fit(X_lr, y_lr)
joblib.dump(lr, 'ml_models/linear_reg.pkl')
print("✓ Linear Regression model created")

print("\n✅ All 4 ML models created successfully in 'ml_models' folder!")