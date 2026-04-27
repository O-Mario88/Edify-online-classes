"""Institution-side school match endpoints.

Mounted at /api/v1/institution-match/ from edify_core/urls.py. Kept
separate from /api/v1/school-match/ (student-side) and from
/api/v1/institution-discovery/ (existing student-to-school browse) so
the surface-area + auth contract stays obvious by URL alone.
"""
from django.urls import path
from .views import (
    InstitutionRecommendedStudentsView,
    InstitutionStudentSummaryView,
    InstitutionMatchPipelineView,
    InstitutionInvitationsView,
    InstitutionPassportAccessRequestView,
    ScholarshipListCreateView,
    ScholarshipDetailView,
    InstitutionTierView,
)


urlpatterns = [
    path('recommended-students/', InstitutionRecommendedStudentsView.as_view(),
         name='institution-match-recommended-students'),
    path('student-summary/<int:student_id>/', InstitutionStudentSummaryView.as_view(),
         name='institution-match-student-summary'),
    path('pipeline/', InstitutionMatchPipelineView.as_view(),
         name='institution-match-pipeline'),
    path('invitations/', InstitutionInvitationsView.as_view(),
         name='institution-match-invitations'),
    path('passport-access-request/', InstitutionPassportAccessRequestView.as_view(),
         name='institution-match-passport-access-request'),
    path('scholarships/', ScholarshipListCreateView.as_view(),
         name='institution-match-scholarships-list-create'),
    path('scholarships/<int:pk>/', ScholarshipDetailView.as_view(),
         name='institution-match-scholarship-detail'),
    path('tier/', InstitutionTierView.as_view(),
         name='institution-match-tier'),
]
