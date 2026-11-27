import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from accounts.models import UserProfile


class Command(BaseCommand):
    help = "Create or update the Fixora administrator account"

    def handle(self, *args, **options):
        password = os.getenv("CIVICFIX_ADMIN_PASSWORD")
        if not password:
            raise CommandError(
                "Set CIVICFIX_ADMIN_PASSWORD in the environment before creating the admin account."
            )

        username = os.getenv("CIVICFIX_ADMIN_USERNAME", "admin").strip() or "admin"
        email = os.getenv("CIVICFIX_ADMIN_EMAIL", "").strip()

        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.email = email
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()

        UserProfile.objects.update_or_create(
            user=user,
            defaults={"role": "admin"},
        )

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{action} Fixora administrator account: {username}")
        )
