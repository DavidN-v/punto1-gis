from rest_framework import serializers

from .models import FavoriteLocation


class FavoriteLocationSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)

    class Meta:
        model = FavoriteLocation
        fields = ["id", "name", "latitude", "longitude"]
