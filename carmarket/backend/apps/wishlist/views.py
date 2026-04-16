from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Wishlist
from .serializers import WishlistSerializer


class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('car')


class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        car_id = request.data.get('car_id')
        if not car_id:
            return Response({'detail': 'car_id required.'}, status=400)
        obj, created = Wishlist.objects.get_or_create(user=request.user, car_id=car_id)
        if not created:
            obj.delete()
            return Response({'status': 'removed'})
        return Response({'status': 'added'}, status=201)

    def delete(self, request, car_id):
        Wishlist.objects.filter(user=request.user, car_id=car_id).delete()
        return Response(status=204)
