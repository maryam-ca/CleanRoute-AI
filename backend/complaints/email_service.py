from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

class EmailNotificationService:
    
    @staticmethod
    def send_complaint_created(complaint):
        """Send email when complaint is created"""
        subject = f'Complaint #{complaint.id} Submitted Successfully'
        context = {
            'complaint_id': complaint.id,
            'complaint_type': complaint.complaint_type,
            'priority': complaint.priority,
            'location': f'{complaint.latitude}, {complaint.longitude}',
            'description': complaint.description,
            'status': complaint.status,
            'created_at': complaint.created_at,
        }
        
        html_message = render_to_string('emails/complaint_created.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [complaint.user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def send_status_update(complaint, old_status, new_status):
        """Send email when complaint status changes"""
        subject = f'Complaint #{complaint.id} Status Updated'
        context = {
            'complaint_id': complaint.id,
            'complaint_type': complaint.complaint_type,
            'old_status': old_status,
            'new_status': new_status,
            'location': f'{complaint.latitude}, {complaint.longitude}',
            'updated_at': complaint.updated_at,
        }
        
        html_message = render_to_string('emails/status_update.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [complaint.user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def send_complaint_resolved(complaint):
        """Send email when complaint is resolved"""
        subject = f'Complaint #{complaint.id} Resolved'
        context = {
            'complaint_id': complaint.id,
            'complaint_type': complaint.complaint_type,
            'resolution_date': complaint.resolved_at or complaint.updated_at,
            'feedback_link': f'http://localhost:3000/complaints/{complaint.id}/feedback',
        }
        
        html_message = render_to_string('emails/complaint_resolved.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [complaint.user.email],
            html_message=html_message,
            fail_silently=False,
        )
