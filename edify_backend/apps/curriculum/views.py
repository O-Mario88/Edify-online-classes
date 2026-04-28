from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import math
from datetime import date, timedelta
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import Country, Subject, ClassLevel, Topic, AcademicYear
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

    @method_decorator(cache_page(60 * 10))  # Cache for 10 minutes
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
                
                unique_subjects = {}
                for topic in cls.topics.all():
                    subj_name = topic.subject.name
                    if subj_name not in unique_subjects:
                        unique_subjects[subj_name] = {
                            "id": str(topic.subject.id),
                            "name": topic.subject.name,
                            "topics": []
                        }
                    
                    topic_dict = {
                        "id": str(topic.id),
                        "name": topic.name,
                        "description": "",
                        "subtopics": []
                    }
                    
                    # We override any existing database subtopics to strictly enforce the 4-phase curriculum
                    # structure across EVERY topic, as requested by the user for fast, consistent rendering.
                    topic_dict["subtopics"] = []
                    
                    standard_phases = ["Introduction & Overview", "Core Concepts", "Worked Examples", "Advanced Application"]
                    for i, phase in enumerate(standard_phases):
                        p_id = f"dynamic-sub-{topic.id}-{i}"
                        topic_dict["subtopics"].append({
                            "id": p_id,
                            "name": phase,
                            "lessons": [
                                {
                                    "id": f"vid-{p_id}",
                                    "title": f"{topic.name}: {phase} \u2013 Video Lesson",
                                    "type": "video",
                                    "duration": "35 MIN",
                                    "completed": False
                                },
                                {
                                    "id": f"not-{p_id}",
                                    "title": f"{topic.name}: {phase} \u2013 Study Notes",
                                    "type": "notes",
                                    "duration": "20 MIN",
                                    "completed": False
                                },
                                {
                                    "id": f"exe-{p_id}",
                                    "title": f"{topic.name}: {phase} \u2013 Practice Set",
                                    "type": "exercise",
                                    "duration": "25 MIN",
                                    "completed": False
                                }
                            ]
                        })


                    unique_subjects[subj_name]["topics"].append(topic_dict)
                
                # Split topics evenly into 3 terms using round-robin
                for term_idx in range(1, 4):
                    term_dict = {
                        "id": f"term-{term_idx}",
                        "name": f"Term {term_idx}",
                        "subjects": []
                    }
                    
                    for subj_name, subj_data in unique_subjects.items():
                        all_topics = subj_data["topics"]
                        total = len(all_topics)
                        # Even distribution: ceil for first terms, remainder for last
                        chunk = math.ceil(total / 3)
                        start = chunk * (term_idx - 1)
                        end = chunk * term_idx if term_idx < 3 else total
                        term_topics = all_topics[start:end]
                            
                        if term_topics:
                            term_dict["subjects"].append({
                                "id": subj_data["id"],
                                "name": subj_data["name"],
                                "teacherId": "sys-auto",
                                "description": "",
                                "topics": term_topics
                            })
                    
                    class_dict["terms"].append(term_dict)
                level_dict["classes"].append(class_dict)
            data["levels"].append(level_dict)

        return Response(data)


class CurrentTermView(APIView):
    """GET /api/v1/curriculum/current-term/

    Returns the active AcademicYear plus a derived term label
    (Term 1 / 2 / 3) based on today's position inside the year. Used by
    the AcademicTermBanner component shown across every dashboard.

    Term boundaries are computed from the year's start_date / end_date.
    If neither is set, we return a label-less payload so the frontend
    falls back to showing the year alone.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        year = AcademicYear.objects.filter(is_current=True).first()
        if not year:
            year = AcademicYear.objects.order_by('-year_label').first()

        payload = {
            'year': None,
            'year_label': None,
            'term': None,
            'term_label': None,
            'term_starts': None,
            'term_ends': None,
            'days_remaining_in_term': None,
            'days_remaining_in_year': None,
        }
        if not year:
            return Response(payload)

        payload['year'] = year.id
        payload['year_label'] = year.year_label

        if year.start_date and year.end_date:
            today = date.today()
            total_days = (year.end_date - year.start_date).days
            if total_days <= 0 or today < year.start_date:
                # Pre-term: show Term 1 starting on year start
                payload['term'] = 1
                payload['term_label'] = 'Term 1'
                payload['term_starts'] = year.start_date.isoformat()
                payload['term_ends'] = (year.start_date + timedelta(days=max(1, total_days // 3))).isoformat()
                payload['days_remaining_in_term'] = (year.start_date - today).days
                payload['days_remaining_in_year'] = (year.end_date - today).days
                return Response(payload)
            if today > year.end_date:
                payload['term'] = 3
                payload['term_label'] = 'Term 3 (ended)'
                payload['days_remaining_in_term'] = 0
                payload['days_remaining_in_year'] = 0
                return Response(payload)

            # In-year: thirds
            third = max(1, total_days // 3)
            t1_end = year.start_date + timedelta(days=third)
            t2_end = year.start_date + timedelta(days=third * 2)
            if today <= t1_end:
                term_no = 1
                term_starts = year.start_date
                term_ends = t1_end
            elif today <= t2_end:
                term_no = 2
                term_starts = t1_end + timedelta(days=1)
                term_ends = t2_end
            else:
                term_no = 3
                term_starts = t2_end + timedelta(days=1)
                term_ends = year.end_date
            payload['term'] = term_no
            payload['term_label'] = f'Term {term_no}'
            payload['term_starts'] = term_starts.isoformat()
            payload['term_ends'] = term_ends.isoformat()
            payload['days_remaining_in_term'] = max(0, (term_ends - today).days)
            payload['days_remaining_in_year'] = max(0, (year.end_date - today).days)

        return Response(payload)

