import React, { useState, useEffect } from 'react';
import { predictWaste } from '../services/api';

function Dashboard() {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPredictions();
    }, []);

    const loadPredictions = async () => {
        setLoading(true);
        try {
            const response = await predictWaste();
            setPredictions(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard">
            <h2>📊 Waste Management Dashboard</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Complaints</h3>
                    <div className="stat-value">1,234</div>
                    <small>Last 30 days</small>
                </div>
                
                <div className="stat-card">
                    <h3>Urgent Issues</h3>
                    <div className="stat-value urgent">45</div>
                    <small>Need immediate attention</small>
                </div>
                
                <div className="stat-card">
                    <h3>Collection Rate</h3>
                    <div className="stat-value">92%</div>
                    <small>+5% from last month</small>
                </div>
                
                <div className="stat-card">
                    <h3>Active Routes</h3>
                    <div className="stat-value">8</div>
                    <small>Optimized by AI</small>
                </div>
            </div>
            
            <div className="predictions-section">
                <h3>🤖 AI Predictions</h3>
                {loading ? (
                    <p>Loading predictions...</p>
                ) : predictions && (
                    <div className="prediction-results">
                        <h4>High Waste Areas (Next Week):</h4>
                        <ul>
                            {predictions.high_waste_areas?.map((area, index) => (
                                <li key={index}>{area}</li>
                            ))}
                        </ul>
                        <h4>Predicted Waste Amounts:</h4>
                        <div className="prediction-chart">
                            {predictions.predictions?.map((val, idx) => (
                                <div key={idx} className="bar">
                                    <div className="bar-fill" style={{height: `${val}%`}}></div>
                                    <span>Area {idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={loadPredictions} className="refresh-btn">
                    🔄 Refresh Predictions
                </button>
            </div>
        </div>
    );
}

export default Dashboard;