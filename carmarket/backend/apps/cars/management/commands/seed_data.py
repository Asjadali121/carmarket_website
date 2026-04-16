"""
Management command to seed the database with realistic data.
Run: python manage.py seed_data
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.cars.models import Category, CarType, CarClass, Tag, Car
from apps.orders.models import Order
from apps.wishlist.models import Wishlist
from django.core.management.base import BaseCommand
from decimal import Decimal

User = get_user_model()

CATEGORIES = [
    {'name': 'Economy', 'slug': 'economy', 'description': 'Affordable everyday cars', 'icon': '💰'},
    {'name': 'Luxury', 'slug': 'luxury', 'description': 'Premium luxury vehicles', 'icon': '👑'},
    {'name': 'Sports', 'slug': 'sports', 'description': 'High-performance sports cars', 'icon': '🏎️'},
    {'name': 'Family', 'slug': 'family', 'description': 'Spacious family cars', 'icon': '👨‍👩‍👧‍👦'},
    {'name': 'Commercial', 'slug': 'commercial', 'description': 'Commercial vehicles', 'icon': '🚚'},
    {'name': 'Electric', 'slug': 'electric', 'description': 'Electric vehicles', 'icon': '⚡'},
    {'name': 'Hybrid', 'slug': 'hybrid', 'description': 'Hybrid vehicles', 'icon': '🌿'},
    {'name': 'Off-Road', 'slug': 'off-road', 'description': 'Off-road capable vehicles', 'icon': '🏔️'},
]

CAR_TYPES = [
    {'name': 'Sedan', 'slug': 'sedan'},
    {'name': 'SUV', 'slug': 'suv'},
    {'name': 'Hatchback', 'slug': 'hatchback'},
    {'name': 'Coupe', 'slug': 'coupe'},
    {'name': 'Convertible', 'slug': 'convertible'},
    {'name': 'Pickup', 'slug': 'pickup'},
    {'name': 'Van', 'slug': 'van'},
    {'name': 'Wagon', 'slug': 'wagon'},
    {'name': 'Crossover', 'slug': 'crossover'},
]

CAR_CLASSES = [
    {'name': 'Micro', 'slug': 'micro'},
    {'name': 'Subcompact', 'slug': 'subcompact'},
    {'name': 'Compact', 'slug': 'compact'},
    {'name': 'Mid-size', 'slug': 'mid-size'},
    {'name': 'Full-size', 'slug': 'full-size'},
    {'name': 'Premium', 'slug': 'premium'},
    {'name': 'Executive', 'slug': 'executive'},
    {'name': 'Supercar', 'slug': 'supercar'},
]

TAGS = [
    {'name': 'Fuel Efficient', 'slug': 'fuel-efficient'},
    {'name': 'Family Car', 'slug': 'family-car'},
    {'name': 'Luxury Ride', 'slug': 'luxury-ride'},
    {'name': 'Off-Road Beast', 'slug': 'off-road-beast'},
    {'name': 'Low Mileage', 'slug': 'low-mileage'},
    {'name': 'First Owner', 'slug': 'first-owner'},
    {'name': 'Bank Financing', 'slug': 'bank-financing'},
    {'name': 'Urgent Sale', 'slug': 'urgent-sale'},
]

CARS_DATA = [
    # Toyota
    {
        'title': 'Toyota Corolla 2022 GLi 1.3 Manual',
        'brand': 'Toyota', 'model': 'Corolla', 'variant': 'GLi 1.3',
        'year': 2022, 'price': 4500000, 'mileage': 18000,
        'fuel_type': 'petrol', 'transmission': 'manual', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1300, 'color': 'White',
        'description': 'Excellent condition Toyota Corolla GLi, single owner, full service history. Well maintained, no major repairs.',
        'location': 'DHA Phase 5, Karachi', 'city': 'Karachi',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Compact',
        'tags': ['Fuel Efficient', 'First Owner'],
    },
    {
        'title': 'Toyota Fortuner 2021 2.7 Sigma 4x4',
        'brand': 'Toyota', 'model': 'Fortuner', 'variant': 'Sigma 4x4',
        'year': 2021, 'price': 14500000, 'mileage': 32000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': '4wd',
        'condition': 'used', 'engine_capacity': 2700, 'color': 'Silver',
        'description': 'Top of the line Fortuner with full options. Sunroof, leather seats, 4x4 mode.',
        'location': 'Gulberg III, Lahore', 'city': 'Lahore',
        'category': 'Off-Road', 'car_type': 'SUV', 'car_class': 'Full-size',
        'tags': ['Off-Road Beast', 'Bank Financing'],
    },
    {
        'title': 'Toyota Yaris ATIV 2023 1.3 CVT',
        'brand': 'Toyota', 'model': 'Yaris', 'variant': 'ATIV 1.3 CVT',
        'year': 2023, 'price': 3800000, 'mileage': 8000,
        'fuel_type': 'petrol', 'transmission': 'cvt', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1300, 'color': 'Red',
        'description': 'Nearly new Yaris ATIV, bought 2023. CVT automatic, push start, touchscreen infotainment.',
        'location': 'F-10, Islamabad', 'city': 'Islamabad',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Subcompact',
        'tags': ['Fuel Efficient', 'Low Mileage', 'First Owner'],
    },
    # Honda
    {
        'title': 'Honda Civic 2022 Turbo 1.5 Oriel',
        'brand': 'Honda', 'model': 'Civic', 'variant': 'Turbo 1.5 Oriel',
        'year': 2022, 'price': 7200000, 'mileage': 22000,
        'fuel_type': 'petrol', 'transmission': 'cvt', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1500, 'color': 'Platinum White',
        'description': 'Honda Civic Oriel 2022. Turbo engine, CVT, Honda Sensing safety suite, sunroof, heated seats.',
        'location': 'Clifton, Karachi', 'city': 'Karachi',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Compact',
        'tags': ['First Owner', 'Bank Financing'],
    },
    {
        'title': 'Honda HR-V 2023 e:HEV Hybrid',
        'brand': 'Honda', 'model': 'HR-V', 'variant': 'e:HEV',
        'year': 2023, 'price': 9800000, 'mileage': 5000,
        'fuel_type': 'hybrid', 'transmission': 'cvt', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1500, 'color': 'Sonic Grey Pearl',
        'description': 'Brand new 2023 Honda HR-V Hybrid. Excellent fuel economy, Honda Sensing, LaneWatch.',
        'location': 'Model Town, Lahore', 'city': 'Lahore',
        'category': 'Hybrid', 'car_type': 'Crossover', 'car_class': 'Compact',
        'tags': ['Fuel Efficient', 'Low Mileage', 'Family Car'],
    },
    {
        'title': 'Honda CD 70 Dream 2022',
        'brand': 'Honda', 'model': 'Civic', 'variant': 'VTi Oriel',
        'year': 2020, 'price': 3500000, 'mileage': 55000,
        'fuel_type': 'petrol', 'transmission': 'manual', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1500, 'color': 'Blue',
        'description': 'Honda Civic VTi Oriel 2020, well maintained, original paint. Regular service done.',
        'location': 'Bahria Town, Rawalpindi', 'city': 'Rawalpindi',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Compact',
        'tags': ['Family Car'],
    },
    # BMW
    {
        'title': 'BMW 3 Series 2021 330i M Sport',
        'brand': 'BMW', 'model': '3 Series', 'variant': '330i M Sport',
        'year': 2021, 'price': 22000000, 'mileage': 28000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'rwd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Alpine White',
        'description': 'BMW 330i M Sport imported. M aerodynamics, adaptive suspension, Harman Kardon audio, panoramic roof.',
        'location': 'DHA Phase 1, Lahore', 'city': 'Lahore',
        'category': 'Luxury', 'car_type': 'Sedan', 'car_class': 'Premium',
        'tags': ['Luxury Ride', 'Bank Financing'],
        'is_featured': True,
    },
    {
        'title': 'BMW X5 2022 xDrive40i M Sport',
        'brand': 'BMW', 'model': 'X5', 'variant': 'xDrive40i M Sport',
        'year': 2022, 'price': 38000000, 'mileage': 15000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 3000, 'color': 'Carbon Black',
        'description': 'BMW X5 M Sport xDrive, all options. 21" M wheels, panoramic roof, Bowers & Wilkins audio.',
        'location': 'Bahria Town, Karachi', 'city': 'Karachi',
        'category': 'Luxury', 'car_type': 'SUV', 'car_class': 'Executive',
        'tags': ['Luxury Ride', 'Low Mileage'],
        'is_featured': True,
    },
    # Audi
    {
        'title': 'Audi A4 2021 2.0 TFSI Premium Plus',
        'brand': 'Audi', 'model': 'A4', 'variant': '2.0 TFSI Premium Plus',
        'year': 2021, 'price': 19500000, 'mileage': 34000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Monsoon Gray',
        'description': 'Audi A4 fully loaded. Virtual cockpit, LED headlights, Bang & Olufsen sound system.',
        'location': 'Gulshan-e-Iqbal, Karachi', 'city': 'Karachi',
        'category': 'Luxury', 'car_type': 'Sedan', 'car_class': 'Premium',
        'tags': ['Luxury Ride'],
        'is_featured': True,
    },
    {
        'title': 'Audi Q7 2022 3.0 TFSI Quattro',
        'brand': 'Audi', 'model': 'Q7', 'variant': '3.0 TFSI Quattro',
        'year': 2022, 'price': 47000000, 'mileage': 12000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 3000, 'color': 'Glacier White',
        'description': 'Top spec Audi Q7 Quattro. 7 seats, air suspension, panoramic sunroof, MMI navigation.',
        'location': 'F-7, Islamabad', 'city': 'Islamabad',
        'category': 'Luxury', 'car_type': 'SUV', 'car_class': 'Executive',
        'tags': ['Luxury Ride', 'Family Car'],
        'is_featured': True,
    },
    # Suzuki
    {
        'title': 'Suzuki Alto AGS 2022 VXR',
        'brand': 'Suzuki', 'model': 'Alto', 'variant': 'VXR AGS',
        'year': 2022, 'price': 1950000, 'mileage': 25000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 660, 'color': 'White',
        'description': 'Suzuki Alto AGS auto gear shift. Excellent fuel economy, perfect for city commute.',
        'location': 'Satellite Town, Rawalpindi', 'city': 'Rawalpindi',
        'category': 'Economy', 'car_type': 'Hatchback', 'car_class': 'Micro',
        'tags': ['Fuel Efficient', 'Family Car'],
    },
    {
        'title': 'Suzuki Swift 2023 GLX CVT',
        'brand': 'Suzuki', 'model': 'Swift', 'variant': 'GLX CVT',
        'year': 2023, 'price': 3200000, 'mileage': 7000,
        'fuel_type': 'petrol', 'transmission': 'cvt', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1200, 'color': 'Pearl Red',
        'description': 'Suzuki Swift 2023 GLX CVT, just like new. Alloy wheels, touchscreen, reverse camera.',
        'location': 'Johar Town, Lahore', 'city': 'Lahore',
        'category': 'Economy', 'car_type': 'Hatchback', 'car_class': 'Subcompact',
        'tags': ['Fuel Efficient', 'Low Mileage'],
    },
    # Mercedes
    {
        'title': 'Mercedes-Benz C200 2022 AMG Line',
        'brand': 'Mercedes-Benz', 'model': 'C200', 'variant': 'AMG Line',
        'year': 2022, 'price': 26000000, 'mileage': 20000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'rwd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Obsidian Black',
        'description': 'Mercedes C200 AMG Line, full options. MBUX system, Burmester audio, ambient lighting.',
        'location': 'DHA Phase 6, Lahore', 'city': 'Lahore',
        'category': 'Luxury', 'car_type': 'Sedan', 'car_class': 'Premium',
        'tags': ['Luxury Ride', 'Bank Financing'],
        'is_featured': True,
    },
    {
        'title': 'Mercedes-Benz GLE 450 2021 4MATIC',
        'brand': 'Mercedes-Benz', 'model': 'GLE 450', 'variant': '4MATIC',
        'year': 2021, 'price': 52000000, 'mileage': 22000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 3000, 'color': 'Selenite Grey',
        'description': 'Mercedes GLE 450 AMG 4MATIC, full spec. Airmatic suspension, panorama roof, E-Active body control.',
        'location': 'Clifton Block 4, Karachi', 'city': 'Karachi',
        'category': 'Luxury', 'car_type': 'SUV', 'car_class': 'Executive',
        'tags': ['Luxury Ride'],
        'is_featured': True,
    },
    # Kia
    {
        'title': 'Kia Sportage 2023 Alpha AWD',
        'brand': 'Kia', 'model': 'Sportage', 'variant': 'Alpha AWD',
        'year': 2023, 'price': 8500000, 'mileage': 6000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Aurora Black Pearl',
        'description': 'New shape Kia Sportage 2023 Alpha. AWD, 360 camera, panoramic sunroof, wireless charging.',
        'location': 'Bahria Town Phase 7, Rawalpindi', 'city': 'Rawalpindi',
        'category': 'Family', 'car_type': 'SUV', 'car_class': 'Mid-size',
        'tags': ['Family Car', 'Low Mileage'],
    },
    {
        'title': 'Kia Picanto 2022 1.0 AT',
        'brand': 'Kia', 'model': 'Picanto', 'variant': '1.0 AT',
        'year': 2022, 'price': 2400000, 'mileage': 30000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 998, 'color': 'Candy White',
        'description': 'Kia Picanto automatic, city car perfect. Fuel efficient, easy parking, good condition.',
        'location': 'G-11, Islamabad', 'city': 'Islamabad',
        'category': 'Economy', 'car_type': 'Hatchback', 'car_class': 'Micro',
        'tags': ['Fuel Efficient', 'Family Car'],
    },
    # Hyundai
    {
        'title': 'Hyundai Tucson 2023 AWD Ultimate',
        'brand': 'Hyundai', 'model': 'Tucson', 'variant': 'AWD Ultimate',
        'year': 2023, 'price': 10200000, 'mileage': 4000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Phantom Black',
        'description': 'Hyundai Tucson 2023 Ultimate AWD. BLUELINK, 10.25" touchscreen, BOSE audio, ventilated seats.',
        'location': 'DHA Phase 2, Islamabad', 'city': 'Islamabad',
        'category': 'Family', 'car_type': 'SUV', 'car_class': 'Mid-size',
        'tags': ['Family Car', 'Low Mileage', 'Bank Financing'],
    },
    # Porsche
    {
        'title': 'Porsche Cayenne 2022 S E-Hybrid',
        'brand': 'Porsche', 'model': 'Cayenne', 'variant': 'S E-Hybrid',
        'year': 2022, 'price': 85000000, 'mileage': 18000,
        'fuel_type': 'hybrid', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 2900, 'color': 'Carrara White Metallic',
        'description': 'Porsche Cayenne S E-Hybrid. Full options, sport chrono package, PDCC, rear-axle steering.',
        'location': 'Emaar Crescent Bay, Karachi', 'city': 'Karachi',
        'category': 'Luxury', 'car_type': 'SUV', 'car_class': 'Executive',
        'tags': ['Luxury Ride', 'Fuel Efficient'],
        'is_featured': True,
    },
    # Land Rover
    {
        'title': 'Land Rover Defender 2022 110 HSE',
        'brand': 'Land Rover', 'model': 'Defender', 'variant': '110 HSE',
        'year': 2022, 'price': 65000000, 'mileage': 16000,
        'fuel_type': 'diesel', 'transmission': 'automatic', 'drive_type': '4wd',
        'condition': 'used', 'engine_capacity': 3000, 'color': 'Gondwana Stone',
        'description': 'Land Rover Defender 110 HSE D300. Pivi Pro, air suspension, wade sensing, configurable terrain response.',
        'location': 'Gulberg, Lahore', 'city': 'Lahore',
        'category': 'Off-Road', 'car_type': 'SUV', 'car_class': 'Full-size',
        'tags': ['Off-Road Beast', 'Luxury Ride'],
        'is_featured': True,
    },
    # Tesla
    {
        'title': 'Tesla Model 3 2022 Long Range AWD',
        'brand': 'Tesla', 'model': 'Model 3', 'variant': 'Long Range AWD',
        'year': 2022, 'price': 18000000, 'mileage': 25000,
        'fuel_type': 'electric', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': None, 'color': 'Pearl White Multi-Coat',
        'description': 'Tesla Model 3 Long Range AWD. 576 km range, Autopilot, premium audio, glass roof.',
        'location': 'F-11, Islamabad', 'city': 'Islamabad',
        'category': 'Electric', 'car_type': 'Sedan', 'car_class': 'Mid-size',
        'tags': ['Fuel Efficient', 'Low Mileage'],
        'is_featured': True,
    },
    # MG
    {
        'title': 'MG HS 2022 Exclusive AWD',
        'brand': 'MG', 'model': 'HS', 'variant': 'Exclusive AWD',
        'year': 2022, 'price': 7800000, 'mileage': 28000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 1500, 'color': 'Dover White',
        'description': 'MG HS Exclusive AWD with panoramic sunroof, 12.3" touchscreen, wireless Apple CarPlay.',
        'location': 'Johar Town, Lahore', 'city': 'Lahore',
        'category': 'Family', 'car_type': 'SUV', 'car_class': 'Mid-size',
        'tags': ['Family Car', 'Bank Financing'],
    },
    {
        'title': 'MG ZS EV 2023 Excite+',
        'brand': 'MG', 'model': 'ZS EV', 'variant': 'Excite+',
        'year': 2023, 'price': 8900000, 'mileage': 3000,
        'fuel_type': 'electric', 'transmission': 'automatic', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': None, 'color': 'Dynamic Red',
        'description': 'MG ZS EV 2023, nearly new. 263 km range, 7" driver display, 10.1" touchscreen, rear camera.',
        'location': 'DHA Phase 4, Karachi', 'city': 'Karachi',
        'category': 'Electric', 'car_type': 'SUV', 'car_class': 'Compact',
        'tags': ['Fuel Efficient', 'Low Mileage', 'Family Car'],
    },
    # Changan
    {
        'title': 'Changan Alsvin 2022 Lumiere CVT',
        'brand': 'Changan', 'model': 'Alsvin', 'variant': 'Lumiere CVT',
        'year': 2022, 'price': 3100000, 'mileage': 35000,
        'fuel_type': 'petrol', 'transmission': 'cvt', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1500, 'color': 'Cream White',
        'description': 'Changan Alsvin Lumiere CVT. 10.25" floating display, push start, 360° camera, heated seats.',
        'location': 'Hayatabad, Peshawar', 'city': 'Peshawar',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Compact',
        'tags': ['Fuel Efficient', 'Family Car'],
    },
    # Proton
    {
        'title': 'Proton X70 2022 Premium 1.8 TGDi AWD',
        'brand': 'Proton', 'model': 'X70', 'variant': 'Premium 1.8 TGDi AWD',
        'year': 2022, 'price': 6500000, 'mileage': 22000,
        'fuel_type': 'petrol', 'transmission': 'automatic', 'drive_type': 'awd',
        'condition': 'used', 'engine_capacity': 1800, 'color': 'Snow White',
        'description': 'Proton X70 Premium AWD. Panoramic sunroof, BOSS audio, hi-fi sound, ventilated seats.',
        'location': 'Blue Area, Islamabad', 'city': 'Islamabad',
        'category': 'Family', 'car_type': 'SUV', 'car_class': 'Mid-size',
        'tags': ['Family Car', 'Bank Financing'],
    },
    {
        'title': 'Proton Saga 2023 Standard MT',
        'brand': 'Proton', 'model': 'Saga', 'variant': 'Standard MT',
        'year': 2023, 'price': 2100000, 'mileage': 9000,
        'fuel_type': 'petrol', 'transmission': 'manual', 'drive_type': 'fwd',
        'condition': 'used', 'engine_capacity': 1332, 'color': 'Armour Silver',
        'description': 'Proton Saga 2023, low mileage. Solid build quality, responsive steering, great value.',
        'location': 'North Nazimabad, Karachi', 'city': 'Karachi',
        'category': 'Economy', 'car_type': 'Sedan', 'car_class': 'Subcompact',
        'tags': ['Fuel Efficient', 'Low Mileage'],
    },
    # Ford
    {
        'title': 'Ford Ranger Raptor 2022 2.0 Bi-Turbo',
        'brand': 'Ford', 'model': 'Ranger Raptor', 'variant': '2.0 Bi-Turbo',
        'year': 2022, 'price': 22000000, 'mileage': 28000,
        'fuel_type': 'diesel', 'transmission': 'automatic', 'drive_type': '4wd',
        'condition': 'used', 'engine_capacity': 2000, 'color': 'Frozen White',
        'description': 'Ford Ranger Raptor, beast off-road truck. Fox racing shocks, Recaro seats, 360 camera.',
        'location': 'Cantt, Lahore', 'city': 'Lahore',
        'category': 'Off-Road', 'car_type': 'Pickup', 'car_class': 'Full-size',
        'tags': ['Off-Road Beast', 'Bank Financing'],
        'is_featured': True,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding database...')

        # Categories
        for data in CATEGORIES:
            Category.objects.get_or_create(slug=data['slug'], defaults=data)
        self.stdout.write('✅ Categories created')

        # Types
        for data in CAR_TYPES:
            CarType.objects.get_or_create(slug=data['slug'], defaults=data)
        self.stdout.write('✅ Car types created')

        # Classes
        for data in CAR_CLASSES:
            CarClass.objects.get_or_create(slug=data['slug'], defaults=data)
        self.stdout.write('✅ Car classes created')

        # Tags
        for data in TAGS:
            Tag.objects.get_or_create(slug=data['slug'], defaults=data)
        self.stdout.write('✅ Tags created')

        # Admin user
        admin, _ = User.objects.get_or_create(
            email='admin@carmarket.pk',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'city': 'Karachi',
                'phone': '03001234567',
            }
        )
        if _:
            admin.set_password('Admin@1234')
            admin.save()
        self.stdout.write('✅ Admin created (admin@carmarket.pk / Admin@1234)')

        # Sellers
        sellers = []
        sellers_data = [
            {'email': 'seller1@carmarket.pk', 'username': 'ali_motors', 'first_name': 'Ali', 'last_name': 'Hassan', 'city': 'Lahore', 'phone': '03111234567'},
            {'email': 'seller2@carmarket.pk', 'username': 'karachi_cars', 'first_name': 'Ahmed', 'last_name': 'Khan', 'city': 'Karachi', 'phone': '03211234567'},
            {'email': 'seller3@carmarket.pk', 'username': 'islamabad_autos', 'first_name': 'Bilal', 'last_name': 'Akhtar', 'city': 'Islamabad', 'phone': '03011234567'},
        ]
        for sd in sellers_data:
            s, created = User.objects.get_or_create(email=sd['email'], defaults={**sd, 'role': 'seller'})
            if created:
                s.set_password('Seller@1234')
                s.save()
            sellers.append(s)
        self.stdout.write('✅ Sellers created (password: Seller@1234)')

        # Buyers
        buyers = []
        buyers_data = [
            {'email': 'buyer1@carmarket.pk', 'username': 'zahid_buyer', 'first_name': 'Zahid', 'last_name': 'Hussain', 'city': 'Lahore'},
            {'email': 'buyer2@carmarket.pk', 'username': 'sara_buyer', 'first_name': 'Sara', 'last_name': 'Malik', 'city': 'Karachi'},
            {'email': 'buyer3@carmarket.pk', 'username': 'usman_buyer', 'first_name': 'Usman', 'last_name': 'Raza', 'city': 'Islamabad'},
        ]
        for bd in buyers_data:
            b, created = User.objects.get_or_create(email=bd['email'], defaults={**bd, 'role': 'buyer'})
            if created:
                b.set_password('Buyer@1234')
                b.save()
            buyers.append(b)
        self.stdout.write('✅ Buyers created (password: Buyer@1234)')

        # Cars
        cars_created = 0
        for car_data in CARS_DATA:
            if Car.objects.filter(title=car_data['title']).exists():
                continue
            category = Category.objects.get(name=car_data.pop('category'))
            car_type = CarType.objects.get(name=car_data.pop('car_type'))
            car_class = CarClass.objects.get(name=car_data.pop('car_class'))
            tag_names = car_data.pop('tags', [])
            is_featured = car_data.pop('is_featured', False)
            seller = random.choice(sellers)

            car = Car.objects.create(
                seller=seller,
                category=category,
                car_type=car_type,
                car_class=car_class,
                status='active',
                is_featured=is_featured,
                **car_data,
            )
            tags = Tag.objects.filter(name__in=tag_names)
            car.tags.set(tags)
            cars_created += 1

        self.stdout.write(f'✅ {cars_created} cars created')

        # Sample orders
        cars = list(Car.objects.filter(status='active')[:6])
        for i, (buyer, car) in enumerate(zip(buyers * 2, cars)):
            if not Order.objects.filter(buyer=buyer, car=car).exists():
                Order.objects.create(
                    buyer=buyer,
                    car=car,
                    status='completed' if i % 2 == 0 else 'pending',
                    payment_type='full' if i % 3 == 0 else 'installment',
                    total_amount=car.price,
                    booking_amount=car.price * 10 / 100,
                    buyer_name=buyer.get_full_name(),
                    buyer_email=buyer.email,
                    buyer_phone='+92300' + str(1000000 + i),
                    notes='Sample order',
                    down_payment=car.price * 20 / 100 if i % 3 != 0 else None,
                    monthly_installment=car.price * 0.04 if i % 3 != 0 else None,
                    interest_rate=12 if i % 3 != 0 else None,
                    duration_months=24 if i % 3 != 0 else None,
                )
        self.stdout.write('✅ Sample orders created')

        # Wishlists
        for buyer in buyers:
            wishlist_cars = random.sample(list(Car.objects.filter(status='active')), min(3, Car.objects.count()))
            for car in wishlist_cars:
                Wishlist.objects.get_or_create(user=buyer, car=car)
        self.stdout.write('✅ Wishlists seeded')

        self.stdout.write(self.style.SUCCESS('\n🎉 Database seeded successfully!\n'))
        self.stdout.write('Login credentials:')
        self.stdout.write('  Admin:  admin@carmarket.pk / Admin@1234')
        self.stdout.write('  Seller: seller1@carmarket.pk / Seller@1234')
        self.stdout.write('  Buyer:  buyer1@carmarket.pk / Buyer@1234')
