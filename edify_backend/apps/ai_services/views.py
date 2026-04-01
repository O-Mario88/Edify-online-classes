from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AIJob

class CopilotInferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Message content is required.'}, status=400)
            
        # 1. Log the query
        job = AIJob.objects.create(
            requestor=request.user,
            job_type='copilot_query',
            payload={'query': content},
            status='processing'
        )
        
        # 2. Mock AI Logic (Swappable for OpenAI / Gemini LLM later)
        ai_response = "I'm your Django-powered Assistant! Currently in offline mode, but I successfully authenticated your identity and logged Job ID #{0}.".format(job.id)
        
        if 'quiz' in content.lower():
            ai_response = "Sure! Here is a Quick Quiz:\n\n1. What is the standard form of a quadratic equation?\nA) y = mx + c\nB) ax² + bx + c = 0\nC) A + B = C\n\nReply with your answer!"
        elif 'summary' in content.lower() or 'summarize' in content.lower():
            ai_response = "Here is a brief summary of Kinematics: Kinematics describes motion without considering its causes. Key concepts include displacement, velocity, and acceleration. Master the 4 kinematic equations to easily solve UACE problems!"
            
        # 3. Complete the Job
        job.status = 'done'
        job.save()
        
        return Response({
            'reply': ai_response,
            'job_id': job.id
        })
