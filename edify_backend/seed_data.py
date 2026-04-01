import os
import json
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic

def seed_database():
    print("Seeding database...")
    
    # 1. Base Structure
    uganda, _ = Country.objects.get_or_create(code='UG', defaults={'name': 'Uganda'})
    o_level_track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='O-Level')
    a_level_track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='A-Level')
    
    lower_sec, _ = EducationLevel.objects.get_or_create(track=o_level_track, name='Lower Secondary')
    upper_sec, _ = EducationLevel.objects.get_or_create(track=a_level_track, name='Upper Secondary')
    
    # Map classes
    classes_map = {}
    for cls in ['S1', 'S2', 'S3', 'S4']:
        obj, _ = ClassLevel.objects.get_or_create(level=lower_sec, name=cls)
        classes_map[cls] = obj
    
    for cls in ['S5', 'S6', 'S5-S6']:
        obj, _ = ClassLevel.objects.get_or_create(level=upper_sec, name=cls)
        classes_map[cls] = obj

    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'data')
    json_files = [f for f in os.listdir(data_dir) if f.startswith('uganda-') and f.endswith('.json')]
    
    for filename in json_files:
        filepath = os.path.join(data_dir, filename)
        with open(filepath, 'r') as file:
            data = json.load(file)
            
            for subject_data in data.get('subjects', []):
                # Ensure Subject exists
                subject_name = subject_data.get('name')
                subject, _ = Subject.objects.get_or_create(
                    name=subject_name,
                    defaults={'code': subject_data.get('id')}
                )
                
                print(f"Loaded Subject: {subject.name}")
                
                # Load Topics
                topics = subject_data.get('topics', [])
                for idx, topic_data in enumerate(topics):
                    class_level_str = topic_data.get('classLevel')
                    if class_level_str not in classes_map:
                        print(f"Warning: Unknown class level {class_level_str}")
                        continue
                        
                    Topic.objects.get_or_create(
                        subject=subject,
                        class_level=classes_map[class_level_str],
                        name=topic_data.get('name'),
                        defaults={'order': topic_data.get('order', idx+1)}
                    )

if __name__ == '__main__':
    seed_database()
    print("Seeding complete.")
