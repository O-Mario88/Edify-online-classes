#!/usr/bin/env python3
import os
import sys
import django
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic, Term, Subtopic, TemplateLesson

def run():
    print("Seeding from JSON...")
    json_path = os.path.join(settings.BASE_DIR.parent, 'public', 'data', 'courses.json')
    if not os.path.exists(json_path):
        # Maybe another directory since script is in edify_backend and public is adjacent
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'courses.json')
        
    with open(json_path, 'r') as f:
        data = json.load(f)

    uganda, _ = Country.objects.get_or_create(code='uganda', defaults={'name': 'Uganda'})
    track, _ = CurriculumTrack.objects.get_or_create(country=uganda, name='Uganda National Curriculum')

    for level_data in data.get('levels', []):
        level, _ = EducationLevel.objects.get_or_create(track=track, name=level_data['name'])
        
        for class_data in level_data.get('classes', []):
            class_lvl, _ = ClassLevel.objects.get_or_create(level=level, name=class_data['name'])
            
            for term_data in class_data.get('terms', []):
                term, _ = Term.objects.get_or_create(class_level=class_lvl, name=term_data['name'])
                
                for subject_data in term_data.get('subjects', []):
                    subject, _ = Subject.objects.get_or_create(name=subject_data['name'])
                    
                    for idx, topic_data in enumerate(subject_data.get('topics', [])):
                        topic, _ = Topic.objects.get_or_create(
                            subject=subject,
                            class_level=class_lvl,
                            name=topic_data['name'],
                            defaults={'order': idx + 1}
                        )
                        
                        for sub_data in topic_data.get('subtopics', []):
                            subtopic, _ = Subtopic.objects.get_or_create(topic=topic, name=sub_data['name'])
                            
                            for lesson_data in sub_data.get('lessons', []):
                                TemplateLesson.objects.get_or_create(
                                    subtopic=subtopic,
                                    remote_id=lesson_data['id'],
                                    defaults={
                                        'title': lesson_data['title'],
                                        'lesson_type': lesson_data.get('type', 'video'),
                                        'duration': lesson_data.get('duration', '')
                                    }
                                )
    print("Seed Complete!")

if __name__ == '__main__':
    from django.conf import settings
    run()
