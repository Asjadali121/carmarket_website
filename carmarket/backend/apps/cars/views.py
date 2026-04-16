from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Car, CarImage, Category, CarType, CarClass, Tag
from .serializers import (CarListSerializer, CarDetailSerializer, CarCreateSerializer,
                           CategorySerializer, CarTypeSerializer, CarClassSerializer, TagSerializer)
from .filters import CarFilter


class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('seller', 'admin') or request.user.is_staff

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.role == 'admin':
            return True
        return obj.seller == request.user


class CarListCreateView(generics.ListCreateAPIView):
    queryset = Car.objects.filter(status='active').select_related(
        'category', 'car_type', 'car_class', 'seller'
    ).prefetch_related('images', 'tags')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['title', 'brand', 'model', 'description', 'city']
    ordering_fields = ['price', 'year', 'mileage', 'created_at', 'views_count']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CarCreateSerializer
        return CarListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSellerOrAdmin()]
        return [permissions.AllowAny()]


class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Car.objects.all().select_related(
        'category', 'car_type', 'car_class', 'seller'
    ).prefetch_related('images', 'tags')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CarCreateSerializer
        return CarDetailSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsSellerOrAdmin()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SellerCarsView(generics.ListAPIView):
    serializer_class = CarListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Car.objects.filter(seller=self.request.user).select_related(
            'category', 'car_type', 'car_class'
        ).prefetch_related('images', 'tags')


class AdminCarsView(generics.ListAPIView):
    serializer_class = CarListSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Car.objects.all().select_related('category', 'car_type', 'car_class', 'seller').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CarFilter
    search_fields = ['title', 'brand', 'model', 'seller__email']


class ApproveCarView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            car = Car.objects.get(pk=pk)
            car.status = 'active'
            car.save()
            return Response({'detail': 'Car approved.'})
        except Car.DoesNotExist:
            return Response({'detail': 'Car not found.'}, status=404)


class AddCarImageView(APIView):
    permission_classes = [IsSellerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            car = Car.objects.get(pk=pk)
            self.check_object_permissions(request, car)
            images = request.FILES.getlist('images')
            created = []
            for img in images:
                ci = CarImage.objects.create(
                    car=car, image=img,
                    is_primary=not car.images.exists()
                )
                created.append({'id': ci.id, 'image': request.build_absolute_uri(ci.image.url)})
            return Response(created, status=201)
        except Car.DoesNotExist:
            return Response({'detail': 'Car not found.'}, status=404)


class DeleteCarImageView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def delete(self, request, pk):
        try:
            img = CarImage.objects.get(pk=pk)
            self.check_object_permissions(request, img.car)
            img.delete()
            return Response(status=204)
        except CarImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=404)


class FeaturedCarsView(generics.ListAPIView):
    serializer_class = CarListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Car.objects.filter(status='active', is_featured=True).prefetch_related('images', 'tags')[:8]


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class CarTypeListView(generics.ListCreateAPIView):
    queryset = CarType.objects.all()
    serializer_class = CarTypeSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class CarClassListView(generics.ListCreateAPIView):
    queryset = CarClass.objects.all()
    serializer_class = CarClassSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class TagListView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.orders.models import Order
        User = get_user_model()
        total_users = User.objects.count()
        total_cars = Car.objects.count()
        active_cars = Car.objects.filter(status='active').count()
        pending_cars = Car.objects.filter(status='pending').count()
        total_orders = Order.objects.count()
        revenue = sum(o.total_amount for o in Order.objects.filter(status='completed'))
        recent_cars = CarListSerializer(
            Car.objects.order_by('-created_at')[:5], many=True, context={'request': request}
        ).data
        return Response({
            'total_users': total_users,
            'total_cars': total_cars,
            'active_cars': active_cars,
            'pending_cars': pending_cars,
            'total_orders': total_orders,
            'total_revenue': float(revenue),
            'recent_cars': recent_cars,
        })
