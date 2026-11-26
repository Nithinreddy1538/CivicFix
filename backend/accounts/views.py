from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .serializers import RegisterSerializer
from .models import UserProfile
from .permissions import has_admin_access


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

        username = (
            request.data.get('username')
            or request.data.get('email')
            or request.data.get('identifier')
            or ''
        ).strip()
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

        # Field agents use the email address assigned by an administrator.
        if user is None and username and '@' in username:
            user_obj = User.objects.filter(email__iexact=username).first()
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

        if not has_admin_access(request.user):
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = User.objects.filter(
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

        if not has_admin_access(request.user):
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

        if not username or not password or not email:
            return Response(
                {'message': 'Username, email address, and password are required for an agent account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'message': 'Enter a valid email address for the agent.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'message': f'Username "{username}" is already taken. Please choose another.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'message': f'Email address "{email}" is already assigned to another account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=False,
            is_active=True
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'officer'
        profile.phone = phone
        profile.department = department or 'General'
        profile.save()

        return Response(
            {
                'message': f'Agent {username} created successfully. They can sign in with {email}.',
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


class AdminUserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_admin_access(request.user):
            return Response(
                {'message': 'Admin access required to view account records.'},
                status=status.HTTP_403_FORBIDDEN
            )

        profiles = UserProfile.objects.select_related('user').filter(
            role__in=['citizen', 'officer'],
            user__is_superuser=False,
        ).order_by('-user__date_joined')

        accounts = []
        for profile in profiles:
            user = profile.user
            accounts.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': profile.role,
                'department': profile.department,
                'is_active': user.is_active,
                'date_joined': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
            })

        return Response(accounts)

    def patch(self, request):
        if not has_admin_access(request.user):
            return Response(
                {'message': 'Admin access required to update account records.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        is_active = request.data.get('is_active')
        if user_id is None or not isinstance(is_active, bool):
            return Response(
                {'message': 'Provide a user_id and a boolean is_active value.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = UserProfile.objects.select_related('user').filter(
            user_id=user_id,
            role__in=['citizen', 'officer'],
            user__is_superuser=False,
        ).first()
        if profile is None:
            return Response(
                {'message': 'Citizen or agent account not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        profile.user.is_active = is_active
        profile.user.save(update_fields=['is_active'])

        return Response({
            'message': 'Account activated.' if is_active else 'Account deactivated.',
            'user_id': profile.user_id,
            'is_active': is_active,
        })

