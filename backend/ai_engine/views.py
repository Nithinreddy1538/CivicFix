import re
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from complaints.models import Complaint
from .classifier import classify_complaint
from .duplicate_detector import find_duplicates


class ComplaintClassificationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            text = request.data.get("text", "")

            if not str(text).strip():
                return Response(
                    {"message": "Complaint text is required"},
                    status=400
                )

            result = classify_complaint(str(text))
            return Response(result)
        except Exception as e:
            return Response(
                {
                    "category": "other",
                    "priority": "medium",
                    "department": "General",
                    "error": str(e)
                },
                status=200
            )


class DuplicateDetectionView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        category = request.data.get("category")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        if not category:
            return Response(
                {"message": "Category is required"},
                status=400
            )

        duplicates = find_duplicates(category, latitude, longitude)

        return Response({
            "is_duplicate": len(duplicates) > 0,
            "count": len(duplicates),
            "duplicates": duplicates
        })


class AIAssistantView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {"message": "Query message is required"},
                status=400
            )

        msg_lower = message.lower()
        user = request.user

        # 1. Check if a complaint ID like CF-2026-XXXX is mentioned in message
        match = re.search(r'cf-\d{4}-\d{4}', msg_lower)
        if match:
            cid = match.group(0).upper()
            try:
                c = Complaint.objects.get(complaint_id__iexact=cid)
                officer_name = c.assigned_to.username if c.assigned_to else "Not yet assigned"
                dept = c.department or "Not assigned"
                status_display = c.get_status_display()

                if c.status == 'resolved':
                    reply = (
                        f"Complaint {c.complaint_id} ('{c.title}') has been successfully Resolved! "
                        f"Department: {dept}. "
                    )
                    if c.resolution_note:
                        reply += f"Officer note: \"{c.resolution_note}\". "
                    reply += "You can view before/after proof and download your receipt in the dashboard."
                    return Response({"response": reply})

                elif c.status == 'in_progress':
                    return Response({
                        "response": (
                            f"Complaint {c.complaint_id} ('{c.title}') is currently In Progress with the {dept} department. "
                            f"Assigned Officer: {officer_name}. Expected resolution within {c.sla_hours}h SLA deadline."
                        )
                    })

                elif c.status == 'assigned':
                    return Response({
                        "response": (
                            f"Complaint {c.complaint_id} has been Assigned to officer {officer_name} ({dept}). "
                            "Field work will commence shortly."
                        )
                    })

                elif c.status == 'rejected':
                    return Response({
                        "response": (
                            f"Complaint {c.complaint_id} was marked as Rejected. "
                            f"Reason: {c.resolution_note or 'Insufficient information or duplicate report'}. "
                            "You may file a revised complaint with updated photos and location."
                        )
                    })

                else:
                    return Response({
                        "response": (
                            f"Complaint {c.complaint_id} is Pending review by the municipal administrator. "
                            "It will be verified and dispatched to the concerned department shortly."
                        )
                    })

            except Complaint.DoesNotExist:
                return Response({
                    "response": f"I could not find any complaint with tracking ID {cid}. Please double-check the ID."
                })

        # 2. Check if user is asking for their complaints / status summary
        if any(w in msg_lower for w in ["my complaint", "status", "recent", "my issues", "tracking"]):
            user_complaints = Complaint.objects.filter(user=user).order_by('-created_at')[:3]
            if not user_complaints.exists():
                return Response({
                    "response": (
                        "You haven't reported any civic complaints yet. "
                        "Click 'Report Problem' to submit an issue with photos and GPS location."
                    )
                })

            summary_items = []
            for uc in user_complaints:
                summary_items.append(f"• {uc.complaint_id} ({uc.title}): {uc.get_status_display()}")

            complaints_list = "\n".join(summary_items)
            return Response({
                "response": (
                    f"Here is the status of your recent complaints:\n{complaints_list}\n\n"
                    "You can ask me about any specific ID like 'Where is CF-2026-XXXX?' for deeper details!"
                )
            })

        # 3. Questions about how to report, SLAs, or general help
        if "how to report" in msg_lower or "report a problem" in msg_lower or "pothole" in msg_lower:
            return Response({
                "response": (
                    "To report a civic problem, go to 'Report Problem' in the navigation bar. "
                    "Enter a title and description, use our 'Analyze With AI' button to automatically determine "
                    "the category and priority, take or upload a photo, pinpoint the GPS location, and click Submit!"
                )
            })

        if "sla" in msg_lower or "deadline" in msg_lower or "hours" in msg_lower:
            return Response({
                "response": (
                    "CivicFix enforces a standard 48-hour Service Level Agreement (SLA) for civic issues. "
                    "Critical issues receive prioritized dispatch. If an SLA is breached, complaints are flagged "
                    "as Overdue in the Municipal Admin Command Center for immediate executive intervention."
                )
            })

        if "officer" in msg_lower or "who is handling" in msg_lower:
            return Response({
                "response": (
                    "Municipal administrators review each complaint and assign it to a verified field officer from "
                    "the relevant department (Roads, Electricity, Sanitation, Water Supply, Traffic). "
                    "Provide your complaint ID (e.g., 'Who is handling CF-2026-1234?') and I will check the assigned officer for you!"
                )
            })

        # Fallback intelligent response
        return Response({
            "response": (
                "Hello! I am your CivicFix Municipal AI Assistant. You can ask me:\n"
                "• 'What is the status of my complaints?'\n"
                "• 'Where is CF-2026-XXXX?'\n"
                "• 'Who is handling my complaint?'\n"
                "• 'How do I report a pothole or street light issue?'\n"
                "• 'What is the SLA resolution deadline?'\n\n"
                "How can I assist you today?"
            )
        })
