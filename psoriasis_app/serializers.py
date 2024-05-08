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
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        data['username'] = self.user.username
        data['password'] = self.user.password
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['id'] = self.user.id

        return data
