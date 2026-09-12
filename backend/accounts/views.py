from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from .models import UserProfile


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    'message': 'Registration successful',
                    'username': user.username
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        from django.contrib.auth import authenticate

        user = authenticate(
            username=username,
            password=password
        )

        if user is None and username:
            user_obj = User.objects.filter(username__iexact=username).first()
            if user_obj:
                user = authenticate(
                    username=user_obj.username,
                    password=password
                )

        if user is None:
            return Response(
                {'message': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        profile = getattr(user, 'profile', None)

        role = 'citizen'

        if user.is_superuser:
            role = 'admin'
        elif profile:
            role = profile.role

        return Response(
            {
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': user.username,
                'role': role,
                'is_admin': role == 'admin',
                'is_officer': role == 'officer'
            }
        )


class StaffUserListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = User.objects.filter(
            is_staff=True,
            is_active=True,
            profile__role='officer'
        ).order_by('-date_joined')

        data = []

        for user in users:
            profile = getattr(user, 'profile', None)
            active_count = getattr(user, 'assigned_complaints', None)
            assigned_count = active_count.exclude(status__in=['resolved', 'rejected']).count() if active_count else 0

            data.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': profile.phone if profile else '',
                'department': (profile.department if profile and profile.department else 'General'),
                'active_complaints': assigned_count,
                'date_joined': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else ''
            })

        return Response(data)

    def post(self, request):

        if not request.user.is_staff:
            return Response(
                {'message': 'Admin access required to recruit officers.'},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        email = request.data.get('email', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        phone = request.data.get('phone', '').strip()
        department = request.data.get('department', '').strip()

        if not username or not password:
            return Response(
                {'message': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'message': f'Username "{username}" is already taken. Please choose another.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_active=True
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'officer'
        profile.phone = phone
        profile.department = department or 'General'
        profile.save()

        return Response(
            {
                'message': f'Officer {username} recruited successfully!',
                'officer': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'department': profile.department,
                    'phone': profile.phone,
                    'date_joined': user.date_joined.strftime('%Y-%m-%d')
                }
            },
            status=status.HTTP_201_CREATED
        )

