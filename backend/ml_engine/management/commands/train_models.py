from django.core.management.base import BaseCommand
from ml_engine.data_generator import generate_complaint_dataset, generate_waste_data
from ml_engine.classifier import ComplaintClassifier
from ml_engine.waste_predictor import WastePredictor
from ml_engine.route_optimizer import RouteOptimizer

class Command(BaseCommand):
    help = 'Train all ML models'
    
    def handle(self, *args, **options):
        self.stdout.write('Generating datasets...')
        generate_complaint_dataset(5000)
        generate_waste_data(365)
        
        self.stdout.write('Training classification models...')
        classifier = ComplaintClassifier()
        results = classifier.train()
        
        self.stdout.write(f"Type Accuracy: {results['type_accuracy']:.4f}")
        self.stdout.write(f"Priority Accuracy: {results['priority_accuracy']:.4f}")
        
        self.stdout.write('Training waste predictor...')
        predictor = WastePredictor()
        predictor.train()
        
        self.stdout.write('Saving route optimizer...')
        optimizer = RouteOptimizer()
        optimizer.save_model()
        
        self.stdout.write(self.style.SUCCESS('All models trained successfully!'))