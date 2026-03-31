import React, { useState } from 'react';
import './App.css';
import ComplaintForm from './components/ComplaintForm';
import Dashboard from './components/Dashboard';

function App() {
    const [activeTab, setActiveTab] = useState('complaint');

    return (
        <div className="App">
            <header className="app-header">
                <h1>🚀 CleanRoute-AI</h1>
                <p>Smart Waste Collection System</p>
            </header>
            
            <div className="tab-bar">
                <button 
                    className={activeTab === 'complaint' ? 'active' : ''} 
                    onClick={() => setActiveTab('complaint')}
                >
                    📝 Report Complaint
                </button>
                <button 
                    className={activeTab === 'dashboard' ? 'active' : ''} 
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
            </div>
            
            <div className="content">
                {activeTab === 'complaint' ? <ComplaintForm /> : <Dashboard />}
            </div>
        </div>
    );
}

export default App;