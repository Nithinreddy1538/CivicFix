from django.contrib import admin
from .models import Complaint, ComplaintStatusHistory


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'complaint_id',
        'title',
        'category',
        'priority',
        'status',
        'created_at'
    )

    list_filter = (
        'category',
        'priority',
        'status'
    )

    search_fields = (
        'complaint_id',
        'title',
        'location'
    )


@admin.register(ComplaintStatusHistory)
class ComplaintStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'complaint',
        'status',
        'changed_by',
        'created_at'
    )