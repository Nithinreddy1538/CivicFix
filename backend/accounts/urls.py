from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    StaffUserListView,
    AdminUserManagementView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('password-reset/request/', PasswordResetRequestView.as_view()),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('staff/', StaffUserListView.as_view()),
    path('users/', AdminUserManagementView.as_view()),
]
