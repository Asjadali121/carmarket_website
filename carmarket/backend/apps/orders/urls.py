from django.urls import path
from .views import (CartView, CartItemView, ClearCartView,
                    OrderListCreateView, OrderDetailView,
                    AdminOrderListView, EMICalculatorView)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart_add'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart_item'),
    path('cart/clear/', ClearCartView.as_view(), name='cart_clear'),
    path('', OrderListCreateView.as_view(), name='orders'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('admin/all/', AdminOrderListView.as_view(), name='admin_orders'),
    path('emi/', EMICalculatorView.as_view(), name='emi_calculator'),
]
