import requests
import json

# Login as tester1
login = requests.post('http://localhost:8000/api/token/', json={'username':'tester1','password':'tester123'})
if login.status_code == 200:
    token = login.json()['access']
    print('✅ Tester1 token obtained')
    
    # Get complaints
    response = requests.get('http://localhost:8000/api/complaints/', 
                            headers={'Authorization': f'Bearer {token}'})
    print(f'Status: {response.status_code}')
    
    if response.status_code == 200:
        complaints = response.json()
        print(f'\nTotal complaints: {len(complaints)}')
        
        assigned_count = 0
        for c in complaints:
            if c.get('status') == 'assigned':
                assigned_count += 1
                print(f"\nComplaint #{c['id']}:")
                print(f"  status: {c.get('status')}")
                print(f"  assigned_to: {c.get('assigned_to')}")
                print(f"  assigned_to_username: {c.get('assigned_to_username')}")
        
        print(f'\nAssigned complaints: {assigned_count}')
    else:
        print(f'Error: {response.text}')
else:
    print('Login failed')
