from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ExamCenter, CandidateRegistration, SubjectSelection, BoardSubmissionBatch
from .serializers import ExamCenterSerializer, CandidateRegistrationSerializer, SubjectSelectionSerializer, BoardSubmissionBatchSerializer

class ExamCenterViewSet(viewsets.ModelViewSet):
    queryset = ExamCenter.objects.all()
    serializer_class = ExamCenterSerializer
    permission_classes = [IsAuthenticated]

class CandidateRegistrationViewSet(viewsets.ModelViewSet):
    queryset = CandidateRegistration.objects.all()
    serializer_class = CandidateRegistrationSerializer
    permission_classes = [IsAuthenticated]

class SubjectSelectionViewSet(viewsets.ModelViewSet):
    queryset = SubjectSelection.objects.all()
    serializer_class = SubjectSelectionSerializer
    permission_classes = [IsAuthenticated]

class BoardSubmissionBatchViewSet(viewsets.ModelViewSet):
    queryset = BoardSubmissionBatch.objects.all()
    serializer_class = BoardSubmissionBatchSerializer
    permission_classes = [IsAuthenticated]

