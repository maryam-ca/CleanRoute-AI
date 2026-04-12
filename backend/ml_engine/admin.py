from django.contrib import admin
from .models import TrainingLog, ModelMetrics

# Register models if they exist
try:
    from .models import TrainingLog, ModelMetrics
    
    @admin.register(TrainingLog)
    class TrainingLogAdmin(admin.ModelAdmin):
        list_display = ['id', 'model_name', 'accuracy', 'training_date', 'status']
        list_filter = ['model_name', 'status', 'training_date']
        readonly_fields = ['id', 'training_date']
    
    @admin.register(ModelMetrics)
    class ModelMetricsAdmin(admin.ModelAdmin):
        list_display = ['id', 'model_name', 'accuracy', 'precision', 'recall', 'f1_score', 'created_at']
        list_filter = ['model_name']
        readonly_fields = ['id', 'created_at']
except:
    print("ML models not yet migrated")
