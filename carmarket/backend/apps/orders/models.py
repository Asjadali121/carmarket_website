from django.db import models
from django.conf import settings
from apps.cars.models import Car
import uuid


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Cart of {self.user.email}'

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    @property
    def subtotal(self):
        return self.car.price * self.quantity

    class Meta:
        unique_together = ['cart', 'car']


class Order(models.Model):
    PAYMENT_CHOICES = [
        ('full', 'Full Payment'),
        ('installment', 'Installment'),
        ('booking', 'Booking Deposit'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=20, unique=True, editable=False)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='full')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    booking_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Installment fields
    down_payment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    monthly_installment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    duration_months = models.IntegerField(null=True, blank=True)

    # Contact
    buyer_name = models.CharField(max_length=200)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=20)
    buyer_address = models.TextField(blank=True)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'ORD-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Order {self.order_number}'

    class Meta:
        ordering = ['-created_at']
