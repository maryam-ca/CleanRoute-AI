import firebase_admin
from firebase_admin import credentials, firestore

# Download your service account key from Firebase
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Sample collection structure
def init_database():
    # Complaints collection
    complaints_ref = db.collection('complaints')
    
    # Users collection
    users_ref = db.collection('users')
    
    print("Firebase initialized successfully")