import requests
import json

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
        print('\n📊 Route Optimization Results:')
        print('   Total complaints:', data.get('total_complaints', 0))
        print('   Routes created:', data.get('total_clusters', 0))
        
        # Check if complaint #47 is included
        all_complaints = []
        for route in data.get('routes', []):
            for complaint in route.get('complaints', []):
                all_complaints.append(complaint['id'])
        
        if 47 in all_complaints:
            print('\n✅ Complaint #47 IS included in route optimization!')
        else:
            print('\n❌ Complaint #47 NOT included')
            
        print('\n📋 Routes:')
        for route in data.get('routes', []):
            ids = [c['id'] for c in route.get('complaints', [])]
            print(f'   {route["route_id"]}: {route["total_complaints"]} complaints - IDs: {ids}')
    else:
        print(f'Error: {response.text}')
else:
    print('Login failed')
