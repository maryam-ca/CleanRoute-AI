from django.contrib import admin
from .models import Complaint, Notification

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id', 'complaint_type', 'priority', 'status', 'user', 'assigned_to', 'created_at']
    list_filter = ['complaint_type', 'priority', 'status']
    search_fields = ['id', 'description', 'user__username']
    readonly_fields = ['id', 'created_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['title', 'user__username']
    readonly_fields = ['id', 'created_at']
