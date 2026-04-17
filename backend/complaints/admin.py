from django.contrib import admin
from .models import Complaint

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id', 'complaint_type', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'complaint_type']
    search_fields = ['id', 'description', 'assigned_to__username']
    readonly_fields = ['created_at', 'completed_at', 'assigned_at']
