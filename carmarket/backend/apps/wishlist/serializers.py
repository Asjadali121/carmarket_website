from rest_framework import serializers
from .models import Wishlist
from apps.cars.serializers import CarListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    car = CarListSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'car', 'car_id', 'added_at']
        read_only_fields = ['id', 'added_at']
