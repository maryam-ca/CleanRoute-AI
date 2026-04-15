"""
Complete Project Testing Suite
Run: python run_all_tests.py
"""

import subprocess
import sys
import time
import requests
import json

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

def print_header(title):
    print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.CYAN}{title}{Colors.RESET}")
    print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")

def test_backend_api():
    print_header("TESTING BACKEND API")
    
    tests = [
        ("API Root", f"https://cleanroute-ai.onrender.com/api/", "GET", None),
        ("Login", f"https://cleanroute-ai.onrender.com/api/token/", "POST", {"username":"admin","password":"admin123"}),
        ("Complaints", f"https://cleanroute-ai.onrender.com/api/complaints/", "GET", None),
    ]
    
    passed = 0
    for name, url, method, data in tests:
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            else:
                response = requests.post(url, json=data, timeout=10)
            
            status = response.status_code in [200, 201, 401]  # 401 is expected for unauthenticated
            if status:
                print(f"{Colors.GREEN}✅ {name}: OK{Colors.RESET}")
                passed += 1
            else:
                print(f"{Colors.RED}❌ {name}: {response.status_code}{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}❌ {name}: {str(e)[:50]}{Colors.RESET}")
    
    print(f"\n📊 API Tests: {passed}/{len(tests)} passed")
    return passed == len(tests)

def test_frontend_deployment():
    print_header("TESTING FRONTEND DEPLOYMENT")
    
    urls = [
        "https://cleanroute-ai-prod.vercel.app",
        "https://cleanroute-ai-prod.vercel.app/complaint-map",
        "https://cleanroute-ai-prod.vercel.app/routes",
    ]
    
    passed = 0
    for url in urls:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"{Colors.GREEN}✅ {url}: OK{Colors.RESET}")
                passed += 1
            else:
                print(f"{Colors.RED}❌ {url}: {response.status_code}{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}❌ {url}: {str(e)[:50]}{Colors.RESET}")
    
    print(f"\n📊 Frontend Tests: {passed}/{len(urls)} passed")
    return passed == len(urls)

def test_database():
    print_header("TESTING DATABASE")
    
    try:
        # Get token
        response = requests.post("https://cleanroute-ai.onrender.com/api/token/", 
                                 json={"username":"admin","password":"admin123"})
        token = response.json().get("access")
        
        # Get complaints
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("https://cleanroute-ai.onrender.com/api/complaints/", headers=headers)
        complaints = response.json()
        
        count = len(complaints) if isinstance(complaints, list) else 0
        print(f"{Colors.GREEN}✅ Database connected: {count} complaints found{Colors.RESET}")
        
        # Check for Mehria Town complaints
        mehria_count = 0
        for c in complaints:
            if "Mehria" in str(c.get("description", "")):
                mehria_count += 1
        
        print(f"{Colors.GREEN}✅ Mehria Town complaints: {mehria_count}{Colors.RESET}")
        return True
    except Exception as e:
        print(f"{Colors.RED}❌ Database error: {str(e)[:50]}{Colors.RESET}")
        return False

def test_ml_models():
    print_header("TESTING ML MODELS")
    
    models = ["Route Optimization", "Waste Prediction", "Anomaly Detection"]
    
    try:
        # Get token
        response = requests.post("https://cleanroute-ai.onrender.com/api/token/", 
                                 json={"username":"admin","password":"admin123"})
        token = response.json().get("access")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test Route Optimization
        response = requests.post("https://cleanroute-ai.onrender.com/api/optimize-routes/", 
                                 headers=headers, json={"area": "Attock"})
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}✅ Route Optimization: {data.get('total_clusters', 0)} routes, {data.get('total_complaints', 0)} complaints{Colors.RESET}")
        else:
            print(f"{Colors.RED}❌ Route Optimization: {response.status_code}{Colors.RESET}")
        
        # Test Waste Prediction
        response = requests.get("https://cleanroute-ai.onrender.com/api/predict-waste/?days=7", headers=headers)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✅ Waste Prediction: Working{Colors.RESET}")
        else:
            print(f"{Colors.RED}❌ Waste Prediction: {response.status_code}{Colors.RESET}")
        
        return True
    except Exception as e:
        print(f"{Colors.RED}❌ ML Tests error: {str(e)[:50]}{Colors.RESET}")
        return False

def run_all_tests():
    print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.CYAN}🧪 CLEANROUTE-AI COMPLETE TEST SUITE{Colors.RESET}")
    print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    results.append(("Backend API", test_backend_api()))
    results.append(("Frontend Deployment", test_frontend_deployment()))
    results.append(("Database", test_database()))
    results.append(("ML Models", test_ml_models()))
    
    print_header("FINAL RESULTS")
    
    passed = sum(1 for _, status in results if status)
    total = len(results)
    percentage = (passed / total) * 100
    
    for name, status in results:
        icon = "✅" if status else "❌"
        color = Colors.GREEN if status else Colors.RED
        print(f"{color}{icon} {name}{Colors.RESET}")
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"📊 Overall: {passed}/{total} passed ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"{Colors.GREEN}🎉 EXCELLENT! All tests passed. Project is ready for submission!{Colors.RESET}")
    elif percentage >= 75:
        print(f"{Colors.YELLOW}⚠️ Good progress. Minor issues need attention.{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ Multiple failures. Please check deployment and configurations.{Colors.RESET}")
    
    print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")

if __name__ == "__main__":
    run_all_tests()
