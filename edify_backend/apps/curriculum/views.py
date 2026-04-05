from rest_framework import viewsets
from .models import Country, Subject, ClassLevel, Topic
from .serializers import CountrySerializer, SubjectSerializer, ClassLevelSerializer, TopicSerializer
from django_filters.rest_framework import DjangoFilterBackend

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ClassLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'class_level']

from .models import TopicCompetency, ResourceQualityReview
from .serializers import TopicCompetencySerializer, ResourceQualityReviewSerializer
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

class TopicCompetencyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exposes NCDC learning objectives per topic for the AI and teacher planners.
    """
    queryset = TopicCompetency.objects.all()
    serializer_class = TopicCompetencySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['topic']

class ResourceQualityReviewViewSet(viewsets.ModelViewSet):
    """
    Moderation queue allowing NCDC or Admin validators to approve platform teaching resources.
    """
    queryset = ResourceQualityReview.objects.all()
    serializer_class = ResourceQualityReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        review = self.get_object()
        score = request.data.get('compliance_score', 100)
        review.status = 'approved'
        review.compliance_score = score
        review.reviewer_notes = request.data.get('notes', 'Passes Quality Assurance.')
        review.save()
        return Response({'status': 'approved'})

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EducationLevel

class CurriculumTreeView(APIView):
    """
    Returns the exact JSON shape of the legacy courses.json by querying the database.
    """
    permission_classes = [] # Public wrapper for the catalog

    def get(self, request, *args, **kwargs):
        data = {
            "version": "3.0-NCDC (DB Seeded)",
            "updatedAt": "2026-04-05",
            "levels": []
        }
        
        levels = EducationLevel.objects.prefetch_related(
            'class_levels__topics__subject',
            'class_levels__topics__subtopics__template_lessons'
        ).all()
        
        for level in levels:
            level_dict = {
                "id": str(level.id),
                "name": level.name,
                "description": "",
                "classes": []
            }
            
            for cls in level.class_levels.all():
                class_dict = {
                    "id": str(cls.name).lower().replace(' ', '-'),
                    "name": cls.name,
                    "level": level.name,
                    "description": "",
                    "isExamYear": False,
                    "examType": None,
                    "terms": []
                }
                
                term_dict = {
                    "id": "term-1",
                    "name": "Term 1",
                    "subjects": []
                }
                
                unique_subjects = {}
                for topic in cls.topics.all():
                    subj_name = topic.subject.name
                    if subj_name not in unique_subjects:
                        unique_subjects[subj_name] = {
                            "id": str(topic.subject.id),
                            "name": topic.subject.name,
                            "teacherId": "sys-auto",
                            "description": "",
                            "topics": []
                        }
                    
                    topic_dict = {
                        "id": str(topic.id),
                        "name": topic.name,
                        "description": "",
                        "subtopics": []
                    }
                    
                    for sub in topic.subtopics.all():
                        sub_dict = {
                            "id": str(sub.id),
                            "name": sub.name,
                            "lessons": []
                        }
                        
                        for lesson in sub.template_lessons.all():
                            sub_dict["lessons"].append({
                                "id": lesson.remote_id,
                                "title": lesson.title,
                                "type": lesson.lesson_type,
                                "duration": lesson.duration,
                                "completed": False
                            })
                        topic_dict["subtopics"].append(sub_dict)
                    unique_subjects[subj_name]["topics"].append(topic_dict)
                
                for s in unique_subjects.values():
                    term_dict["subjects"].append(s)
                
                class_dict["terms"].append(term_dict)
                level_dict["classes"].append(class_dict)
            data["levels"].append(level_dict)
            
        return Response(data)

