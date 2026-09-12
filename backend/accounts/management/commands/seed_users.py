from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile


class Command(BaseCommand):
    help = "Create default CivicFix demo users"

    def handle(self, *args, **options):

        users = [
            {
                "username": "admin",
                "password": "Admin@123",
                "role": "admin",
            },
            {
                "username": "officer1",
                "password": "Officer@123",
                "role": "officer",
            },
            {
                "username": "citizen1",
                "password": "Citizen@123",
                "role": "citizen",
            },
        ]

        for data in users:

            user, created = User.objects.get_or_create(
                username=data["username"]
            )

            user.set_password(data["password"])
            user.is_active = True

            if data["role"] == "admin":
                user.is_staff = True
                user.is_superuser = True
            else:
                user.is_staff = False
                user.is_superuser = False

            user.save()

            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "role": data["role"],
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created user: {data['username']} ({data['role']})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Updated user: {data['username']} ({data['role']})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS("CivicFix demo users are ready.")
        )