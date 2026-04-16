from django.urls import path
from .views import (CarListCreateView, CarDetailView, SellerCarsView,
                    AdminCarsView, ApproveCarView, AddCarImageView, DeleteCarImageView,
                    FeaturedCarsView, CategoryListView, CarTypeListView, CarClassListView,
                    TagListView, AdminDashboardView)

urlpatterns = [
    path('', CarListCreateView.as_view(), name='car_list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car_detail'),
    path('featured/', FeaturedCarsView.as_view(), name='featured_cars'),
    path('my-listings/', SellerCarsView.as_view(), name='seller_cars'),
    path('admin/all/', AdminCarsView.as_view(), name='admin_cars'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/<int:pk>/approve/', ApproveCarView.as_view(), name='approve_car'),
    path('<int:pk>/images/', AddCarImageView.as_view(), name='add_car_images'),
    path('images/<int:pk>/delete/', DeleteCarImageView.as_view(), name='delete_car_image'),
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('types/', CarTypeListView.as_view(), name='car_types'),
    path('classes/', CarClassListView.as_view(), name='car_classes'),
    path('tags/', TagListView.as_view(), name='tags'),
]
