def has_admin_access(user):
    if not user or not user.is_authenticated:
        return False

    try:
        profile = user.profile
    except AttributeError:
        profile = None

    return bool(
        user.is_superuser
        or (user.is_staff and profile and profile.role == 'admin')
    )
