from rest_framework import serializers
from .models import Car, CarImage, Category, CarType, CarClass, Tag
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']


class CarTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarType
        fields = ['id', 'name', 'slug', 'description']


class CarClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarClass
        fields = ['id', 'name', 'slug', 'description']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'order']


class CarListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    car_type_name = serializers.CharField(source='car_type.name', read_only=True)
    seller_name = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Car
        fields = ['id', 'title', 'brand', 'model', 'variant', 'year', 'price',
                  'mileage', 'fuel_type', 'transmission', 'condition', 'location',
                  'city', 'status', 'is_featured', 'views_count', 'primary_image',
                  'category_name', 'car_type_name', 'seller_name', 'tags', 'created_at']

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None

    def get_seller_name(self, obj):
        return obj.seller.get_full_name() or obj.seller.username


class CarDetailSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    car_type = CarTypeSerializer(read_only=True)
    car_class = CarClassSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)

    class Meta:
        model = Car
        fields = '__all__'


class CarCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Car
        exclude = ['seller', 'views_count', 'status', 'tags']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        tag_ids = validated_data.pop('tag_ids', [])
        car = Car.objects.create(
            seller=self.context['request'].user,
            status='active',
            **validated_data
        )
        if tag_ids:
            car.tags.set(tag_ids)
        for i, img in enumerate(images_data):
            CarImage.objects.create(car=car, image=img, is_primary=(i == 0), order=i)
        return car

    def update(self, instance, validated_data):
        validated_data.pop('images', [])
        tag_ids = validated_data.pop('tag_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        instance.save()
        return instance
