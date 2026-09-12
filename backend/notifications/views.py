from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)


class NotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        try:
            notification = Notification.objects.get(
                pk=pk,
                user=request.user
            )
        except Notification.DoesNotExist:
            return Response(
                {'message': 'Notification not found'},
                status=404
            )

        notification.is_read = True
        notification.save()

        return Response(
            {'message': 'Notification marked as read'}
        )


class NotificationReadAllView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response(
            {'message': 'All notifications marked as read'}
        )
