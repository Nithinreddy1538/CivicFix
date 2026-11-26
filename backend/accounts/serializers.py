from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    phone = serializers.CharField(
        write_only=True,
        required=False
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone'
        ]

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return normalized_email

    def create(self, validated_data):

        phone = validated_data.pop('phone', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        UserProfile.objects.create(
            user=user,
            phone=phone
        )

        return user

