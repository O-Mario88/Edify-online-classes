"""School Match endpoints — student/parent-side surfaces.

Mounted at /api/v1/school-match/ from edify_core/urls.py.
"""
from django.urls import path
from .views import (
    StudentOpportunityPreferenceView,
    RecalculateStudentReadinessView,
    ScoreExplanationView,
    ParentInvitationsListView,
    ParentInvitationDetailView,
    ParentInvitationActionView,
    ParentPassportAccessListView,
    ParentPassportAccessActionView,
)


urlpatterns = [
    path('preferences/', StudentOpportunityPreferenceView.as_view(),
         name='school-match-preferences'),
    path('recalculate-student-readiness/', RecalculateStudentReadinessView.as_view(),
         name='school-match-recalculate-readiness'),
    path('score-explanation/', ScoreExplanationView.as_view(),
         name='school-match-score-explanation'),

    # Parent-side invitation flow
    path('invitations/', ParentInvitationsListView.as_view(),
         name='school-match-invitations-list'),
    path('invitations/<int:invitation_id>/', ParentInvitationDetailView.as_view(),
         name='school-match-invitation-detail'),
    path('invitations/<int:invitation_id>/<str:action>/', ParentInvitationActionView.as_view(),
         name='school-match-invitation-action'),

    # Parent-side passport-access requests
    path('passport-access/', ParentPassportAccessListView.as_view(),
         name='school-match-passport-access-list'),
    path('passport-access/<int:request_id>/<str:action>/', ParentPassportAccessActionView.as_view(),
         name='school-match-passport-access-action'),
]
