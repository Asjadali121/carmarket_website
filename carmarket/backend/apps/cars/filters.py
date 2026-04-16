import django_filters
from .models import Car


class CarFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')
    brand = django_filters.CharFilter(lookup_expr='icontains')
    model = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    tags = django_filters.CharFilter(field_name='tags__slug', lookup_expr='exact')

    class Meta:
        model = Car
        fields = ['brand', 'model', 'year', 'fuel_type', 'transmission',
                  'condition', 'category', 'car_type', 'car_class',
                  'city', 'status', 'is_featured']
