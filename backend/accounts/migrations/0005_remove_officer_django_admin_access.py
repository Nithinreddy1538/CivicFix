from django.db import migrations


def remove_officer_admin_access(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('accounts', 'UserProfile')
    officer_user_ids = UserProfile.objects.filter(role='officer').values_list('user_id', flat=True)
    User.objects.filter(
        id__in=officer_user_ids,
        is_staff=True,
        is_superuser=False,
    ).update(is_staff=False)


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0004_alter_userprofile_department'),
    ]

    operations = [
        migrations.RunPython(remove_officer_admin_access, migrations.RunPython.noop),
    ]
