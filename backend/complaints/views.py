import random
from datetime import timedelta
from io import BytesIO
from django.http import FileResponse
from django.contrib.auth.models import User
from django.db.models import Count, Avg
from django.utils import timezone
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Complaint, ComplaintStatusHistory, ComplaintFeedback
from .serializers import (
    ComplaintSerializer,
    PublicComplaintTrackingSerializer,
    ComplaintFeedbackSerializer
)
from notifications.models import Notification


def generate_complaint_id():
    while True:
        number = random.randint(1000, 9999)
        complaint_id = f"CF-2026-{number}"

        if not Complaint.objects.filter(complaint_id=complaint_id).exists():
            return complaint_id


class ComplaintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser:
            complaints = Complaint.objects.all().order_by('-created_at')
        elif hasattr(request.user, 'profile') and request.user.profile.role == 'officer':
            complaints = Complaint.objects.filter(
                assigned_to=request.user
            ).order_by('-created_at')
        else:
            complaints = Complaint.objects.filter(
                user=request.user
            ).order_by('-created_at')

        serializer = ComplaintSerializer(
            complaints,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    def post(self, request):
        complaint_id = generate_complaint_id()

        serializer = ComplaintSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            complaint = serializer.save(
                user=request.user,
                complaint_id=complaint_id
            )

            ComplaintStatusHistory.objects.create(
                complaint=complaint,
                status='pending',
                note='Complaint registered by citizen',
                changed_by=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ComplaintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)

            if self.request.user.is_superuser:
                return complaint

            if (
                hasattr(self.request.user, 'profile')
                and self.request.user.profile.role == 'officer'
                and complaint.assigned_to == self.request.user
            ):
                return complaint

            if complaint.user == self.request.user:
                return complaint

            return None
        except Complaint.DoesNotExist:
            return None

    def get(self, request, pk):
        complaint = self.get_object(pk)

        if not complaint:
            return Response(
                {'message': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ComplaintSerializer(
            complaint,
            context={'request': request}
        )

        return Response(serializer.data)

    def delete(self, request, pk):
        if not (request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response(
                {'message': 'Admin access required to delete complaints.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response(
                {'message': 'Complaint not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cid = complaint.complaint_id
        complaint.delete()

        return Response(
            {'message': f'Complaint {cid} has been permanently deleted.'},
            status=status.HTTP_200_OK
        )


class ComplaintStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if not request.user.is_superuser:
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response(
                {'message': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('status')
        priority = request.data.get('priority')
        resolution_note = request.data.get('resolution_note')

        if new_status:
            complaint.status = new_status

            ComplaintStatusHistory.objects.create(
                complaint=complaint,
                status=new_status,
                note=resolution_note,
                changed_by=request.user
            )

            if new_status == 'resolved':
                complaint.resolved_at = timezone.now()

            Notification.objects.create(
                user=complaint.user,
                title='Complaint Status Updated',
                message=f'Your complaint {complaint.complaint_id} is now {new_status.replace("_", " ")}.'
            )

        if priority:
            complaint.priority = priority

        if resolution_note:
            complaint.resolution_note = resolution_note

        complaint.save()

        serializer = ComplaintSerializer(
            complaint,
            context={'request': request}
        )

        return Response(serializer.data)


class ComplaintAssignmentView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        if not request.user.is_superuser:
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response(
                {'message': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        assigned_to_id = request.data.get('assigned_to')
        department = request.data.get('department')

        if not assigned_to_id:
            return Response(
                {'message': 'Officer is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            officer = User.objects.get(
                id=assigned_to_id,
                is_staff=True
            )
        except User.DoesNotExist:
            return Response(
                {'message': 'Officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        complaint.assigned_to = officer
        complaint.department = department

        if complaint.status == 'pending':
            complaint.status = 'assigned'

            ComplaintStatusHistory.objects.create(
                complaint=complaint,
                status='assigned',
                note=f'Complaint assigned to {officer.username}',
                changed_by=request.user
            )

        complaint.save()

        Notification.objects.create(
            user=complaint.user,
            title='Complaint Assigned',
            message=f'Your complaint {complaint.complaint_id} has been assigned to the {department} department.'
        )

        Notification.objects.create(
            user=officer,
            title='New Complaint Assigned',
            message=f'Complaint {complaint.complaint_id} has been assigned to you.'
        )

        serializer = ComplaintSerializer(
            complaint,
            context={'request': request}
        )

        return Response(serializer.data)


class OfficerComplaintListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'officer':
            return Response(
                {'message': 'Officer access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        complaints = Complaint.objects.filter(
            assigned_to=request.user
        ).order_by('-created_at')

        serializer = ComplaintSerializer(
            complaints,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


class OfficerComplaintUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser
    ]

    def put(self, request, pk):

        if not hasattr(request.user, 'profile') or request.user.profile.role != 'officer':
            return Response(
                {'message': 'Officer access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            complaint = Complaint.objects.get(
                pk=pk,
                assigned_to=request.user
            )
        except Complaint.DoesNotExist:
            return Response(
                {'message': 'Complaint not assigned to you'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('status')
        note = request.data.get('note')
        resolution_image = request.FILES.get('resolution_image')

        allowed_statuses = [
            'assigned',
            'in_progress',
            'resolved'
        ]

        if new_status not in allowed_statuses:
            return Response(
                {'message': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status == 'resolved':

            if not note:
                return Response(
                    {'message': 'Resolution note is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not resolution_image and not complaint.resolution_image:
                return Response(
                    {'message': 'Resolution proof image is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        complaint.status = new_status

        if note:
            complaint.resolution_note = note

        if resolution_image:
            complaint.resolution_image = resolution_image

        if new_status == 'resolved':
            complaint.resolved_at = timezone.now()

        complaint.save()

        ComplaintStatusHistory.objects.create(
            complaint=complaint,
            status=new_status,
            note=note,
            changed_by=request.user
        )

        Notification.objects.create(
            user=complaint.user,
            title='Complaint Status Updated',
            message=f'Your complaint {complaint.complaint_id} is now {new_status.replace("_", " ")}.'
        )

        serializer = ComplaintSerializer(
            complaint,
            context={'request': request}
        )

        return Response(serializer.data)


class ComplaintAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_superuser:
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        complaints = Complaint.objects.all()

        total = complaints.count()

        pending = complaints.filter(
            status='pending'
        ).count()

        assigned = complaints.filter(
            status='assigned'
        ).count()

        in_progress = complaints.filter(
            status='in_progress'
        ).count()

        resolved = complaints.filter(
            status='resolved'
        ).count()

        rejected = complaints.filter(
            status='rejected'
        ).count()

        critical = complaints.filter(
            priority='critical'
        ).count()

        overdue = 0

        now = timezone.now()

        for complaint in complaints:

            if complaint.status in [
                'resolved',
                'rejected'
            ]:
                continue

            deadline = complaint.created_at + timedelta(
                hours=complaint.sla_hours
            )

            if now > deadline:
                overdue += 1

        department_data = list(
            complaints
            .exclude(department__isnull=True)
            .exclude(department='')
            .values('department')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        category_data = list(
            complaints
            .values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        priority_data = list(
            complaints
            .values('priority')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        officer_data = []

        officers = User.objects.filter(
            profile__role='officer',
            is_active=True
        )

        for officer in officers:

            assigned_count = complaints.filter(
                assigned_to=officer
            ).count()

            resolved_count = complaints.filter(
                assigned_to=officer,
                status='resolved'
            ).count()

            officer_data.append({
                'id': officer.id,
                'username': officer.username,
                'assigned': assigned_count,
                'resolved': resolved_count
            })

        feedback_average = complaints.filter(
            feedback__isnull=False
        ).aggregate(
            average=Avg('feedback__rating')
        )['average']

        resolution_rate = 0

        if total > 0:
            resolution_rate = round(
                (resolved / total) * 100,
                2
            )

        return Response({
            'summary': {
                'total': total,
                'pending': pending,
                'assigned': assigned,
                'in_progress': in_progress,
                'resolved': resolved,
                'rejected': rejected,
                'critical': critical,
                'overdue': overdue,
                'resolution_rate': resolution_rate,
                'average_rating': round(
                    feedback_average or 0,
                    2
                )
            },
            'departments': department_data,
            'categories': category_data,
            'priorities': priority_data,
            'officers': officer_data
        })


class ComplaintFeedbackView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            complaint = Complaint.objects.get(
                pk=pk,
                user=request.user
            )
        except Complaint.DoesNotExist:
            return Response(
                {'message': 'Complaint not found'},
                status=404
            )

        if complaint.status != 'resolved':
            return Response(
                {
                    'message':
                    'Feedback is available after resolution'
                },
                status=400
            )

        if hasattr(complaint, 'feedback'):
            return Response(
                {
                    'message':
                    'Feedback already submitted'
                },
                status=400
            )

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or int(rating) < 1 or int(rating) > 5:
            return Response(
                {'message': 'Rating must be between 1 and 5'},
                status=400
            )

        feedback = ComplaintFeedback.objects.create(
            complaint=complaint,
            rating=int(rating),
            comment=comment
        )

        return Response(
            ComplaintFeedbackSerializer(feedback).data,
            status=201
        )



class PublicComplaintTrackingView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, complaint_id):

        try:
            complaint = Complaint.objects.get(
                complaint_id__iexact=complaint_id
            )

        except Complaint.DoesNotExist:

            return Response(
                {
                    'message': 'Complaint not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PublicComplaintTrackingSerializer(
            complaint,
            context={'request': request}
        )

        return Response(serializer.data)


class ComplaintReceiptView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response(
                {"message": "Complaint not found"},
                status=404
            )

        if request.user.is_superuser:
            pass
        elif complaint.user == request.user:
            pass
        elif complaint.assigned_to == request.user:
            pass
        else:
            return Response(
                {"message": "Access denied"},
                status=403
            )

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer,
            pagesize=A4
        )

        width, height = A4

        pdf.setFont(
            "Helvetica-Bold",
            22
        )

        pdf.drawString(
            50,
            height - 60,
            "CivicFix"
        )

        pdf.setFont(
            "Helvetica-Bold",
            16
        )

        pdf.drawString(
            50,
            height - 100,
            "Complaint Receipt"
        )

        y = height - 150

        data = [
            ("Complaint ID", complaint.complaint_id),
            ("Title", complaint.title),
            ("Category", complaint.get_category_display()),
            ("Priority", complaint.get_priority_display()),
            ("Status", complaint.get_status_display()),
            ("Location", complaint.location),
            ("Department", complaint.department or "Not assigned"),
            (
                "Created",
                complaint.created_at.strftime(
                    "%d-%m-%Y %H:%M"
                )
            ),
        ]

        pdf.setFont(
            "Helvetica",
            11
        )

        for label, value in data:

            pdf.setFont(
                "Helvetica-Bold",
                11
            )

            pdf.drawString(
                50,
                y,
                f"{label}:"
            )

            pdf.setFont(
                "Helvetica",
                11
            )

            pdf.drawString(
                170,
                y,
                str(value)
            )

            y -= 28

        y -= 10

        pdf.setFont(
            "Helvetica-Bold",
            12
        )

        pdf.drawString(
            50,
            y,
            "Description"
        )

        y -= 25

        pdf.setFont(
            "Helvetica",
            10
        )

        description = complaint.description

        lines = [
            description[i:i + 90]
            for i in range(
                0,
                len(description),
                90
            )
        ]

        for line in lines:

            pdf.drawString(
                50,
                y,
                line
            )

            y -= 18

        if complaint.resolution_note:

            y -= 15

            pdf.setFont(
                "Helvetica-Bold",
                12
            )

            pdf.drawString(
                50,
                y,
                "Resolution"
            )

            y -= 25

            pdf.setFont(
                "Helvetica",
                10
            )

            pdf.drawString(
                50,
                y,
                complaint.resolution_note[:1000]
            )

        pdf.setFont(
            "Helvetica",
            9
        )

        pdf.drawString(
            50,
            40,
            "Generated by CivicFix Civic Complaint Management System"
        )

        pdf.save()

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"{complaint.complaint_id}.pdf",
            content_type="application/pdf"
        )


import json
import urllib.request
import urllib.parse


class ReverseGeocodeView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        if not lat or not lon:
            return Response(
                {'message': 'Latitude (lat) and longitude (lon) are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'CivicFix-Municipal-Portal/1.0 (civicfix@municipal.gov)'}
            )

            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))

            address_obj = data.get('address', {})
            components = []
            road = address_obj.get('road') or address_obj.get('pedestrian') or address_obj.get('street')
            suburb = address_obj.get('suburb') or address_obj.get('neighbourhood') or address_obj.get('residential')
            city = address_obj.get('city') or address_obj.get('town') or address_obj.get('village') or address_obj.get('county')
            state = address_obj.get('state')

            if road:
                components.append(road)
            if suburb and suburb != road:
                components.append(suburb)
            if city and city not in components:
                components.append(city)
            if state and state not in components:
                components.append(state)

            formatted_location = ", ".join(components) if components else data.get('display_name', '')

            return Response({
                'location': formatted_location,
                'full_address': data.get('display_name', ''),
                'details': address_obj
            })

        except Exception as e:
            return Response({
                'location': f"GPS Location ({float(lat):.4f}, {float(lon):.4f})",
                'full_address': '',
                'details': {}
            })




