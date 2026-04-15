import os
import sys
import django
from pathlib import Path
import random

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from curriculum.models import ClassLevel, Subject, Topic, Term, Subtopic, TemplateLesson
from lessons.models import Lesson

def run():
    print("Seeding Heavy Syllabus Mock Data for Testing Purposes...")
    classes = ClassLevel.objects.all()
    subjects = Subject.objects.all()
    
    if not classes:
        print("No classes found. Aborting.")
        return
        
    for cls in classes:
        print(f"Applying heavy syllabus to {cls.name}...")
        
        # Ensure 3 terms exist
        term_names = ['Term 1', 'Term 2', 'Term 3']
        for i, t_name in enumerate(term_names):
            Term.objects.get_or_create(
                class_level=cls,
                name=t_name
            )
            
        # Apply to all subjects
        for subj in subjects:
            # We assign 12 topics total per class+subject (4 per term roughly)
            for topic_order in range(1, 13):
                topic, created = Topic.objects.get_or_create(
                    subject=subj,
                    class_level=cls,
                    name=f"Advanced {subj.name} Unit {topic_order}",
                    defaults={'order': topic_order}
                )
                
                if created:
                    # 4 units per topic
                    for sub_idx in range(4):
                        subtopic_order = sub_idx + 1
                        subtopic, _ = Subtopic.objects.get_or_create(
                            topic=topic,
                            name=f"Unit {subtopic_order} regarding {subj.name}"
                        )
                        
                        # exactly 3 standard items per unit
                        for les_idx, l_type in enumerate(['video', 'notes', 'exercise']):
                            TemplateLesson.objects.get_or_create(
                                subtopic=subtopic,
                                remote_id=f"test_lesson_{cls.id}_{subj.id}_{topic.id}_{subtopic.id}_{les_idx}",
                                defaults={
                                    'title': f"{subj.name} {l_type.capitalize()} Lesson {subtopic_order}.{les_idx + 1}",
                                    'lesson_type': l_type,
                                    'duration': f"{random.randint(15, 30)} minutes"
                                }
                            )
                            
                    # 2 projects per topic
                    project_subtopic, _ = Subtopic.objects.get_or_create(
                        topic=topic,
                        name="Topic Projects"
                    )
                    for p_idx in range(2):
                        TemplateLesson.objects.get_or_create(
                            subtopic=project_subtopic,
                            remote_id=f"test_project_{cls.id}_{subj.id}_{topic.id}_{p_idx}",
                            defaults={
                                'title': f"{subj.name} Capstone Project {p_idx + 1}",
                                'lesson_type': 'project',
                                'duration': "1-2 weeks"
                            }
                        )

    print("Heavy syllabus seeding completed! Thousands of topics instantiated.")

if __name__ == '__main__':
    run()
