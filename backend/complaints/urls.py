from django.urls import path

from .views import (
    ComplaintListCreateView,
    ComplaintDetailView,
    ComplaintStatusUpdateView,
    ComplaintAssignmentView,
    OfficerComplaintListView,
    OfficerComplaintUpdateView,
    ComplaintAnalyticsView,
    PublicComplaintTrackingView,
    ComplaintFeedbackView,
    ComplaintReceiptView,
    ReverseGeocodeView
)

urlpatterns = [

    path(
        'reverse-geocode/',
        ReverseGeocodeView.as_view()
    ),

    path(
        '',
        ComplaintListCreateView.as_view()
    ),

    path(
        'analytics/',
        ComplaintAnalyticsView.as_view()
    ),

    path(
        'track/<str:complaint_id>/',
        PublicComplaintTrackingView.as_view()
    ),

    path(
        '<int:pk>/',
        ComplaintDetailView.as_view()
    ),

    path(
        '<int:pk>/receipt/',
        ComplaintReceiptView.as_view()
    ),

    path(
        '<int:pk>/feedback/',
        ComplaintFeedbackView.as_view()
    ),

    path(
        '<int:pk>/status/',
        ComplaintStatusUpdateView.as_view()
    ),

    path(
        '<int:pk>/assign/',
        ComplaintAssignmentView.as_view()
    ),

    path(
        'officer/',
        OfficerComplaintListView.as_view()
    ),

    path(
        'officer/<int:pk>/update/',
        OfficerComplaintUpdateView.as_view()
    ),

]

