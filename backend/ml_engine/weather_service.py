import requests
import json
from datetime import datetime, timedelta

class WeatherService:
    """Weather API integration for waste prediction"""
    
    # Free API key for demo (replace with actual key)
    API_KEY = "YOUR_OPENWEATHER_API_KEY"  # Get free key from openweathermap.org
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
    
    @staticmethod
    def get_weather(lat, lon):
        """Get current weather for given coordinates"""
        try:
            if WeatherService.API_KEY == "YOUR_OPENWEATHER_API_KEY":
                # Return mock data for demo
                return WeatherService.get_mock_weather()
            
            url = f"{WeatherService.BASE_URL}?lat={lat}&lon={lon}&appid={WeatherService.API_KEY}&units=metric"
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                return {
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'rain': data.get('rain', {}).get('1h', 0),
                    'wind_speed': data['wind']['speed'],
                    'weather': data['weather'][0]['description']
                }
        except Exception as e:
            print(f"Weather API error: {e}")
        
        return WeatherService.get_mock_weather()
    
    @staticmethod
    def get_mock_weather():
        """Return mock weather data for demo"""
        return {
            'temperature': 25,
            'humidity': 65,
            'rain': 0,
            'wind_speed': 10,
            'weather': 'clear sky'
        }
    
    @staticmethod
    def get_forecast(days=7):
        """Get weather forecast for prediction"""
        forecasts = []
        today = datetime.now()
        
        for i in range(days):
            date = today + timedelta(days=i+1)
            # Mock forecast data
            forecasts.append({
                'date': date.strftime('%Y-%m-%d'),
                'temperature': 22 + (i % 5),
                'humidity': 60 + (i % 20),
                'rain': 0 if i % 3 == 0 else 2
            })
        
        return forecasts

weather_service = WeatherService()
