from rest_framework import serializers
from .models import (
    Complaint,
    ComplaintStatusHistory,
    ComplaintFeedback
)


class ComplaintFeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = ComplaintFeedback
        fields = [
            'id',
            'complaint',
            'rating',
            'comment',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'complaint',
            'created_at'
        ]


class ComplaintStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintStatusHistory
        fields = '__all__'


class ComplaintSerializer(serializers.ModelSerializer):
    status_history = ComplaintStatusHistorySerializer(many=True, read_only=True)
    assigned_officer = serializers.SerializerMethodField()
    feedback = ComplaintFeedbackSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'tracking_token',
            'user',
            'assigned_to',
            'assigned_officer',
            'department',
            'category',
            'title',
            'description',
            'image',
            'location',
            'latitude',
            'longitude',
            'priority',
            'status',
            'resolution_note',
            'resolution_image',
            'created_at',
            'updated_at',
            'resolved_at',
            'sla_hours',
            'status_history',
            'feedback'
        ]

        read_only_fields = [
            'complaint_id',
            'tracking_token',
            'user',
            'assigned_to',
            'assigned_officer',
            'department',
            'status',
            'created_at',
            'updated_at',
            'resolved_at',
            'sla_hours'
        ]

    def get_assigned_officer(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.username
        return None


class PublicStatusHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ComplaintStatusHistory
        fields = [
            'status',
            'note',
            'created_at'
        ]


class PublicComplaintTrackingSerializer(serializers.ModelSerializer):

    status_history = PublicStatusHistorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Complaint

        fields = [
            'complaint_id',
            'tracking_token',
            'category',
            'title',
            'location',
            'priority',
            'status',
            'department',
            'created_at',
            'updated_at',
            'resolved_at',
            'sla_hours',
            'resolution_note',
            'resolution_image',
            'status_history'
        ]

