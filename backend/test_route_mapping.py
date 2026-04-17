import requests

# Login
login = requests.post('http://localhost:8000/api/token/', json={'username':'admin','password':'admin123'})
if login.status_code == 200:
    token = login.json()['access']
    print('✅ Token obtained')
    
    # Optimize routes
    response = requests.post('http://localhost:8000/api/ml/optimize-routes/',
                             headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                             json={'area': 'Attock'})
    
    if response.status_code == 200:
        data = response.json()
        print('\n📊 Route to Tester Mapping:')
        print('=' * 50)
        for route in data.get('routes', []):
            print(f"\n{route['route_id']}: {route['total_complaints']} complaints")
            print(f"   Assigned Tester: {route['assigned_tester']}")
            ids = [c['id'] for c in route.get('complaints', [])]
            print(f"   Complaint IDs: {ids}")
        
        print('\n' + '=' * 50)
        print('✅ Each route now maps to a specific tester!')
    else:
        print(f'Error: {response.text}')
else:
    print('Login failed')
