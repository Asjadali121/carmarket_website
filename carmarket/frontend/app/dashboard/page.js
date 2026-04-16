'use client';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ordersAPI, carsAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/Spinner';

function formatPrice(p) {
  const n = parseFloat(p);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  return `PKR ${(n / 100000).toFixed(0)}L`;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const { items: wishlistItems } = useSelector(s => s.wishlist);
  const [orders, setOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const fetches = [ordersAPI.getOrders().then(r => setOrders(r.data.results || r.data)).catch(() => {})];
    if (user?.role === 'seller') {
      fetches.push(carsAPI.getMyListings().then(r => setMyListings(r.data.results || r.data)).catch(() => {}));
    }
    Promise.all(fetches).finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (!isAuthenticated || loading) return <Spinner center size="lg" />;

  const quickLinks = [
    { href: '/cars', icon: '🔍', label: 'Browse Cars', desc: 'Find your next car' },
    { href: '/wishlist', icon: '❤️', label: 'Wishlist', desc: `${wishlistItems.length} saved` },
    { href: '/cart', icon: '🛒', label: 'Cart', desc: `${cartItems.length} items` },
    { href: '/dashboard/profile', icon: '👤', label: 'My Profile', desc: 'Update details' },
    ...(user?.role === 'seller' ? [
      { href: '/dashboard/seller', icon: '🚗', label: 'My Listings', desc: `${myListings.length} cars` },
      { href: '/dashboard/seller/add-car', icon: '➕', label: 'Post New Car', desc: 'List for sale' },
    ] : []),
    ...(user?.role === 'admin' || user?.is_staff ? [
      { href: '/admin', icon: '⚙️', label: 'Admin Panel', desc: 'Manage platform' },
    ] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.first_name}! 👋</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {user?.email} · <span className="capitalize bg-white/20 px-2 py-0.5 rounded-full text-xs">{user?.role}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Orders', val: orders.length, icon: '📦', color: 'bg-blue-50 text-blue-700' },
          { label: 'Wishlist', val: wishlistItems.length, icon: '❤️', color: 'bg-red-50 text-red-700' },
          { label: 'Cart Items', val: cartItems.length, icon: '🛒', color: 'bg-green-50 text-green-700' },
          ...(user?.role === 'seller' ? [{ label: 'My Listings', val: myListings.length, icon: '🚗', color: 'bg-purple-50 text-purple-700' }] : [
            { label: 'Completed', val: orders.filter(o => o.status === 'completed').length, icon: '✅', color: 'bg-emerald-50 text-emerald-700' }
          ]),
        ].map(({ label, val, icon, color }) => (
          <div key={label} className={`card p-4 text-center ${color}`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-2xl font-bold">{val}</p>
            <p className="text-xs font-medium opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href}
              className="card p-4 hover:shadow-md hover:border-blue-200 transition-all group text-center">
              <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{icon}</span>
              <p className="font-semibold text-gray-800 text-sm mt-2">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* My Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 mb-4">No orders yet. Browse cars and make your first purchase!</p>
            <Link href="/cars" className="btn-primary text-sm">Browse Cars</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">📦</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.payment_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-sm">{formatPrice(order.total_amount)}</p>
                  <span className={`badge text-xs mt-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
