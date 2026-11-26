from django.contrib.auth.models import User

from accounts.permissions import has_admin_access
from .models import Notification


def notify_admins(title, message):
    """Send an operational update to active admin accounts only."""
    admins = User.objects.filter(is_active=True).select_related('profile')
    for admin in admins:
        if has_admin_access(admin):
            Notification.objects.create(user=admin, title=title, message=message)
