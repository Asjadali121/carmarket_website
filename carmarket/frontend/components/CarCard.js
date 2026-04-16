'use client';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://placehold.co/400x250/e2e8f0/94a3b8?text=No+Image';

function formatPrice(price) {
  const n = parseFloat(price);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(0)}L`;
  return `PKR ${n.toLocaleString()}`;
}

export default function CarCard({ car }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { items: wishlistItems } = useSelector(s => s.wishlist);
  const isWishlisted = wishlistItems.some(w => w.car?.id === car.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to save cars'); return; }
    dispatch(toggleWishlist(car.id));
    toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Saved to wishlist');
  };

  const handleCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    dispatch(addToCart(car.id));
    toast.success('Added to cart!');
  };

  return (
    <div className="card hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col">
      <Link href={`/cars/${car.id}`} className="block relative overflow-hidden">
        <img
          src={car.primary_image || PLACEHOLDER}
          alt={car.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {car.is_featured && (
            <span className="badge bg-yellow-400 text-yellow-900 shadow-sm">⭐ Featured</span>
          )}
          {car.condition === 'new' && (
            <span className="badge bg-green-500 text-white">New</span>
          )}
          {car.status === 'sold' && (
            <span className="badge bg-red-500 text-white">Sold</span>
          )}
        </div>
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all hover:scale-110"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className={`text-base ${isWishlisted ? 'text-red-500' : 'text-gray-300'}`}>
            {isWishlisted ? '❤️' : '🤍'}
          </span>
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/cars/${car.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-blue-600 transition-colors mb-1">
            {car.title}
          </h3>
        </Link>

        <p className="text-blue-600 font-bold text-lg mb-2">{formatPrice(car.price)}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {[car.year, `${car.mileage?.toLocaleString()} km`, car.fuel_type, car.transmission].map((val, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md capitalize">
              {val}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>📍</span>{car.city}
          </p>
          <p className="text-xs text-gray-400">
            👁 {car.views_count || 0}
          </p>
        </div>

        <div className="flex gap-2 mt-3">
          <Link href={`/cars/${car.id}`} className="flex-1 text-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors">
            View Details
          </Link>
          <button
            onClick={handleCart}
            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
