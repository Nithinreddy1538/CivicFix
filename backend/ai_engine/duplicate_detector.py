from complaints.models import Complaint


def find_duplicates(
    category,
    latitude,
    longitude
):

    if latitude is None or longitude is None:
        return []

    complaints = Complaint.objects.filter(
        category=category
    ).exclude(
        status__in=['resolved', 'rejected']
    )

    matches = []

    for complaint in complaints:

        if (
            complaint.latitude is None or
            complaint.longitude is None
        ):
            continue

        lat_difference = abs(
            float(complaint.latitude) -
            float(latitude)
        )

        lng_difference = abs(
            float(complaint.longitude) -
            float(longitude)
        )

        # Roughly within 150-200 meters
        if (
            lat_difference < 0.002 and
            lng_difference < 0.002
        ):
            matches.append({
                "id": complaint.id,
                "complaint_id": complaint.complaint_id,
                "title": complaint.title,
                "category": complaint.category,
                "status": complaint.status,
                "location": complaint.location,
                "created_at": complaint.created_at.strftime("%d-%m-%Y %H:%M")
            })

    return matches[:5]

