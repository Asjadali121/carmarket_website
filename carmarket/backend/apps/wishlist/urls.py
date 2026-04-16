from django.urls import path
from .views import WishlistListView, WishlistToggleView

urlpatterns = [
    path('', WishlistListView.as_view(), name='wishlist'),
    path('toggle/', WishlistToggleView.as_view(), name='wishlist_toggle'),
    path('<int:car_id>/remove/', WishlistToggleView.as_view(), name='wishlist_remove'),
]
