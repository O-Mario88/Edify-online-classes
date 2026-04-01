from django.db import models
from django.conf import settings

class Thread(models.Model):
    topic_context = models.ForeignKey('curriculum.Topic', on_delete=models.SET_NULL, null=True, blank=True, related_name='threads')
    class_context = models.ForeignKey('classes.ClassContext', on_delete=models.SET_NULL, null=True, blank=True, related_name='threads')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='authored_threads')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Post(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='authored_posts')
    content = models.TextField()
    is_teacher_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.author.full_name} in {self.thread.title}"
