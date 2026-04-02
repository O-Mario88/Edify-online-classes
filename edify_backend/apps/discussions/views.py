from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Thread, Post
from .serializers import ThreadSerializer, PostSerializer

class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer
    permission_classes = [IsAuthenticated]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

