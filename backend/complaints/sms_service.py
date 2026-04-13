import os
from django.conf import settings

class SMSService:
    """SMS Notification Service using Twilio"""
    
    # Twilio credentials (sign up at twilio.com for free trial)
    ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
    AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
    FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER', '+1234567890')
    
    @staticmethod
    def send_sms(to_number, message):
        """Send SMS notification"""
        try:
            # Check if Twilio is configured
            if not SMSService.ACCOUNT_SID or SMSService.ACCOUNT_SID == '':
                print(f"⚠️ SMS not sent (demo mode): To: {to_number}, Message: {message[:50]}...")
                return {'success': True, 'demo': True, 'message': 'SMS would be sent in production'}
            
            # Actual Twilio integration
            from twilio.rest import Client
            client = Client(SMSService.ACCOUNT_SID, SMSService.AUTH_TOKEN)
            message = client.messages.create(
                body=message,
                from_=SMSService.FROM_NUMBER,
                to=to_number
            )
            return {'success': True, 'sid': message.sid}
            
        except Exception as e:
            print(f"SMS error: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_complaint_assigned(complaint, tester_phone):
        """Send SMS when complaint is assigned to tester"""
        message = f"""
        🗑️ CleanRoute-AI: New task assigned!
        Complaint #{complaint.id}: {complaint.complaint_type}
        Priority: {complaint.priority}
        Location: {complaint.latitude}, {complaint.longitude}
        Please check your dashboard for details.
        """
        return SMSService.send_sms(tester_phone, message.strip())
    
    @staticmethod
    def send_complaint_completed(complaint, citizen_phone):
        """Send SMS when complaint is completed"""
        reduction = complaint.fill_level_before - complaint.fill_level_after
        message = f"""
        ✅ CleanRoute-AI: Complaint #{complaint.id} completed!
        Waste reduced by {reduction}%
        Thank you for helping keep your city clean.
        """
        return SMSService.send_sms(citizen_phone, message.strip())
