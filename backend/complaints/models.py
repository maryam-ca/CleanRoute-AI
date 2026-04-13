from django.db import models
from django.conf import settings

class Complaint(models.Model):
    COMPLAINT_TYPES = [
        ('overflowing', 'Overflowing Bin'),
        ('spillage', 'Spillage'),
        ('missed', 'Missed Collection'),
        ('illegal', 'Illegal Dumping'),
        ('other', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    complaint_type = models.CharField(max_length=20, choices=COMPLAINT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    before_image = models.ImageField(upload_to='complaints/before/', null=True, blank=True)
    after_image = models.ImageField(upload_to='complaints/after/', null=True, blank=True)
    fill_level_before = models.IntegerField(default=0)
    fill_level_after = models.IntegerField(default=0)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Complaint #{self.id} - {self.complaint_type}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_complaint', 'New Complaint'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
