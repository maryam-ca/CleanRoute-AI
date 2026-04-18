import os
import csv
import glob

# Define paths
base_path = "dataset/train"
categories = ['low', 'medium', 'high', 'urgent']
output_file = "waste_dataset_metadata.csv"

# Map categories to fill levels
fill_level_map = {
    'low': 20,
    'medium': 45,
    'high': 70,
    'urgent': 90
}

# Create CSV
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Image_ID', 'Category', 'Fill_Level', 'Priority', 'File_Path'])
    
    for category in categories:
        category_path = os.path.join(base_path, category)
        if os.path.exists(category_path):
            images = glob.glob(os.path.join(category_path, "*.jpg")) + \
                     glob.glob(os.path.join(category_path, "*.jpeg")) + \
                     glob.glob(os.path.join(category_path, "*.png"))
            
            for i, img_path in enumerate(images):
                writer.writerow([
                    f"{category}_{i+1}",
                    category,
                    fill_level_map[category],
                    category.upper(),
                    img_path
                ])
                print(f"Added: {category}_{i+1} -> {img_path}")

print(f"\n✅ CSV file created: {output_file}")
print(f"Total images: {sum(1 for _ in open(output_file)) - 1}")
