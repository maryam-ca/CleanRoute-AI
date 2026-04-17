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
        ('completed', 'Completed'),
    ]
    
    complaint_type = models.CharField(max_length=50, choices=COMPLAINT_TYPES)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='complaints/', null=True, blank=True)
    after_image = models.ImageField(upload_to='complaints/after/', null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    fill_level_before = models.IntegerField(default=0)
    fill_level_after = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints', null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    assigned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Complaint #{self.id} - {self.complaint_type}"
