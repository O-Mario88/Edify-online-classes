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
                    # 3 subtopics per topic
                    for sub_idx in range(3):
                        subtopic_order = sub_idx + 1
                        subtopic, _ = Subtopic.objects.get_or_create(
                            topic=topic,
                            name=f"Module {subtopic_order} regarding {subj.name}"
                        )
                        
                        # 2 template lessons per subtopic
                        for les_idx in range(2):
                            TemplateLesson.objects.get_or_create(
                                subtopic=subtopic,
                                remote_id=f"test_lesson_{cls.id}_{subj.id}_{topic.id}_{subtopic.id}_{les_idx}",
                                defaults={
                                    'title': f"{subj.name} Mastery Part {les_idx + 1}",
                                    'lesson_type': random.choice(['video', 'reading', 'interactive']),
                                    'duration': f"{random.randint(20, 60)} minutes"
                                }
                            )

    print("Heavy syllabus seeding completed! Thousands of topics instantiated.")

if __name__ == '__main__':
    run()
