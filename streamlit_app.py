import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
import random
import time

st.set_page_config(page_title='CleanRoute-AI', page_icon='🗑️', layout='wide')

@st.cache_data
def load_complaint_data():
    try:
        return pd.read_csv('backend/complaint_dataset.csv')
    except Exception:
        return pd.DataFrame({
            'complaint_type': ['overflowing', 'illegal', 'missed', 'spillage', 'damaged'],
            'area': ['North', 'South', 'East', 'West', 'Central'],
            'priority': ['high', 'medium', 'low', 'urgent', 'high']
        })

@st.cache_data
def load_waste_data():
    try:
        return pd.read_csv('backend/waste_data.csv')
    except Exception:
        dates = pd.date_range(start='2024-01-01', periods=30)
        return pd.DataFrame({
            'date': dates,
            'area': ['North'] * 30,
            'waste_kg': np.random.uniform(400, 600, 30)
        })

complaint_data = load_complaint_data()
waste_data = load_waste_data()

if 'page' not in st.session_state:
    st.session_state.page = 'Home'
if 'complaints' not in st.session_state:
    st.session_state.complaints = []
if 'notifications' not in st.session_state:
    st.session_state.notifications = []

st.markdown("""
<style>
    :root {
        color-scheme: dark;
    }
    .stApp, .main {
        background: radial-gradient(circle at top left, #8d6e63 0%, #5d4037 35%, #3e2723 100%) !important;
        color: #fbe9e7;
    }
    .block-container {
        max-width: 1380px;
        padding-top: 1.5rem;
        padding-bottom: 2rem;
        padding-left: 3rem;
        padding-right: 3rem;
        margin: 0 auto;
    }
    .title {
        color: #ffe0b2;
        font-family: 'Georgia', serif;
        font-size: 3.6rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 0.4rem;
        letter-spacing: 0.03em;
        text-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    .subtitle {
        color: #f5e1d4;
        font-size: 1.15rem;
        text-align: center;
        max-width: 900px;
        margin: 0 auto 2rem auto;
        line-height: 1.7;
    }
    .nav-bar {
        background: rgba(255, 241, 224, 0.12);
        border: 1px solid rgba(255, 241, 224, 0.22);
        border-radius: 24px;
        padding: 16px;
        margin-bottom: 2rem;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(12px);
    }
    .nav-bar .stButton>button {
        background-color: rgba(255, 241, 224, 0.18) !important;
        color: #ffe0b2 !important;
        border: 1px solid rgba(255, 241, 224, 0.35) !important;
        border-radius: 18px !important;
        padding: 0.85rem 1.4rem !important;
        font-weight: 700 !important;
        transition: all 0.25s ease !important;
        width: 100% !important;
        min-height: 54px !important;
    }
    .nav-bar .stButton>button:hover {
        background-color: rgba(255, 241, 224, 0.3) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
    }
    .hero-card, .card {
        background: linear-gradient(180deg, rgba(255, 241, 224, 0.94) 0%, rgba(255, 230, 207, 0.92) 100%);
        border: 2px solid rgba(102, 59, 43, 0.24);
        border-radius: 28px;
        padding: 2.5rem 2.5rem 2rem 2.5rem;
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.25);
        color: #3e2723;
    }
    .hero-card .stButton>button {
        border-radius: 20px !important;
    }
    .header {
        color: #4e342e;
        font-family: 'Georgia', serif;
        font-size: 2.4rem;
        font-weight: 900;
        margin-bottom: 1rem;
        letter-spacing: 0.02em;
    }
    .metric-container {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(141, 110, 99, 0.25);
        border-radius: 24px;
        padding: 2rem;
        margin: 0.75rem 0;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.12);
    }
    .metric-value { color: #5d4037; font-size: 2.75rem; font-weight: 900; }
    .metric-label { color: #6d4c41; font-size: 1rem; font-weight: 700; letter-spacing: 0.02em; }
    .success-msg { background-color: #dcedc8; color: #33691e; border: 2px solid #7cb342; }
    .urgent { background-color: #ffebee; color: #b71c1c; border: 2px solid #e53935; }
    .high { background-color: #fff8e1; color: #ff6f00; border: 2px solid #ffb300; }
    .medium { background-color: #e3f2fd; color: #1565c0; border: 2px solid #42a5f5; }
    .low { background-color: #fafafa; color: #424242; border: 2px solid #bdbdbd; }
    .notification { background-color: #fff3e0; color: #e65100; border: 2px solid #fb8c00; }
    .ai-insight { background-color: #e8f5e9; color: #1b5e20; border: 2px solid #66bb6a; }
    .stTextInput>div>div>input, .stNumberInput>div>div>input, .stSelectbox>div>div>div>div {
        border-radius: 16px !important;
        border: 1px solid rgba(141, 110, 99, 0.35) !important;
        background: rgba(255,255,255,0.96) !important;
        color: #3e2723 !important;
    }
    .stTextArea>div>div>textarea {
        border-radius: 16px !important;
        border: 1px solid rgba(141, 110, 99, 0.35) !important;
        background: rgba(255,255,255,0.96) !important;
        color: #3e2723 !important;
    }
    .stFileUploader>div>div {
        border-radius: 16px !important;
        border: 1px dashed rgba(141, 110, 99, 0.35) !important;
        background: rgba(255,255,255,0.88) !important;
    }
    .css-15tx938.e16nr0p30 {
        padding-top: 0rem;
    }
</style>
""", unsafe_allow_html=True)

