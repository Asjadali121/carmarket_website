from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Order
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, CreateOrderSerializer


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        car_id = request.data.get('car_id')
        quantity = request.data.get('quantity', 1)
        if not car_id:
            return Response({'detail': 'car_id required.'}, status=400)
        item, created = CartItem.objects.get_or_create(cart=cart, car_id=car_id)
        if not created:
            item.quantity += int(quantity)
            item.save()
        serializer = CartItemSerializer(item, context={'request': request})
        return Response(serializer.data, status=201 if created else 200)

    def delete(self, request, item_id):
        try:
            cart = Cart.objects.get(user=request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response(status=204)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'detail': 'Item not found.'}, status=404)

    def patch(self, request, item_id):
        try:
            cart = Cart.objects.get(user=request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            quantity = request.data.get('quantity', item.quantity)
            if int(quantity) <= 0:
                item.delete()
                return Response(status=204)
            item.quantity = int(quantity)
            item.save()
            return Response(CartItemSerializer(item, context={'request': request}).data)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'detail': 'Item not found.'}, status=404)


class ClearCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response(status=204)


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).select_related('car')


class OrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(buyer=self.request.user)


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().select_related('buyer', 'car')


class EMICalculatorView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            principal = float(request.data.get('principal', 0))
            down_payment = float(request.data.get('down_payment', 0))
            interest_rate = float(request.data.get('interest_rate', 12))
            months = int(request.data.get('months', 12))

            loan_amount = principal - down_payment
            monthly_rate = interest_rate / 100 / 12

            if monthly_rate == 0:
                emi = loan_amount / months
            else:
                emi = loan_amount * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1)

            total_payable = emi * months + down_payment
            total_interest = total_payable - principal

            return Response({
                'loan_amount': round(loan_amount, 2),
                'monthly_installment': round(emi, 2),
                'total_payable': round(total_payable, 2),
                'total_interest': round(total_interest, 2),
                'down_payment': down_payment,
                'months': months,
                'interest_rate': interest_rate,
            })
        except (ValueError, TypeError, ZeroDivisionError) as e:
            return Response({'detail': str(e)}, status=400)
