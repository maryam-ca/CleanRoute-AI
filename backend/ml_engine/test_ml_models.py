"""
Complete ML Models Testing Script
Run: python test_ml_models.py
"""

import os
import sys
import json
import numpy as np

sys.path.append('D:\\Code Cortex\\03_Projects\\Current\\6-CleanRoute-AI\\backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from complaints.models import Complaint
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
import random

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name, status, details=""):
    icon = "✅" if status else "❌"
    color = Colors.GREEN if status else Colors.RED
    print(f"{color}{icon} {name}: {status}{Colors.RESET}")
    if details:
        print(f"   {details}")

def test_route_optimizer():
    print("\n🗺️ TESTING ROUTE OPTIMIZER (K-Means)...")
    try:
        from ml_engine.route_optimizer_api import optimize_routes
        from rest_framework.request import Request
        from django.test import RequestFactory
        
        factory = RequestFactory()
        request = factory.post('/api/optimize-routes/', {'area': 'Attock'}, content_type='application/json')
        
        # Mock user authentication
        from django.contrib.auth.models import User
        user = User.objects.get(username='admin')
        request.user = user
        
        response = optimize_routes(request)
        
        if response.status_code == 200:
            data = response.data
            print_test("Route Optimization API", True, 
                      f"Routes: {data.get('total_clusters', 0)}, Complaints: {data.get('total_complaints', 0)}")
            return True
        else:
            print_test("Route Optimization API", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Route Optimization API", False, str(e))
        return False

def test_complaint_classification():
    print("\n🤖 TESTING COMPLAINT CLASSIFICATION...")
    try:
        from ml_engine.classifier import ComplaintClassifier
        
        classifier = ComplaintClassifier()
        
        # Test classification
        test_complaints = [
            {"description": "Bin is overflowing with waste", "expected": "overflowing"},
            {"description": "Garbage scattered on road", "expected": "spillage"},
            {"description": "Collection truck missed our street", "expected": "missed"},
            {"description": "Someone dumped construction waste illegally", "expected": "illegal"},
        ]
        
        results = []
        for test in test_complaints:
            predicted = classifier.predict_type(test["description"])
            is_correct = predicted == test["expected"]
            results.append(is_correct)
            print(f"   '{test['description'][:30]}...' → Predicted: {predicted} (Expected: {test['expected']})")
        
        accuracy = sum(results) / len(results) * 100
        print_test("Complaint Classification", accuracy >= 70, f"Accuracy: {accuracy:.1f}%")
        return accuracy >= 70
    except Exception as e:
        print_test("Complaint Classification", False, str(e))
        return False

def test_waste_prediction():
    print("\n📈 TESTING WASTE PREDICTION (Linear Regression)...")
    try:
        from ml_engine.waste_predictor import WastePredictor
        
        predictor = WastePredictor()
        predictions = predictor.predict_future(7)
        
        if predictions and len(predictions) == 7:
            print(f"   Predictions: {[round(p, 1) for p in predictions[:3]]}... tons")
            print_test("Waste Prediction", True, f"Generated {len(predictions)} day forecast")
            return True
        else:
            print_test("Waste Prediction", False, "No predictions generated")
            return False
    except Exception as e:
        print_test("Waste Prediction", False, str(e))
        return False

def test_anomaly_detection():
    print("\n⚠️ TESTING ANOMALY DETECTION (Isolation Forest)...")
    try:
        from ml_engine.anomaly_detector import anomaly_detector
        
        complaints = Complaint.objects.all()
        
        if complaints.count() > 0:
            anomalies = anomaly_detector.detect_anomalies(complaints)
            hotspots = anomaly_detector.get_hotspots(complaints)
            
            print(f"   Total complaints: {complaints.count()}")
            print(f"   Anomalies detected: {len(anomalies)}")
            print(f"   Hotspots identified: {len(hotspots)}")
            print_test("Anomaly Detection", True, "Model executed successfully")
            return True
        else:
            print_test("Anomaly Detection", False, "No complaints in database")
            return False
    except Exception as e:
        print_test("Anomaly Detection", False, str(e))
        return False

def test_lstm_prediction():
    print("\n🧠 TESTING LSTM DEEP LEARNING...")
    try:
        from ml_engine.lstm_predictor import lstm_predictor
        
        # Check if model exists
        import os
        if os.path.exists('models/lstm_waste_model.h5'):
            forecast = lstm_predictor.predict_future(14)
            if forecast:
                print(f"   14-day forecast generated")
                print(f"   Peak: {max(forecast):.1f} tons")
                print(f"   Average: {sum(forecast)/len(forecast):.1f} tons")
                print_test("LSTM Prediction", True, "Model loaded and forecasting")
                return True
            else:
                print_test("LSTM Prediction", False, "Model exists but prediction failed")
                return False
        else:
            print_test("LSTM Prediction", False, "Model file not found (train first)")
            return False
    except Exception as e:
        print_test("LSTM Prediction", False, str(e))
        return False

def test_image_segmentation():
    print("\n🖼️ TESTING IMAGE SEGMENTATION...")
    try:
        from ml_engine.image_segmentation import waste_segmentation
        
        # Create a dummy image for testing
        import cv2
        import numpy as np
        
        dummy_img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        temp_path = "test_image.jpg"
        cv2.imwrite(temp_path, dummy_img)
        
        result = waste_segmentation.segment_waste(temp_path)
        
        os.remove(temp_path)
        
        if result and 'waste_percentage' in result:
            print(f"   Waste percentage detected: {result['waste_percentage']}%")
            print_test("Image Segmentation", True, "Segmentation completed")
            return True
        else:
            print_test("Image Segmentation", False, "Segmentation failed")
            return False
    except Exception as e:
        print_test("Image Segmentation", False, str(e))
        return False

def test_chatbot():
    print("\n💬 TESTING AI CHATBOT...")
    try:
        from ml_engine.chatbot import chatbot
        
        test_queries = [
            "How do I report waste?",
            "What is my complaint status?",
            "When is collection scheduled?"
        ]
        
        for query in test_queries:
            response = chatbot.get_response(query)
            print(f"   Q: {query}")
            print(f"   A: {response[:60]}...")
        
        print_test("AI Chatbot", True, f"Responded to {len(test_queries)} queries")
        return True
    except Exception as e:
        print_test("AI Chatbot", False, str(e))
        return False

def run_all_tests():
    print("\n" + "="*60)
    print("🤖 CLEANROUTE-AI ML MODELS TESTING")
    print("="*60)
    
    results = []
    
    results.append(("Route Optimization", test_route_optimizer()))
    results.append(("Complaint Classification", test_complaint_classification()))
    results.append(("Waste Prediction", test_waste_prediction()))
    results.append(("Anomaly Detection", test_anomaly_detection()))
    results.append(("LSTM Prediction", test_lstm_prediction()))
    results.append(("Image Segmentation", test_image_segmentation()))
    results.append(("AI Chatbot", test_chatbot()))
    
    print("\n" + "="*60)
    print("📊 ML MODELS TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, status in results if status)
    total = len(results)
    percentage = (passed / total) * 100
    
    for name, status in results:
        icon = "✅" if status else "❌"
        color = Colors.GREEN if status else Colors.RED
        print(f"{color}{icon} {name}{Colors.RESET}")
    
    print(f"\n📈 Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"\n{Colors.GREEN}🎉 ALL ML MODELS ARE WORKING!{Colors.RESET}")
    elif percentage >= 80:
        print(f"\n{Colors.YELLOW}⚠️ Most ML models working. Some need attention.{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}❌ Multiple ML models failing. Check implementations.{Colors.RESET}")

if __name__ == "__main__":
    run_all_tests()
