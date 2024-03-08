# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Define a custom field if you wish to include it in the response
    role = serializers.CharField(read_only=True)

    def validate(self, attrs):
        # This method is called when the user is logging in
        data = super().validate(attrs)

        # Include additional response data here
        data['role'] = self.user.role

        # You can print to see the output in console
        print(data)

        return data
