from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Complaint(models.Model):
    COMPLAINT_TYPES = [
        ('overflowing', 'Overflowing Bin'),
        ('spillage', 'Spillage'),
        ('missed', 'Missed Pickup'),
        ('illegal', 'Illegal Dumping'),
        ('other', 'Other Issue'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('pending_review', 'Pending Review'),  # NEW: Tester completed, waiting for admin
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),  # NEW: Admin rejected the completion
    ]
    
    complaint_type = models.CharField(max_length=50, choices=COMPLAINT_TYPES)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    
    # Images
    image = models.ImageField(upload_to='complaints/', null=True, blank=True)  # Before photo (citizen)
    after_image = models.ImageField(upload_to='complaints/after/', null=True, blank=True)  # After photo (tester)
    
    # AI Analysis Results
    fill_level_before = models.IntegerField(default=0)  # AI detected fill level from citizen photo
    fill_level_after = models.IntegerField(default=0)   # AI detected fill level from tester photo
    ai_confidence_before = models.FloatField(default=0)  # Confidence of before analysis
    ai_confidence_after = models.FloatField(default=0)   # Confidence of after analysis
    ai_recommendation = models.TextField(blank=True)     # AI recommendation text
    
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # User Relations
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints', null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    completed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_tasks')
    
    # Admin Review
    reviewed_by_admin = models.BooleanField(default=False)
    admin_approved = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    assigned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Complaint #{self.id} - {self.complaint_type}"
    
    def is_completion_valid(self):
        """Check if after photo shows bin is empty (fill level <= 25%)"""
        return self.fill_level_after <= 25
    
    def get_completion_status(self):
        """Get human-readable completion status"""
        if self.status == 'pending_review':
            return 'Waiting for admin review'
        elif self.status == 'rejected':
            return f'Rejected: Fill level {self.fill_level_after}% > 25%'
        elif self.status == 'completed':
            return 'Completed and approved'
        return 'Not completed'
    
    class Meta:
        ordering = ['-created_at']