import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_complaint_dataset(n_samples=5000):
    """Generate synthetic complaint dataset"""
    
    complaint_types = ['overflowing', 'missed', 'illegal', 'spillage', 'other']
    areas = ['North', 'South', 'East', 'West', 'Central']
    weather_conditions = ['clear', 'rainy', 'cloudy', 'hot', 'cold']
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    data = []
    
    for i in range(n_samples):
        # Generate features
        complaint_type = random.choice(complaint_types)
        area = random.choice(areas)
        day = random.choice(days_of_week)
        weather = random.choice(weather_conditions)
        
        # Population density (people per sq km)
        population_density = random.uniform(1000, 20000)
        
        # Distance to nearest collection point (km)
        distance_to_bin = random.uniform(0.1, 5.0)
        
        # Time since last collection (hours)
        hours_since_collection = random.randint(1, 72)
        
        # Is near school/hospital
        near_sensitive = random.choice([0, 1])
        
        # Generate priority based on rules
        priority = 'low'
        
        if near_sensitive == 1 and hours_since_collection > 24:
            priority = 'urgent'
        elif complaint_type == 'overflowing' and hours_since_collection > 48:
            priority = 'high'
        elif complaint_type == 'illegal' or hours_since_collection > 36:
            priority = 'high'
        elif hours_since_collection > 24:
            priority = 'medium'
        else:
            priority = 'low'
            
        # Add some noise (10% random mislabeling for realism)
        if random.random() < 0.1:
            priorities = ['low', 'medium', 'high', 'urgent']
            priority = random.choice(priorities)
        
        data.append({
            'complaint_type': complaint_type,
            'area': area,
            'day_of_week': day,
            'weather': weather,
            'population_density': population_density,
            'distance_to_bin_km': distance_to_bin,
            'hours_since_last_collection': hours_since_collection,
            'near_sensitive_area': near_sensitive,
            'priority': priority
        })
    
    df = pd.DataFrame(data)
    df.to_csv('complaint_dataset.csv', index=False)
    print(f"Dataset created with {n_samples} samples")
    return df

def generate_waste_data(n_days=365):
    """Generate waste generation data for prediction"""
    
    dates = [datetime.now() - timedelta(days=x) for x in range(n_days)]
    dates.reverse()
    
    areas = ['North', 'South', 'East', 'West', 'Central']
    
    data = []
    
    for date in dates:
        for area in areas:
            # Base waste (kg)
            base_waste = random.uniform(100, 500)
            
            # Day of week effect (weekends more waste)
            day_of_week = date.strftime('%A')
            if day_of_week in ['Saturday', 'Sunday']:
                base_waste *= 1.3
            
            # Seasonal effect
            month = date.month
            if month in [6, 7, 8]:  # Summer - more waste
                base_waste *= 1.2
            elif month in [12, 1, 2]:  # Winter - less waste
                base_waste *= 0.8
            
            # Random variation
            actual_waste = base_waste + random.uniform(-50, 50)
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'area': area,
                'waste_kg': max(0, actual_waste)
            })
    
    df = pd.DataFrame(data)
    df.to_csv('waste_data.csv', index=False)
    print(f"Waste data created with {len(df)} records")
    return df

if __name__ == "__main__":
    generate_complaint_dataset(5000)
    generate_waste_data(365)