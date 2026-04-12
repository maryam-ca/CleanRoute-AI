from django.db import models

class TrainingLog(models.Model):
    MODEL_CHOICES = [
        ('classifier', 'Complaint Classifier'),
        ('predictor', 'Waste Predictor'),
        ('optimizer', 'Route Optimizer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    model_name = models.CharField(max_length=50, choices=MODEL_CHOICES)
    accuracy = models.FloatField(null=True, blank=True)
    loss = models.FloatField(null=True, blank=True)
    training_date = models.DateTimeField(auto_now_add=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.model_name} - {self.training_date}"

class ModelMetrics(models.Model):
    model_name = models.CharField(max_length=50)
    accuracy = models.FloatField()
    precision = models.FloatField(null=True, blank=True)
    recall = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    rmse = models.FloatField(null=True, blank=True)
    r2_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.model_name} - Acc: {self.accuracy}"
