'use client';
import { useEffect, useState } from 'react';
import { carsAPI, adminAPI, ordersAPI } from '../../lib/api';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(p) {
  const n = parseFloat(p);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  return `PKR ${(n / 100000).toFixed(0)}L`;
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user && user.role !== 'admin' && !user.is_staff) { router.push('/dashboard'); return; }
    Promise.all([
      carsAPI.getDashboard(),
      carsAPI.adminGetAll({ page_size: 50 }),
      adminAPI.getUsers(),
      ordersAPI.adminGetOrders(),
    ]).then(([d, c, u, o]) => {
      setDashboard(d.data);
      setCars(c.data.results || c.data);
      setUsers(u.data.results || u.data);
      setOrders(o.data.results || o.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, user]);

  const approveCar = async (id) => {
    try {
      await carsAPI.approveCar(id);
      setCars(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
      setDashboard(d => d ? { ...d, pending_cars: d.pending_cars - 1, active_cars: d.active_cars + 1 } : d);
      toast.success('✅ Car approved');
    } catch { toast.error('Failed to approve'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  if (loading) return <Spinner center size="lg" />;

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'cars', label: `🚗 Cars (${cars.length})` },
    { key: 'pending', label: `⏳ Pending (${cars.filter(c => c.status === 'pending').length})`, alert: cars.filter(c => c.status === 'pending').length > 0 },
    { key: 'users', label: `👥 Users (${users.length})` },
    { key: 'orders', label: `📦 Orders (${orders.length})` },
  ];

  const filteredCars = cars.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.seller_name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">⚙️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Platform Management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-px">
        {TABS.map(({ key, label, alert }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
            {alert && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && dashboard && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              ['👥', 'Users', dashboard.total_users, 'bg-blue-50 text-blue-700'],
              ['🚗', 'Total Cars', dashboard.total_cars, 'bg-purple-50 text-purple-700'],
              ['✅', 'Active', dashboard.active_cars, 'bg-green-50 text-green-700'],
              ['⏳', 'Pending', dashboard.pending_cars, 'bg-yellow-50 text-yellow-700'],
              ['📦', 'Orders', dashboard.total_orders, 'bg-indigo-50 text-indigo-700'],
              ['💰', 'Revenue', formatPrice(dashboard.total_revenue), 'bg-emerald-50 text-emerald-700'],
            ].map(([icon, label, val, color]) => (
              <div key={label} className={`card p-4 text-center ${color}`}>
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-xl font-bold">{val}</p>
                <p className="text-xs font-medium opacity-70">{label}</p>
              </div>
            ))}
          </div>

          {dashboard.pending_cars > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800">{dashboard.pending_cars} car{dashboard.pending_cars !== 1 ? 's' : ''} pending approval</p>
                  <p className="text-sm text-yellow-600">Review and approve new listings</p>
                </div>
              </div>
              <button onClick={() => setTab('pending')} className="btn-primary text-sm py-2 bg-yellow-500 hover:bg-yellow-600">
                Review Now →
              </button>
            </div>
          )}

          <h2 className="font-bold text-gray-800 mb-3">Recent Listings</h2>
          <div className="space-y-2">
            {dashboard.recent_cars?.map(car => (
              <div key={car.id} className="card p-3 flex items-center gap-3">
                <img src={car.primary_image || 'https://placehold.co/80x55/e2e8f0/94a3b8?text=Car'} alt=""
                  className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/80x55/e2e8f0/94a3b8?text=Car'; }} />
                <div className="flex-1 min-w-0">
                  <Link href={`/cars/${car.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-1">{car.title}</Link>
                  <p className="text-xs text-gray-400">{car.city} · {formatPrice(car.price)}</p>
                </div>
                <span className={`badge text-xs ${statusColors[car.status] || 'bg-gray-100 text-gray-600'}`}>{car.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cars Tab */}
      {tab === 'cars' && (
        <div>
          <div className="flex gap-3 mb-4">
            <input type="text" placeholder="Search by title, seller, city..." className="input-field max-w-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-sm text-gray-500 flex items-center">{filteredCars.length} results</span>
          </div>
          <div className="space-y-3">
            {filteredCars.map(car => (
              <div key={car.id} className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <img src={car.primary_image || 'https://placehold.co/100x65/e2e8f0/94a3b8?text=Car'} alt=""
                  className="w-24 h-16 object-cover rounded-xl flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/100x65/e2e8f0/94a3b8?text=Car'; }} />
                <div className="flex-1 min-w-0">
                  <Link href={`/cars/${car.id}`} className="font-semibold text-gray-800 hover:text-blue-600 text-sm">{car.title}</Link>
                  <p className="text-xs text-gray-400 mt-0.5">{car.city} · {formatPrice(car.price)} · Seller: {car.seller_name} · {car.views_count} views</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge text-xs ${statusColors[car.status] || 'bg-gray-100'}`}>{car.status}</span>
                  {car.status === 'pending' && (
                    <button onClick={() => approveCar(car.id)} className="btn-success text-xs py-1 px-3">Approve</button>
                  )}
                  <Link href={`/cars/${car.id}`} className="btn-secondary text-xs py-1 px-3">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tab */}
      {tab === 'pending' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">{cars.filter(c => c.status === 'pending').length} cars awaiting approval</p>
          {cars.filter(c => c.status === 'pending').length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500">All caught up! No pending listings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cars.filter(c => c.status === 'pending').map(car => (
                <div key={car.id} className="card p-4 border-l-4 border-yellow-400">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img src={car.primary_image || 'https://placehold.co/120x80/e2e8f0/94a3b8?text=Car'} alt=""
                      className="w-full sm:w-32 h-20 object-cover rounded-xl flex-shrink-0"
                      onError={e => { e.target.src = 'https://placehold.co/120x80/e2e8f0/94a3b8?text=Car'; }} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{car.title}</h3>
                      <p className="text-blue-600 font-bold">{formatPrice(car.price)}</p>
                      <p className="text-xs text-gray-400 mt-1">Seller: {car.seller_name} · {car.city}</p>
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Link href={`/cars/${car.id}`} className="btn-secondary text-xs py-2 px-4 text-center">Preview</Link>
                      <button onClick={() => approveCar(car.id)} className="btn-success text-xs py-2 px-4">✓ Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {u.first_name?.[0]}{u.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-gray-400">{u.email} · {u.city || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                  {u.role !== 'admin' && (
                    <button onClick={() => deleteUser(u.id)} className="btn-danger text-xs py-1 px-2">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{o.order_number}</p>
                <p className="text-xs text-gray-400">{o.buyer_name} · {o.buyer_email}</p>
                <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()} · {o.payment_type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-blue-600">{formatPrice(o.total_amount)}</p>
                <span className={`badge text-xs ${o.status === 'completed' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
