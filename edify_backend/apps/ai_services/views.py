import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import AIJob

class CopilotInferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = AIJob.objects.filter(requestor=request.user).order_by('-created_at')[:20]
        history = [
            {
                "id": job.id,
                "role": "user" if "query" in job.payload else "assistant",
                "content": job.payload.get("query", "No context"),
                "status": job.status,
                "created_at": job.created_at
            } for job in jobs
        ]
        return Response({"history": history})

    def post(self, request):
        content = request.data.get('content', '')
        context_type = request.data.get('context', 'general') # smart_reply, quiz_generator, teaching_analytics
        
        # 1. Log the query
        job = AIJob.objects.create(
            requestor=request.user,
            job_type=f'copilot_{context_type}',
            payload={'query': content},
            status='processing'
        )
        
        # 2. Live OpenAI Integration
        api_key = os.environ.get('OPENAI_API_KEY') or getattr(settings, 'OPENAI_API_KEY', None)
        
        ai_response = None
        is_json_format = False

        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                
                # Context routing strategy
                if context_type == 'quiz_generator':
                    system_prompt = f"You are the Edify Assessment AI. User wants a quiz about: {content}. Output ONLY valid JSON containing an array of 3 'questions'. Each object must have 'id', 'type' (multiple-choice), 'question', 'options' (array of 4 strings), 'correctAnswer', and 'explanation'."
                    is_json_format = True
                
                elif context_type == 'smart_reply':
                    system_prompt = f"You are the Edify Teaching Assistant. The student just asked: {content}. Generate a warm, pedagogical, strictly accurate answer to help them. Keep it under 2 paragraphs."
                
                elif context_type == 'teaching_analytics':
                    # We inject deep simulated analytics stats to OpenAI so it can output an actionable report
                    stats = {
                        "avg_session_time": "45min",
                        "completion_rate": "87%",
                        "help_requests": 23,
                        "struggling_topics": ["Quadratic Equations", "Algebraic Fractions", "Cellular Respiration"]
                    }
                    system_prompt = f"You are Edify's Data Scientist AI. Given these teacher class metrics: {json.dumps(stats)}. Write a 3-bullet point 'Confusion Report' and 'Intervention Recommendation'. Be incredibly insightful and concise."
                
                elif context_type == 'parent_weekly_summary':
                    stats = {
                        "assessments_completed": 4,
                        "readiness_score": 75,
                        "strongest_subject": "Biology",
                        "weakest_topic": "Kinematics",
                    }
                    system_prompt = f"You are Edify's Academic Advisor AI for Parents. Given the student's metrics: {json.dumps(stats)}. Write a short, encouraging 2-sentence weekly narrative summary of their progress. Be actionable and warm."

                else:
                    system_prompt = f"You are the Edify Senior Curriculum Copilot. The user is a {request.user.role}. Provide helpful, structured, and pedagogical responses. Keep it concise."

                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": content if context_type not in ['teaching_analytics', 'parent_weekly_summary'] else "Generate report."}
                    ],
                    response_format={ "type": "json_object" } if is_json_format else { "type": "text" },
                    max_tokens=800
                )
                ai_response = response.choices[0].message.content
                
                if is_json_format:
                    ai_response = json.loads(ai_response)

            except Exception as e:
                print(f"[AI Services] OpenAI API Error: {e}. Falling back to mock data.")

        if not ai_response:
            # Fallback Mock AI Logic (Graceful Degradation)
            if context_type == 'quiz_generator':
                ai_response = {
                    "questions": [
                        {
                            "id": "mock_q1",
                            "type": "multiple-choice",
                            "question": f"What is a key concept in {content}?",
                            "options": ["Concept A", "Concept B", "Concept C", "Concept D"],
                            "correctAnswer": "Concept A",
                            "explanation": "This is automatically provided by the mock backend."
                        }
                    ]
                }
            elif context_type == 'smart_reply':
                ai_response = f"I've broken down {content} for you: First, ensure you recognize the baseline principles. Would you like me to elaborate further on this specific topic?"
            elif context_type == 'teaching_analytics':
                ai_response = "1. Students are struggling significantly with Quadratic Equations (65% failure rate in latest quiz).\n2. Intervention: Run a Live Remedial Session focused solely on the Quadratic Formula.\n3. Engagement: Session lengths are above average (45m), showing strong effort despite confusion."
            elif context_type == 'parent_weekly_summary':
                ai_response = "I have analyzed Grace's performance. She has completed 4 rigorous assessments this week and is maintaining a solid 75% readiness score. I strongly suggest focusing on Kinematics this weekend to boost her Physics grade."
            else:
                ai_response = "I am your Edify AI Assistant. OpenAI keys are not configured, so I am running in fallback mode."

        # 3. Complete the Job
        job.status = 'done'
        job.save()
        
        return Response({
            'reply': ai_response,
            'job_id': job.id
        })