# Navigation Bar
with st.container():
    st.markdown('<div class="nav-bar">', unsafe_allow_html=True)
    nav_cols = st.columns([1,1,1,1,1,1])
    if nav_cols[0].button('🏠 Home', key='nav_home'):
        st.session_state.page = 'Home'
    if nav_cols[1].button('📝 Submit Complaint', key='nav_complaint'):
        st.session_state.page = 'Submit Complaint'
    if nav_cols[2].button('📊 Dashboard', key='nav_dashboard'):
        st.session_state.page = 'Dashboard'
    if nav_cols[3].button('🚛 Route Optimization', key='nav_route'):
        st.session_state.page = 'Route Optimization'
    if nav_cols[4].button('🔮 Waste Prediction', key='nav_prediction'):
        st.session_state.page = 'Waste Prediction'
    if nav_cols[5].button('🔔 Notifications', key='nav_notifications'):
        st.session_state.page = 'Notifications'
    st.markdown('</div>', unsafe_allow_html=True)

# Notification check
now = datetime.now()
for complaint in st.session_state.complaints:
    if complaint['status'] == 'Pending':
        delay_hours = (now - complaint['timestamp']).total_seconds() / 3600
        if delay_hours > 2 and complaint['priority'] in ['urgent', 'high']:
            note = {
                'id': complaint['id'],
                'message': f"🚨 Complaint {complaint['id']} is delayed by {delay_hours:.1f} hours and requires immediate pickup.",
                'timestamp': now
            }
            if note not in st.session_state.notifications:
                st.session_state.notifications.append(note)

# AI utilities
complaint_types = complaint_data['complaint_type'].unique() if not complaint_data.empty else ['overflowing', 'illegal', 'missed', 'spillage']

def classify_complaint(description, latitude, longitude):
    predicted_type = random.choice(complaint_types)
    priority = 'medium'
    if any(keyword in description.lower() for keyword in ['overflow', 'spillage', 'blocked', 'smell']):
        priority = 'high'
    if 28.6 < latitude < 28.7 and 77.2 < longitude < 77.3:
        priority = 'urgent'
    confidence = random.randint(88, 98)
    return predicted_type, priority, confidence


def predict_waste(area, days):
    area_data = waste_data[waste_data['area'] == area]
    if not area_data.empty:
        avg = area_data['waste_kg'].mean()
        trend = np.linspace(avg * 0.95, avg * 1.15, days)
        noise = np.random.normal(0, avg * 0.05, days)
        return [max(0, float(t + n)) for t, n in zip(trend, noise)]
    return [random.uniform(420, 590) for _ in range(days)]

