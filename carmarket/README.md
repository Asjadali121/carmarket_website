# CarMarket — Full-Stack Car Marketplace

A production-ready PakWheels/OLX-style car marketplace built with **Django REST Framework** + **Next.js 14**.

---

## 🏗 Project Structure

```
carmarket/
├── backend/                  # Django REST API
│   ├── carmarket/            # Project config (settings, urls, wsgi)
│   ├── apps/
│   │   ├── users/            # Auth, JWT, profiles
│   │   ├── cars/             # Cars, categories, types, classes, tags
│   │   ├── orders/           # Cart, orders, EMI calculator
│   │   └── wishlist/         # Wishlist
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                 # Next.js 14
    ├── app/                  # App router pages
    │   ├── page.js           # Homepage
    │   ├── cars/             # Listing + detail pages
    │   ├── auth/             # Login + register
    │   ├── cart/             # Cart page
    │   ├── checkout/         # Checkout + payment
    │   ├── wishlist/         # Wishlist
    │   ├── dashboard/        # Buyer/seller dashboard
    │   └── admin/            # Admin panel
    ├── components/           # Reusable components
    ├── store/                # Redux Toolkit slices
    ├── lib/                  # Axios API client
    └── package.json
```

---

## ⚙️ Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- pip, npm

---

## 🚀 Backend Setup

### 1. Create PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE carmarket_db;
\q
```

### 2. Create & activate virtual environment

```bash
cd carmarket/backend
python -m venv venv

# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Edit `backend/.env` with your database credentials:

```env
SECRET_KEY=your-super-secret-key-minimum-50-chars
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=carmarket_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

### 5. Run migrations

```bash
python manage.py makemigrations users
python manage.py makemigrations cars
python manage.py makemigrations orders
python manage.py makemigrations wishlist
python manage.py migrate
```

### 6. Seed the database

```bash
python manage.py seed_data
```

This creates:
- **Admin**: admin@carmarket.pk / Admin@1234
- **Sellers**: seller1@carmarket.pk / Seller@1234 (also seller2, seller3)
- **Buyers**: buyer1@carmarket.pk / Buyer@1234 (also buyer2, buyer3)
- **25+ car listings** across all brands/categories
- **Sample orders** and **wishlists**

### 7. Create media directory & start server

```bash
mkdir -p media
python manage.py runserver 0.0.0.0:8000
```

Backend runs at: http://localhost:8000
API base URL: http://localhost:8000/api
Django admin: http://localhost:8000/admin

---

## 🖥 Frontend Setup

### 1. Install dependencies

```bash
cd carmarket/frontend
npm install
```

### 2. Configure environment

`frontend/.env.local` is already pre-configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start development server

```bash
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🔑 Demo Login Credentials

| Role   | Email                    | Password    |
|--------|--------------------------|-------------|
| Admin  | admin@carmarket.pk       | Admin@1234  |
| Seller | seller1@carmarket.pk     | Seller@1234 |
| Seller | seller2@carmarket.pk     | Seller@1234 |
| Buyer  | buyer1@carmarket.pk      | Buyer@1234  |
| Buyer  | buyer2@carmarket.pk      | Buyer@1234  |

---

## 📋 API Reference

### Authentication
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/auth/register/       | Register new user    |
| POST   | /api/auth/login/          | Login (get JWT)      |
| POST   | /api/auth/logout/         | Logout (blacklist)   |
| POST   | /api/auth/token/refresh/  | Refresh access token |
| GET    | /api/auth/profile/        | Get my profile       |
| PATCH  | /api/auth/profile/        | Update profile       |
| PUT    | /api/auth/change-password/| Change password      |
| GET    | /api/auth/users/          | List users (admin)   |

### Cars
| Method | Endpoint                      | Description               |
|--------|-------------------------------|---------------------------|
| GET    | /api/cars/                    | List cars (with filters)  |
| POST   | /api/cars/                    | Create listing (seller)   |
| GET    | /api/cars/{id}/               | Car detail                |
| PATCH  | /api/cars/{id}/               | Update car (seller/admin) |
| DELETE | /api/cars/{id}/               | Delete car                |
| GET    | /api/cars/featured/           | Featured cars             |
| GET    | /api/cars/my-listings/        | Seller's own listings     |
| POST   | /api/cars/{id}/images/        | Upload images             |
| DELETE | /api/cars/images/{id}/delete/ | Remove image              |
| GET    | /api/cars/categories/         | List categories           |
| GET    | /api/cars/types/              | List body types           |
| GET    | /api/cars/classes/            | List car classes          |
| GET    | /api/cars/tags/               | List tags                 |
| GET    | /api/cars/admin/all/          | Admin: all listings       |
| GET    | /api/cars/admin/dashboard/    | Admin: dashboard stats    |
| POST   | /api/cars/admin/{id}/approve/ | Admin: approve listing    |

### Filter Parameters (GET /api/cars/)
```
?search=toyota         Full-text search
?brand=Toyota          Filter by brand
?model=Corolla         Filter by model
?min_price=1000000     Minimum price
?max_price=5000000     Maximum price
?min_year=2020         Minimum year
?max_year=2023         Maximum year
?fuel_type=petrol      Fuel type
?transmission=auto     Transmission
?condition=used        Condition
?category=1            Category ID
?car_type=2            Body type ID
?car_class=3           Class ID
?city=Karachi          City filter
?is_featured=true      Featured only
?ordering=price        Sort by field (-price for desc)
?page=2                Page number
```

