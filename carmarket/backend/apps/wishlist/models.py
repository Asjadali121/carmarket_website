from django.db import models
from django.conf import settings
from apps.cars.models import Car


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'car']
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.user.email} — {self.car.title}'
