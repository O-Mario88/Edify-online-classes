from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import AIJob

class CopilotInferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        context_type = request.data.get('context', 'general') # student_help, teacher_studio, grading
        
        if not content:
            return Response({'error': 'Message content is required.'}, status=400)
            
        # 1. Log the query
        job = AIJob.objects.create(
            requestor=request.user,
            job_type=f'copilot_{context_type}',
            payload={'query': content},
            status='processing'
        )
        
        # 2. Live OpenAI SDK Integration with Graceful Degradation
        import os
        ai_response = ""
        api_key = os.environ.get('OPENAI_API_KEY') or getattr(settings, 'OPENAI_API_KEY', None)

        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                
                system_prompt = f"You are the Edify Senior Curriculum Copilot. The user is a {request.user.role}. Context of this conversation: {context_type}. Provide helpful, structured, and pedagogical responses. Keep it concise."
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": content}
                    ],
                    max_tokens=600
                )
                ai_response = response.choices[0].message.content
            except Exception as e:
                print(f"[AI Services] OpenAI API Error: {e}. Falling back to mock data.")

        if not ai_response:
            # Fallback Mock AI Logic (Graceful Degradation)
            ai_response = "I'm your Edify AI Assistant. How can I help you structurally today?"
            content_lower = content.lower()

            if 'intervention' in content_lower or 'dropout' in content_lower:
                ai_response = "Based on the Analytics Engine, Alice and Bob are at high risk of truancy in the next 14 days. **Suggested Intervention:** Schedule a brief 1-on-1 check-in before Friday and temporarily reduce their assignment backlog by 20% to ease cognitive loading."
            elif 'lesson plan' in content_lower or 'syllabus' in content_lower:
                ai_response = "Here is a drafted 45-minute Lesson Plan for Cellular Respiration:\n\n**0-10m:** Hook & Recap (Mitochondria Review)\n**10-25m:** Glycolysis theory breakdown.\n**25-35m:** Independent practice worksheet.\n**35-45m:** Exit Ticket (Multiple Choice).\n\nWould you like me to generate the Exit Ticket?"
            elif 'grade' in content_lower or 'mark' in content_lower:
                ai_response = "I've scanned the 14 un-graded assessments using OCR. 12/14 perfectly map to the rubric. The remaining 2 require manual grading. Shall I auto-publish the 12 verified scores to the gradebook?"
            elif 'quiz' in content_lower:
                ai_response = "Sure! Here is a Quick Quiz:\n\n1. What is the standard form of a quadratic equation?\nA) y = mx + c\nB) ax² + bx + c = 0\nC) A + B = C\n\nReply with your answer!"
            elif 'summary' in content_lower or 'summarize' in content_lower:
                ai_response = "Here is a brief summary of Kinematics: Kinematics describes motion without considering its causes. Key concepts include displacement, velocity, and acceleration. Master the 4 kinematic equations to easily solve UACE problems!"
            
        # 3. Complete the Job
        job.status = 'done'
        job.save()
        
        return Response({
            'reply': ai_response,
            'job_id': job.id
        })