### Orders & Cart
| Method | Endpoint                  | Description            |
|--------|---------------------------|------------------------|
| GET    | /api/orders/cart/         | Get cart               |
| POST   | /api/orders/cart/items/   | Add item to cart       |
| PATCH  | /api/orders/cart/items/{id}/ | Update quantity     |
| DELETE | /api/orders/cart/items/{id}/ | Remove item         |
| DELETE | /api/orders/cart/clear/   | Clear entire cart      |
| GET    | /api/orders/              | My orders              |
| POST   | /api/orders/              | Create order           |
| GET    | /api/orders/{id}/         | Order detail           |
| POST   | /api/orders/emi/          | EMI calculation        |
| GET    | /api/orders/admin/all/    | Admin: all orders      |

### Wishlist
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/wishlist/            | My wishlist          |
| POST   | /api/wishlist/toggle/     | Toggle car in list   |
| DELETE | /api/wishlist/{id}/remove/| Remove from wishlist |

---

## 🧮 EMI Calculator

**Endpoint:** `POST /api/orders/emi/`

**Request:**
```json
{
  "principal": 4500000,
  "down_payment": 900000,
  "interest_rate": 12,
  "months": 24
}
```

**Response:**
```json
{
  "loan_amount": 3600000,
  "monthly_installment": 169152.50,
  "total_payable": 4959660.00,
  "total_interest": 459660.00,
  "down_payment": 900000,
  "months": 24,
  "interest_rate": 12.0
}
```

**Formula used:**
```
EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
where R = annual_rate / 12 / 100
```

---

## 🚀 Production Deployment

### Backend (Django)

**1. Update `.env` for production:**
```env
DEBUG=False
SECRET_KEY=<50+ char random key>
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
```

**2. Collect static files:**
```bash
python manage.py collectstatic --no-input
```

**3. Run with Gunicorn:**
```bash
gunicorn carmarket.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

**4. Nginx config (save as `/etc/nginx/sites-available/carmarket`):**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /media/ {
        alias /path/to/carmarket/backend/media/;
    }
    location /static/ {
        alias /path/to/carmarket/backend/staticfiles/;
    }
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Frontend (Next.js)

**1. Update `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**2. Build:**
```bash
npm run build
```

**3. Start production server:**
```bash
npm start
```

**Or deploy to Vercel (recommended for Next.js):**
```bash
npx vercel --prod
```

---

## 🎨 Frontend Pages

| URL                              | Description                    | Access        |
|----------------------------------|--------------------------------|---------------|
| `/`                              | Homepage with featured cars    | Public        |
| `/cars`                          | Car listings with filters      | Public        |
| `/cars/[id]`                     | Car detail + EMI calculator    | Public        |
| `/auth/login`                    | Login page                     | Public        |
| `/auth/register`                 | Registration page              | Public        |
| `/cart`                          | Shopping cart                  | Authenticated |
| `/checkout`                      | Checkout (full/installment)    | Authenticated |
| `/wishlist`                      | Saved cars                     | Authenticated |
| `/dashboard`                     | Buyer dashboard + orders       | Authenticated |
| `/dashboard/profile`             | Edit profile                   | Authenticated |
| `/dashboard/orders/[id]`         | Order detail                   | Authenticated |
| `/dashboard/seller`              | Seller listings manager        | Seller/Admin  |
| `/dashboard/seller/add-car`      | Post new car listing           | Seller/Admin  |
| `/dashboard/seller/edit/[id]`    | Edit existing listing          | Seller/Admin  |
| `/admin`                         | Admin panel (dashboard/users)  | Admin only    |

---

## 🔐 User Roles

| Role    | Permissions                                               |
|---------|-----------------------------------------------------------|
| buyer   | Browse, wishlist, cart, checkout, view orders             |
| seller  | All buyer permissions + post/edit/delete own listings     |
| admin   | All permissions + approve listings, manage users, stats   |

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 14, React 18, Tailwind CSS     |
| State       | Redux Toolkit                           |
| HTTP Client | Axios with JWT interceptors             |
| Backend     | Django 4.2, Django REST Framework 3.14  |
| Auth        | JWT (djangorestframework-simplejwt)     |
| Database    | PostgreSQL 14                           |
| Filters     | django-filter                           |
| CORS        | django-cors-headers                     |
| Images      | Pillow, Django MEDIA_ROOT               |

---

## ✅ Feature Checklist

- [x] JWT authentication (register, login, logout, refresh)
- [x] Role-based access (buyer, seller, admin)
- [x] Protected routes (frontend + backend)
- [x] Car CRUD with multi-image upload
- [x] Car classification (category, type, class)
- [x] Tag system (many-to-many)
- [x] Advanced filtering (10+ filter params, combined)
- [x] Full-text search
- [x] Pagination
- [x] Add to cart / remove / clear
- [x] Checkout (full payment, installment, booking deposit)
- [x] EMI calculator with formula
- [x] Order history with detail view
- [x] Wishlist (toggle add/remove)
- [x] Seller dashboard (list, add, edit, delete)
- [x] Admin panel (dashboard stats, approve cars, manage users, orders)
- [x] Seed data (25+ cars, multiple users, orders, wishlists)
- [x] Responsive design (mobile + desktop)
- [x] Image management (upload, delete, primary)
- [x] Views counter per listing
- [x] Featured listings
