import re

from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import has_admin_access
from complaints.models import Complaint
from .classifier import classify_complaint
from .duplicate_detector import find_duplicates


class ComplaintClassificationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        text = request.data.get('text', '')
        if not str(text).strip():
            return Response({'message': 'Complaint text is required'}, status=400)
        try:
            return Response(classify_complaint(str(text)))
        except Exception:
            return Response({
                'category': 'other', 'priority': 'medium',
                'department': 'General',
            })


class DuplicateDetectionView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        category = request.data.get('category')
        if not category:
            return Response({'message': 'Category is required'}, status=400)
        duplicates = find_duplicates(
            category, request.data.get('latitude'), request.data.get('longitude')
        )
        return Response({
            'is_duplicate': bool(duplicates), 'count': len(duplicates),
            'duplicates': duplicates,
        })


class AIAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = str(request.data.get('message', '')).strip()
        if not message:
            return Response({'message': 'Query message is required'}, status=400)
        if len(message) > 1000:
            return Response({'message': 'Please keep your question under 1000 characters.'}, status=400)

        user = request.user
        lower = message.lower()
        is_admin = has_admin_access(user)
        is_officer = not is_admin and getattr(getattr(user, 'profile', None), 'role', '') == 'officer'

        if is_admin:
            complaints = Complaint.objects.all()
            role_label = 'administrator'
        elif is_officer:
            complaints = Complaint.objects.filter(assigned_to=user)
            role_label = 'officer'
        else:
            complaints = Complaint.objects.filter(user=user)
            role_label = 'citizen'

        # Every complaint lookup is constrained to the signed-in user's role scope.
        match = re.search(r'cf-\d{4}-\d{4}', lower)
        if match:
            cid = match.group(0).upper()
            complaint = complaints.filter(complaint_id__iexact=cid).first()
            if not complaint:
                return Response({'response': (
                    f'I could not find {cid} in the complaints available to your {role_label} account. '
                    'Check the ID or open the complaint from your dashboard.'
                )})
            reply = (
                f'{complaint.complaint_id} — {complaint.title}\n'
                f'Status: {complaint.get_status_display()}\n'
                f'Department: {complaint.department or "Not assigned"}\n'
                f'Priority: {complaint.get_priority_display()}\n'
                f'Assigned officer: {complaint.assigned_to.get_full_name() or complaint.assigned_to.username if complaint.assigned_to else "Not assigned"}'
            )
            if complaint.status == 'resolved' and complaint.resolution_note:
                reply += f'\nResolution: {complaint.resolution_note}'
            if complaint.status == 'rejected' and complaint.resolution_note:
                reply += f'\nReview note: {complaint.resolution_note}'
            return Response({'response': reply})

        if is_admin and any(word in lower for word in ('officer', 'agent', 'staff', 'account', 'citizen', 'user')):
            officers = User.objects.filter(is_active=True, profile__role='officer').count()
            citizens = User.objects.filter(is_active=True, profile__role='citizen').count()
            return Response({'response': (
                f'There are {officers} active officers/agents and {citizens} active citizen accounts. '
                'Use Admin Console → Agents & Officers to create staff accounts, or Citizen Accounts to review citizen access.'
            )})

        if is_admin and any(word in lower for word in ('assign', 'reassign', 'dispatch')):
            return Response({'response': 'Open Admin Console → Complaints, select a case, choose an active officer from the assignment panel, confirm the department, and save. The citizen and officer are notified when assignment succeeds.'})

        if is_officer and any(word in lower for word in ('resolve', 'resolution', 'close', 'proof', 'complete')):
            return Response({'response': 'Open the assigned complaint in Agent Workspace, choose Resolved, enter a clear resolution note, attach a proof image, and save. The citizen and administrators receive a status notification.'})

        if any(word in lower for word in ('my complaint', 'my report', 'my issue', 'status', 'track', 'recent', 'assigned to me', 'my work', 'workload', 'queue', 'how many', 'overview', 'dashboard', 'complaints', 'cases')):
            if is_admin:
                counts = complaints.values('status').annotate(total=Count('id'))
                totals = {row['status']: row['total'] for row in counts}
                return Response({'response': (
                    f'Admin overview: {complaints.count()} total complaints; '
                    f'{totals.get("pending", 0)} pending, {totals.get("assigned", 0)} assigned, '
                    f'{totals.get("in_progress", 0)} in progress, {totals.get("resolved", 0)} resolved, '
                    f'{totals.get("rejected", 0)} rejected. Open the Admin Console to assign work, '
                    'review citizen accounts, and inspect analytics.'
                )})
            if is_officer:
                counts = complaints.values('status').annotate(total=Count('id'))
                totals = {row['status']: row['total'] for row in counts}
                items = complaints.order_by('-created_at')[:5]
                lines = [f'{c.complaint_id} ({c.title}) — {c.get_status_display()}' for c in items]
                summary = '\n'.join(lines) if lines else 'No complaints are currently assigned to you.'
                return Response({'response': (
                    f'Your assigned workload: {complaints.count()} total; '
                    f'{totals.get("assigned", 0)} assigned, {totals.get("in_progress", 0)} in progress, '
                    f'{totals.get("resolved", 0)} resolved.\n{summary}\n'
                    'Open Agent Workspace to update a complaint. Resolution requires a note and proof image.'
                )})
            items = complaints.order_by('-created_at')[:5]
            if not items:
                return Response({'response': 'You have not submitted a complaint yet. Choose Report Problem to file one and track it here.'})
            lines = [f'{c.complaint_id} ({c.title}) — {c.get_status_display()}' for c in items]
            return Response({'response': 'Your recent complaints:\n' + '\n'.join(lines) + '\nAsk about a complaint using its tracking ID for details.'})

        if any(word in lower for word in ('report', 'submit', 'pothole', 'street light', 'garbage', 'water leak', 'drain')):
            if is_officer:
                return Response({'response': 'Your role handles assigned field work. Open Agent Workspace, select an assigned complaint, and update its status. Contact an administrator if work needs reassignment.'})
            if is_admin:
                return Response({'response': 'Citizens submit issues with Report Problem. You can review new submissions in Admin Console → Complaints, set priority, and assign an officer.'})
            return Response({'response': 'Open Report Problem, describe the issue, select its location, and submit it. You can attach a photo; after submission, use My Complaints or Notifications to follow progress.'})

        if any(word in lower for word in ('sla', 'deadline', 'overdue', 'how long', 'hours')):
            if is_admin:
                return Response({'response': 'Each complaint stores its SLA duration. Review overdue items and priorities in Admin Console → Complaints and Analytics; assign urgent work to an available officer.'})
            if is_officer:
                return Response({'response': 'Check the complaint details for its SLA duration and priority. Update progress promptly in Agent Workspace; add a resolution note and proof image when closing work.'})
            return Response({'response': 'Your complaint’s target is based on its SLA duration and priority. Ask me about its tracking ID to see its current status, and check Notifications for each update.'})

        if any(word in lower for word in ('notification', 'alert', 'update')):
            return Response({'response': 'Open Notifications to see updates for your account. New complaint submissions, assignments, status changes, and feedback events are delivered to the relevant citizen, assigned officer, and administrators.'})

        if is_admin:
            guidance = 'I can summarize complaint totals, report officer and citizen account counts, and explain how to review, assign, and monitor cases in Admin Console.'
        elif is_officer:
            guidance = 'I can summarize your assigned workload, look up complaints assigned to you, explain status updates, and guide resolution notes and proof uploads.'
        else:
            guidance = 'I can show your complaint statuses, explain reporting and notifications, and help you follow up with a complaint tracking ID.'
        return Response({'response': f'For your {role_label} account, {guidance}'})
