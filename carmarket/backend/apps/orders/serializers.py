from rest_framework import serializers
from .models import Cart, CartItem, Order
from apps.cars.serializers import CarListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    car = CarListSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'car', 'car_id', 'quantity', 'subtotal', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    car_details = CarListSerializer(source='car', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'buyer', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        exclude = ['buyer', 'order_number', 'status']

    def create(self, validated_data):
        order = Order.objects.create(
            buyer=self.context['request'].user,
            **validated_data
        )
        # Mark the car as sold
        if order.car:
            order.car.status = 'sold'
            order.car.save(update_fields=['status'])
        return order
