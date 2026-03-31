import React, { useState } from 'react';
import { submitComplaint } from '../services/api';

function ComplaintForm() {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                alert(`Location captured: ${position.coords.latitude}, ${position.coords.longitude}`);
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!image || !description || !location) {
            alert("Please fill all fields and capture location!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('description', description);
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);

        try {
            const response = await submitComplaint(formData);
            setResult(response.data);
            alert(`✅ Complaint submitted! Priority: ${response.data.priority}`);
            setImage(null);
            setDescription('');
            setLocation(null);
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Failed to submit complaint');
        }
        setLoading(false);
    };

    return (
        <div className="complaint-form">
            <h2>Report Waste Issue</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>📸 Upload Image</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files[0])}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>📝 Description</label>
                    <textarea 
                        placeholder="Describe the waste issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="4"
                    />
                </div>
                
                <div className="form-group">
                    <label>📍 Location</label>
                    <button type="button" onClick={getLocation} className="location-btn">
                        {location ? '✅ Location Captured' : '📍 Get My Location'}
                    </button>
                    {location && (
                        <p className="location-info">
                            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                        </p>
                    )}
                </div>
                
                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
            </form>
            
            {result && (
                <div className="result">
                    <h3>Complaint Submitted!</h3>
                    <p>ID: {result.complaint_id}</p>
                    <p>Priority: <strong>{result.priority}</strong></p>
                    <p>Type: {result.type}</p>
                </div>
            )}
        </div>
    );
}

export default ComplaintForm;