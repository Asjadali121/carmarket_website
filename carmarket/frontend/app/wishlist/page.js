'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import Link from 'next/link';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(p) {
  const n = parseFloat(p);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  return `PKR ${(n / 100000).toFixed(0)}L`;
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.wishlist);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => { if (isAuthenticated) dispatch(fetchWishlist()); }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">❤️</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Save your favourites</h2>
      <p className="text-gray-500 mb-6">Login to see and manage your saved cars</p>
      <Link href="/auth/login" className="btn-primary">Login to Continue</Link>
    </div>
  );

  if (loading && items.length === 0) return <Spinner center size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">❤️ My Wishlist</h1>
          <p className="text-gray-500 text-sm">{items.length} saved car{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <Link href="/cars" className="btn-secondary text-sm">+ Add More Cars</Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-6xl mb-4">🤍</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved cars yet</h3>
          <p className="text-gray-400 mb-6">Tap the heart icon on any car to save it here</p>
          <Link href="/cars" className="btn-primary">Browse Cars</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => item.car && (
            <div key={item.id} className="card overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative overflow-hidden">
                <Link href={`/cars/${item.car.id}`}>
                  <img
                    src={item.car.primary_image || 'https://placehold.co/400x250/e2e8f0/94a3b8?text=No+Image'}
                    alt={item.car.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://placehold.co/400x250/e2e8f0/94a3b8?text=No+Image'; }}
                  />
                </Link>
                <button
                  onClick={() => { dispatch(toggleWishlist(item.car.id)); toast.success('Removed from wishlist'); }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow transition-all text-red-500"
                >❤️</button>
              </div>
              <div className="p-4">
                <Link href={`/cars/${item.car.id}`}>
                  <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                    {item.car.title}
                  </h3>
                </Link>
                <p className="text-blue-600 font-bold text-lg">{formatPrice(item.car.price)}</p>
                <div className="flex gap-2 mt-1 mb-3">
                  <span className="text-xs text-gray-400">{item.car.year}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{item.car.mileage?.toLocaleString()} km</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{item.car.city}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cars/${item.car.id}`} className="flex-1 text-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors">
                    View
                  </Link>
                  <button
                    onClick={() => { dispatch(addToCart(item.car.id)); toast.success('Added to cart!'); }}
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    🛒 Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
