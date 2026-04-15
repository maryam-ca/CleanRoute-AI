"""
Complete Backend API Testing Script
Run: python test_backend.py
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://cleanroute-ai.onrender.com/api"
TEST_USER = {"username": "admin", "password": "admin123"}

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

def run_all_tests():
    print("\n" + "="*60)
    print("🧪 CLEANROUTE-AI BACKEND API TESTS")
    print("="*60)
    
    results = []
    
    # Test 1: API Root
    print("\n📡 TESTING API ENDPOINTS...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print_test("API Root Access", response.status_code == 200, f"Status: {response.status_code}")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("API Root Access", False, str(e))
        results.append(False)
    
    # Test 2: Login
    print("\n🔐 TESTING AUTHENTICATION...")
    try:
        response = requests.post(f"{BASE_URL}/token/", json=TEST_USER)
        token = response.json().get("access")
        headers = {"Authorization": f"Bearer {token}"}
        print_test("Login Endpoint", response.status_code == 200, f"Token obtained: {token is not None}")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("Login Endpoint", False, str(e))
        results.append(False)
        return
    
    # Test 3: Get Complaints
    print("\n📋 TESTING COMPLAINTS API...")
    try:
        response = requests.get(f"{BASE_URL}/complaints/", headers=headers)
        complaints = response.json()
        count = len(complaints) if isinstance(complaints, list) else 0
        print_test("GET /complaints/", response.status_code == 200, f"Found {count} complaints")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("GET /complaints/", False, str(e))
        results.append(False)
    
    # Test 4: Dashboard Stats
    print("\n📊 TESTING DASHBOARD STATS...")
    try:
        response = requests.get(f"{BASE_URL}/complaints/dashboard_stats/", headers=headers)
        stats = response.json()
        print_test("Dashboard Stats", response.status_code == 200, f"Total: {stats.get('total_complaints', 0)}")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("Dashboard Stats", False, str(e))
        results.append(False)
    
    # Test 5: Get Testers
    print("\n👥 TESTING TESTERS API...")
    try:
        response = requests.get(f"{BASE_URL}/complaints/testers/", headers=headers)
        testers = response.json()
        count = len(testers) if isinstance(testers, list) else 0
        print_test("GET /complaints/testers/", response.status_code == 200, f"Found {count} testers")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("GET /complaints/testers/", False, str(e))
        results.append(False)
    
    # Test 6: Route Optimization
    print("\n🗺️ TESTING ROUTE OPTIMIZATION...")
    try:
        response = requests.post(f"{BASE_URL}/optimize-routes/", 
                                 headers=headers, 
                                 json={"area": "Attock"})
        data = response.json()
        routes_count = data.get('total_clusters', 0)
        complaints_count = data.get('total_complaints', 0)
        print_test("POST /optimize-routes/", response.status_code == 200, 
                  f"Routes: {routes_count}, Complaints: {complaints_count}")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("POST /optimize-routes/", False, str(e))
        results.append(False)
    
    # Test 7: Waste Prediction
    print("\n📈 TESTING WASTE PREDICTION...")
    try:
        response = requests.get(f"{BASE_URL}/predict-waste/?days=7", headers=headers)
        print_test("GET /predict-waste/", response.status_code == 200, "Prediction generated")
        results.append(response.status_code == 200)
    except Exception as e:
        print_test("GET /predict-waste/", False, str(e))
        results.append(False)
    
    # Test 8: Create Complaint
    print("\n➕ TESTING CREATE COMPLAINT...")
    try:
        new_complaint = {
            "complaint_type": "overflowing",
            "priority": "high",
            "latitude": 33.805787,
            "longitude": 72.351681,
            "description": "TEST - Automated test complaint",
            "fill_level_before": 85
        }
        response = requests.post(f"{BASE_URL}/complaints/", headers=headers, json=new_complaint)
        print_test("POST /complaints/", response.status_code in [200, 201], f"Status: {response.status_code}")
        results.append(response.status_code in [200, 201])
    except Exception as e:
        print_test("POST /complaints/", False, str(e))
        results.append(False)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"\n✅ Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"\n{Colors.GREEN}🎉 ALL BACKEND TESTS PASSED! Backend is fully functional.{Colors.RESET}")
    elif percentage >= 80:
        print(f"\n{Colors.YELLOW}⚠️ Most tests passed. Minor issues need attention.{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}❌ Multiple failures. Check backend deployment.{Colors.RESET}")
    
    return results

if __name__ == "__main__":
    run_all_tests()
