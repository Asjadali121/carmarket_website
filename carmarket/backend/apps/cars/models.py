from django.db import models
from django.conf import settings


class Category(models.Model):
    """Purpose-based classification: Economy, Luxury, Sports, etc."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class CarType(models.Model):
    """Body type: Sedan, SUV, Hatchback, etc."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarClass(models.Model):
    """Market segment: Micro, Compact, Executive, etc."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Car Classes'


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Car(models.Model):
    FUEL_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('cng', 'CNG'),
        ('lpg', 'LPG'),
    ]
    TRANSMISSION_CHOICES = [
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
        ('cvt', 'CVT'),
        ('dct', 'DCT'),
    ]
    DRIVE_CHOICES = [
        ('fwd', 'FWD'),
        ('rwd', 'RWD'),
        ('awd', 'AWD'),
        ('4wd', '4WD'),
    ]
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
        ('certified', 'Certified Pre-Owned'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    ]

    # Basic info
    title = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    variant = models.CharField(max_length=100, blank=True)
    year = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.IntegerField(help_text='Mileage in km')

    # Technical specs
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default='petrol')
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default='manual')
    drive_type = models.CharField(max_length=10, choices=DRIVE_CHOICES, default='fwd')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    engine_capacity = models.IntegerField(help_text='Engine CC', blank=True, null=True)
    color = models.CharField(max_length=50, blank=True)

    # Classification
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='cars')
    car_type = models.ForeignKey(CarType, on_delete=models.SET_NULL, null=True, related_name='cars')
    car_class = models.ForeignKey(CarClass, on_delete=models.SET_NULL, null=True, related_name='cars')
    tags = models.ManyToManyField(Tag, blank=True, related_name='cars')

    # Description
    description = models.TextField()
    features = models.TextField(blank=True, help_text='Comma-separated features')
    video_url = models.URLField(blank=True)

    # Location
    location = models.CharField(max_length=200)
    city = models.CharField(max_length=100)

    # Relations
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'Image for {self.car.title}'
