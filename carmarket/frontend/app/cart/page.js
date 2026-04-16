'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(price) {
  const n = parseFloat(price);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(2)}M`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(0)}L`;
  return `PKR ${n.toLocaleString()}`;
}

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, total, loading } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Login to view your saved cars</p>
      <Link href="/auth/login" className="btn-primary">Login to Continue</Link>
    </div>
  );

  if (loading && items.length === 0) return <Spinner center size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛒 My Cart</h1>
          <p className="text-gray-500 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            🗑 Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-6xl mb-4">🛒</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-400 mb-6">Add cars you're interested in to compare and checkout</p>
          <Link href="/cars" className="btn-primary">Browse Cars</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link href={`/cars/${item.car?.id}`} className="flex-shrink-0">
                  <img
                    src={item.car?.primary_image || 'https://placehold.co/120x80/e2e8f0/94a3b8?text=No+Image'}
                    alt={item.car?.title}
                    className="w-28 h-20 object-cover rounded-xl"
                    onError={e => { e.target.src = 'https://placehold.co/120x80/e2e8f0/94a3b8?text=No+Image'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/cars/${item.car?.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors line-clamp-2">
                      {item.car?.title}
                    </h3>
                  </Link>
                  <p className="text-blue-600 font-bold mt-1">{formatPrice(item.car?.price)}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-400">{item.car?.year}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{item.car?.city}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400 capitalize">{item.car?.fuel_type}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => { dispatch(removeFromCart(item.id)); toast.success('Removed from cart'); }}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                  >✕</button>
                  <Link href={`/checkout?car=${item.car?.id}`}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors">
                    Buy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate mr-2 flex-1">{item.car?.title?.split(' ').slice(0, 3).join(' ')}</span>
                    <span className="font-medium text-gray-700 flex-shrink-0">{formatPrice(item.car?.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-blue-600 text-lg">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Note: Cars are typically purchased individually
              </p>
              <button onClick={() => router.push('/checkout')} className="w-full btn-primary mt-4 py-3 text-base">
                Proceed to Checkout →
              </button>
              <Link href="/cars" className="w-full btn-secondary mt-2 py-2.5 text-sm text-center block">
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
