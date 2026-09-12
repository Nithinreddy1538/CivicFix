from django.urls import path
from .views import (
    ComplaintClassificationView,
    DuplicateDetectionView,
    AIAssistantView
)

urlpatterns = [
    path('classify/', ComplaintClassificationView.as_view()),
    path('duplicate-check/', DuplicateDetectionView.as_view()),
    path('assistant/', AIAssistantView.as_view()),
]

