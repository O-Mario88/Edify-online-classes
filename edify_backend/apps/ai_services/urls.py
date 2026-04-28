"""Maple Study Buddy URL surface.

Mounted at /api/v1/study-buddy/ from edify_core/urls.py. Kept in its
own module rather than CopilotInferenceView's path so the OpenAI-
based copilot and the Anthropic-based Study Buddy stay decoupled.
"""
from django.urls import path

from .views import (
    StudyBuddyAskView,
    StudyBuddyConversationsListView,
    StudyBuddyConversationDetailView,
)


urlpatterns = [
    path('ask/', StudyBuddyAskView.as_view(), name='study-buddy-ask'),
    path('conversations/', StudyBuddyConversationsListView.as_view(),
         name='study-buddy-conversations'),
    path('conversations/<int:conversation_id>/', StudyBuddyConversationDetailView.as_view(),
         name='study-buddy-conversation-detail'),
]
