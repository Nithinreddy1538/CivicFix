import logging
import secrets
from datetime import timedelta

from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.mail import send_mail
from django.core import signing
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone
from .serializers import RegisterSerializer
from .models import PasswordResetCode, UserProfile
from .permissions import has_admin_access

logger = logging.getLogger(__name__)


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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        generic_response = {
            'message': 'If this email belongs to a citizen or officer account, a reset code has been sent.'
        }
        if not email:
            return Response({'message': 'Enter your registered email address.'}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'message': 'Enter a valid email address.'}, status=400)

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
            profile__role__in=['citizen', 'officer'],
        ).first()
        if not user:
            return Response(generic_response, status=200)

        now = timezone.now()
        recent_requests = PasswordResetCode.objects.filter(
            user=user,
            created_at__gte=now - timedelta(hours=1),
        ).count()
        if recent_requests >= 5:
            return Response(generic_response, status=200)

        PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(used_at=now)
        recovery_code = secrets.token_urlsafe(32)
        PasswordResetCode.objects.create(
            user=user,
            code_hash=make_password(recovery_code),
            expires_at=now + timedelta(minutes=10),
        )
        try:
            sent = send_mail(
                subject='Your CivicFix password recovery code',
                message=(
                    f'Your CivicFix password recovery code is:\n\n{recovery_code}\n\n'
                    'Enter this code on the password reset page. It expires in 10 minutes and can only be used once. '
                    'If you did not request this, you can ignore this email.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            if not sent:
                raise RuntimeError('The configured mail service did not accept the reset email.')
        except Exception:
            logger.exception('Unable to deliver a CivicFix password reset email.')
            PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(used_at=now)
            return Response(
                {'message': 'Password reset email delivery is unavailable right now. Please contact the site administrator.'},
                status=503,
            )

        return Response(generic_response, status=200)


class PasswordResetVerifyRecoveryCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        recovery_code = str(request.data.get('recovery_code', '')).strip()
        if not email or not recovery_code:
            return Response({'message': 'Email and recovery code are required.'}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'message': 'Enter a valid email address.'}, status=400)

        now = timezone.now()
        reset_code = PasswordResetCode.objects.filter(
            user__email__iexact=email,
            user__is_active=True,
            user__profile__role__in=['citizen', 'officer'],
            used_at__isnull=True,
            expires_at__gt=now,
            attempts__lt=5,
        ).select_related('user').first()
        if not reset_code or not check_password(recovery_code, reset_code.code_hash):
            if reset_code:
                reset_code.attempts += 1
                if reset_code.attempts >= 5:
                    reset_code.used_at = now
                reset_code.save(update_fields=['attempts', 'used_at'])
            return Response({'message': 'The recovery code is invalid or expired. Request a new code.'}, status=400)

        reset_token = signing.dumps(
            {'email': email, 'user_id': reset_code.user_id, 'code_id': reset_code.id},
            salt='civicfix.password-reset',
        )
        return Response({'message': 'Account verified. You can now set a new password.', 'reset_token': reset_token})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        reset_token = str(request.data.get('reset_token', '')).strip()
        new_password = str(request.data.get('new_password', ''))
        confirm_password = str(request.data.get('confirm_password', ''))

        if not email or not reset_token or not new_password or not confirm_password:
            return Response({'message': 'Email, reset link, and both password fields are required.'}, status=400)
        if new_password != confirm_password:
            return Response({'message': 'The passwords do not match.'}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'message': 'Enter a valid email address.'}, status=400)

        try:
            token_data = signing.loads(reset_token, salt='civicfix.password-reset', max_age=600)
        except signing.SignatureExpired:
            return Response({'message': 'Account verification expired. Request a new recovery code.'}, status=400)
        except signing.BadSignature:
            return Response({'message': 'Account verification is invalid. Request a new recovery code.'}, status=400)
        if token_data.get('email') != email:
            return Response({'message': 'Account verification is invalid. Request a new recovery code.'}, status=400)

        reset_code = PasswordResetCode.objects.filter(
            pk=token_data.get('code_id'),
            user_id=token_data.get('user_id'),
            user__email__iexact=email,
            user__is_active=True,
            user__profile__role__in=['citizen', 'officer'],
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
            attempts__lt=5,
        ).select_related('user').first()
        if not reset_code:
            return Response({'message': 'Account verification expired. Request a new recovery code.'}, status=400)

        try:
            validate_password(new_password, user=reset_code.user)
        except ValidationError as error:
            return Response({'message': ' '.join(error.messages)}, status=400)

        reset_code.user.set_password(new_password)
        reset_code.user.save(update_fields=['password'])
        reset_code.used_at = timezone.now()
        reset_code.save(update_fields=['used_at'])
        PasswordResetCode.objects.filter(
            user=reset_code.user,
            used_at__isnull=True,
        ).update(used_at=timezone.now())
        return Response({'message': 'Password reset successfully. You can now sign in with your new password.'})


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

