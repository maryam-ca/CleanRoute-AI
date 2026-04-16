import requests

# Login as tester1
login = requests.post('http://localhost:8000/api/token/', json={'username':'tester1','password':'tester123'})
if login.status_code == 200:
    token = login.json()['access']
    print('✅ Tester1 token obtained')
    
    # Test my_tasks endpoint
    response = requests.get('http://localhost:8000/api/complaints/my_tasks/', 
                            headers={'Authorization': 'Bearer ' + token})
    print('Status:', response.status_code)
    if response.status_code == 200:
        tasks = response.json()
        print('Found', len(tasks), 'tasks')
        for task in tasks:
            print('  #', task['id'], ':', task['complaint_type'], '-', task['status'])
    else:
        print('Error:', response.text)
else:
    print('Login failed')
