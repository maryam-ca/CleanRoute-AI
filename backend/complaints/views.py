from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import joblib
import numpy as np
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Add this new function at the beginning of the file
def home(request):
    return HttpResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>CleanRoute-AI</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                background: rgba(255,255,255,0.9);
                color: #333;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { color: #667eea; }
            .endpoint {
                background: #f4f4f4;
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                font-family: monospace;
            }
            .status {
                color: green;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 CleanRoute-AI Server</h1>
            <p class="status">✅ Server is running successfully!</p>
            
            <h2>Available API Endpoints:</h2>
            
            <div class="endpoint">
                <strong>POST</strong> <a href="/api/submit-complaint/">/api/submit-complaint/</a><br>
                Submit waste complaint with image + location
            </div>
            
            <div class="endpoint">
                <strong>POST</strong> <a href="/api/optimize-routes/">/api/optimize-routes/</a><br>
                Optimize waste collection routes
            </div>
            
            <div class="endpoint">
                <strong>GET</strong> <a href="/api/predict-waste/">/api/predict-waste/</a><br>
                Predict future high-waste areas
            </div>
            
            <div class="endpoint">
                <strong>GET</strong> <a href="/admin/">/admin/</a><br>
                Django Admin Panel
            </div>
            
            <h2>Quick Test:</h2>
            <button onclick="testAPI()">Test Predict Waste API</button>
            <pre id="result"></pre>
        </div>
        
        <script>
            async function testAPI() {
                try {
                    const response = await fetch('/api/predict-waste/');
                    const data = await response.json();
                    document.getElementById('result').innerHTML = JSON.stringify(data, null, 2);
                } catch(error) {
                    document.getElementById('result').innerHTML = 'Error: ' + error;
                }
            }
        </script>
    </body>
    </html>
    """)
# Load trained models
naive_bayes = joblib.load('ml_models/naive_bayes.pkl')
decision_tree = joblib.load('ml_models/decision_tree.pkl')
kmeans = joblib.load('ml_models/kmeans.pkl')
linear_reg = joblib.load('ml_models/linear_reg.pkl')

@api_view(['POST'])
def submit_complaint(request):
    """Citizen submits complaint with image + location"""
    try:
        # Get data from request
        image = request.FILES.get('image')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        description = request.data.get('description')
        
        # Save image
        if image:
            path = default_storage.save(f'complaints/{image.name}', ContentFile(image.read()))
        
        # Prepare features for ML models
        features = np.array([[latitude, longitude, len(description)]])  # simplified
        
        # Classify complaint type
        complaint_type = naive_bayes.predict(features)[0]
        
        # Detect priority
        priority = decision_tree.predict(features)[0]
        priority_text = "URGENT" if priority == 1 else "NORMAL"
        
        # Store in database (add your database logic here)
        
        return Response({
            'status': 'success',
            'complaint_id': 'COMP123',
            'type': int(complaint_type),
            'priority': priority_text,
            'message': 'Complaint registered successfully'
        })
        
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})

@api_view(['POST'])
def optimize_routes(request):
    """Optimize collection routes using K-Means"""
    try:
        # Get complaint locations
        locations = request.data.get('locations', [])
        locations_array = np.array(locations)
        
        # Cluster locations
        clusters = kmeans.predict(locations_array)
        
        # Generate optimized routes (simplified)
        routes = {}
        for i, cluster_id in enumerate(clusters):
            if cluster_id not in routes:
                routes[cluster_id] = []
            routes[cluster_id].append(locations[i])
        
        return Response({
            'status': 'success',
            'num_clusters': len(routes),
            'routes': routes
        })
        
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})

@api_view(['GET'])
def predict_waste_areas(request):
    """Predict future high-waste areas"""
    try:
        # Get historical data (simplified)
        predictions = linear_reg.predict(np.random.rand(10, 3))
        
        return Response({
            'status': 'success',
            'predictions': predictions.tolist(),
            'high_waste_areas': ['Area A', 'Area B', 'Area C']
        })
        
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})