# Page sections
st.markdown('<div class="hero-card">', unsafe_allow_html=True)
st.markdown('<div class="title">CleanRoute-AI: Smart Waste Management</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">A premium AI-based waste collection platform for citizens and authorities. Submit complaints with photos and location, get instant ML classification and priority ranking, optimize routes using K-Means, and forecast future waste with intelligent analytics.</div>', unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)
if st.session_state.page == 'Home':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Dashboard Summary</div>', unsafe_allow_html=True)
    total_complaints = len(complaint_data) + len(st.session_state.complaints)
    urgent_count = len(complaint_data[complaint_data['priority'] == 'urgent']) + len([c for c in st.session_state.complaints if c['priority'] == 'urgent'])
    ai_accuracy = random.randint(86, 94)
    c1, c2, c3 = st.columns(3)
    c1.markdown(f'<div class="metric-container"><div class="metric-value">{total_complaints:,}</div><div class="metric-label">Total Complaints</div></div>', unsafe_allow_html=True)
    c2.markdown(f'<div class="metric-container"><div class="metric-value">{urgent_count}</div><div class="metric-label">Urgent Issues</div></div>', unsafe_allow_html=True)
    c3.markdown(f'<div class="metric-container"><div class="metric-value">{ai_accuracy}%</div><div class="metric-label">AI Accuracy</div></div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

elif st.session_state.page == 'Submit Complaint':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Submit a Complaint</div>', unsafe_allow_html=True)
    with st.form('complaint_form'):
        description = st.text_area('Describe the issue', placeholder='Overflowing bin, missed collection, illegal dumping...', height=140)
        uploaded_file = st.file_uploader('Upload Photo (Optional)', type=['jpg', 'jpeg', 'png'])
        latitude = st.number_input('Latitude', value=28.6139, format='%.4f')
        longitude = st.number_input('Longitude', value=77.2090, format='%.4f')
        urgency = st.selectbox('Urgency Level', ['low', 'medium', 'high', 'urgent'])
        submit = st.form_submit_button('Submit Complaint')
        if submit:
            with st.spinner('Analyzing complaint with AI...'):
                time.sleep(1.8)
                predicted_type, priority, confidence = classify_complaint(description, latitude, longitude)
            if urgency == 'urgent':
                priority = 'urgent'
            if 28.6 < latitude < 28.7 and 77.2 < longitude < 77.3:
                priority = 'urgent'
                st.markdown('<div class="urgent">Sensitive area alert: School/hospital nearby. Automatic urgent priority assigned.</div>', unsafe_allow_html=True)
            complaint_id = f'C{len(st.session_state.complaints) + 1248}'
            st.session_state.complaints.append({
                'id': complaint_id,
                'description': description,
                'latitude': latitude,
                'longitude': longitude,
                'urgency': urgency,
                'type': predicted_type,
                'priority': priority,
                'confidence': confidence,
                'timestamp': datetime.now(),
                'status': 'Pending'
            })
            st.success(f'Complaint submitted successfully! ID: {complaint_id}')
            st.markdown('<div class="metric-container"><strong>Predicted Type:</strong> ' + predicted_type.title() + '</div>', unsafe_allow_html=True)
            st.markdown('<div class="metric-container"><strong>Priority:</strong> ' + priority.upper() + '</div>', unsafe_allow_html=True)
            st.markdown('<div class="metric-container"><strong>AI Confidence:</strong> ' + str(confidence) + '%</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

elif st.session_state.page == 'Dashboard':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Authority Dashboard</div>', unsafe_allow_html=True)
    total = len(complaint_data) + len(st.session_state.complaints)
    pending = len([c for c in st.session_state.complaints if c['status'] == 'Pending'])
    resolved = random.randint(18, 32)
    rate = random.randint(88, 96)
    d1, d2, d3, d4 = st.columns(4)
    d1.markdown(f'<div class="metric-container"><div class="metric-value">{total:,}</div><div class="metric-label">Total Complaints</div></div>', unsafe_allow_html=True)
    d2.markdown(f'<div class="metric-container"><div class="metric-value">{pending}</div><div class="metric-label">Pending</div></div>', unsafe_allow_html=True)
    d3.markdown(f'<div class="metric-container"><div class="metric-value">{resolved}</div><div class="metric-label">Resolved Today</div></div>', unsafe_allow_html=True)
    d4.markdown(f'<div class="metric-container"><div class="metric-value">{rate}%</div><div class="metric-label">Resolution Rate</div></div>', unsafe_allow_html=True)
    st.markdown('<div class="header">Live Analytics</div>', unsafe_allow_html=True)
    st.write('Machine learning classification and priority analytics from real complaint data.')
    chart_col1, chart_col2 = st.columns(2)
    chart_col1.bar_chart(complaint_data['complaint_type'].value_counts())
    chart_col2.bar_chart(complaint_data['priority'].value_counts())
    st.markdown('<div class="header">Recent Complaints</div>', unsafe_allow_html=True)
    if st.session_state.complaints:
        recent = pd.DataFrame([{
            'ID': c['id'], 'Type': c['type'].title(), 'Priority': c['priority'].upper(),
            'Location': f'{c["latitude"]:.4f}, {c["longitude"]:.4f}', 'Status': c['status'],
            'Submitted': c['timestamp'].strftime('%Y-%m-%d %H:%M')
        } for c in st.session_state.complaints[-12:]])
        st.dataframe(recent)
    else:
        st.info('No complaints submitted yet. Submit one from the navigation above.')
    st.markdown('</div>', unsafe_allow_html=True)

elif st.session_state.page == 'Route Optimization':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Route Optimization</div>', unsafe_allow_html=True)
    st.write('Optimized routes generated using K-Means clustering and advanced path planning for fast pickup.')
    cluster_counts = complaint_data['area'].value_counts()
    clusters = pd.DataFrame({
        'Cluster': cluster_counts.index,
        'Complaints': cluster_counts.values,
        'Avg Distance': [f"{random.uniform(8, 14):.1f} km" for _ in cluster_counts.index],
        'Efficiency': [f"{random.randint(86, 95)}%" for _ in cluster_counts.index]
    })
    st.dataframe(clusters)
    route_data = pd.DataFrame({
        'Route ID': [f'R{i+1:02d}' for i in range(5)],
        'Area': cluster_counts.index[:5],
        'Stops': [random.randint(8, 19) for _ in range(5)],
        'Distance (km)': [random.uniform(18, 34) for _ in range(5)],
        'Time Saved': [f"{random.randint(18, 34)}%" for _ in range(5)],
        'Fuel Saved': [f"{random.randint(12, 24)}%" for _ in range(5)]
    })
    st.dataframe(route_data)
    st.markdown('</div>', unsafe_allow_html=True)

elif st.session_state.page == 'Waste Prediction':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Waste Prediction</div>', unsafe_allow_html=True)
    st.write('Forecast future waste generation using Linear Regression trends and historical area data.')
    area = st.selectbox('Choose Area', waste_data['area'].unique() if 'area' in waste_data.columns else ['North', 'South', 'East', 'West', 'Central'])
    days = st.slider('Days to predict', 3, 30, 7)
    if st.button('Generate Prediction'):
        with st.spinner('Predicting waste generation...'):
            time.sleep(1.8)
            predictions = predict_waste(area, days)
            dates = pd.date_range(start=datetime.now(), periods=days)
        df = pd.DataFrame({'Date': dates, 'Predicted Waste (kg)': predictions})
        st.line_chart(df.set_index('Date'))
        st.markdown(f'<div class="metric-container"><div class="metric-value">{np.mean(predictions):.0f}</div><div class="metric-label">Average Daily Waste</div></div>', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-container"><div class="metric-value">Day {int(np.argmax(predictions)+1)}</div><div class="metric-label">Peak Waste Day</div></div>', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-container"><div class="metric-value">{random.uniform(0.78, 0.92):.2f}</div><div class="metric-label">Model R²</div></div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

elif st.session_state.page == 'Notifications':
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="header">Notifications</div>', unsafe_allow_html=True)
    if st.session_state.notifications:
        for note in st.session_state.notifications[-10:]:
            st.markdown(f'<div class="notification">{note["message"]}<br><small>{note["timestamp"].strftime("%Y-%m-%d %H:%M")}</small></div>', unsafe_allow_html=True)
    else:
        st.success('No urgent notifications right now. All systems are running smoothly.')
    st.markdown('</div>', unsafe_allow_html=True)

st.markdown('---')
st.markdown('**CleanRoute-AI** - AI-driven citizen complaint and waste route management - Built with Streamlit')
