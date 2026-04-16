'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { carsAPI } from '../../../lib/api';
import Spinner from '../../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(p) {
  const n = parseFloat(p);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  return `PKR ${(n / 100000).toFixed(0)}L`;
}

const statusConfig = {
  active:   { label: 'Active',   classes: 'bg-green-100 text-green-700' },
  pending:  { label: 'Pending',  classes: 'bg-yellow-100 text-yellow-700' },
  sold:     { label: 'Sold',     classes: 'bg-red-100 text-red-700' },
  inactive: { label: 'Inactive', classes: 'bg-gray-100 text-gray-600' },
};

export default function SellerDashboard() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user && user.role === 'buyer') { router.push('/dashboard'); return; }
    carsAPI.getMyListings()
      .then(r => { setCars(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, user]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await carsAPI.delete(id);
      setCars(c => c.filter(car => car.id !== id));
      toast.success('Listing deleted successfully');
    } catch {
      toast.error('Failed to delete listing');
    }
    setDeleting(null);
  };

  if (loading) return <Spinner center size="lg" />;

  const filtered = filter === 'all' ? cars : cars.filter(c => c.status === filter);
  const stats = {
    total: cars.length,
    active: cars.filter(c => c.status === 'active').length,
    pending: cars.filter(c => c.status === 'pending').length,
    sold: cars.filter(c => c.status === 'sold').length,
    views: cars.reduce((sum, c) => sum + (c.views_count || 0), 0),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm">Manage your car listings</p>
        </div>
        <Link href="/dashboard/seller/add-car" className="btn-primary">
          + Post New Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          ['Total', stats.total, 'bg-blue-50 text-blue-700'],
          ['Active', stats.active, 'bg-green-50 text-green-700'],
          ['Pending', stats.pending, 'bg-yellow-50 text-yellow-700'],
          ['Sold', stats.sold, 'bg-red-50 text-red-700'],
          ['Total Views', stats.views, 'bg-purple-50 text-purple-700'],
        ].map(([label, val, color]) => (
          <div key={label} className={`card p-3 text-center ${color}`}>
            <p className="text-xl font-bold">{val}</p>
            <p className="text-xs font-medium opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all', 'active', 'pending', 'sold', 'inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
            {f === 'all' ? `All (${cars.length})` : `${f} (${cars.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-5xl mb-4">🚗</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
          </h3>
          <p className="text-gray-400 mb-6">Start selling by posting your first car listing</p>
          <Link href="/dashboard/seller/add-car" className="btn-primary">Post Your First Car</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(car => (
            <div key={car.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <Link href={`/cars/${car.id}`} className="flex-shrink-0">
                <img
                  src={car.primary_image || 'https://placehold.co/120x80/e2e8f0/94a3b8?text=No+Image'}
                  alt={car.title}
                  className="w-full sm:w-28 h-20 object-cover rounded-xl"
                  onError={e => { e.target.src = 'https://placehold.co/120x80/e2e8f0/94a3b8?text=No+Image'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <Link href={`/cars/${car.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm line-clamp-1">
                    {car.title}
                  </Link>
                  <span className={`badge text-xs flex-shrink-0 ${statusConfig[car.status]?.classes || 'bg-gray-100 text-gray-600'}`}>
                    {statusConfig[car.status]?.label || car.status}
                  </span>
                  {car.is_featured && <span className="badge bg-yellow-100 text-yellow-700 text-xs">⭐ Featured</span>}
                </div>
                <p className="text-blue-600 font-bold text-base">{formatPrice(car.price)}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  <span>📍 {car.city}</span>
                  <span>📅 {car.year}</span>
                  <span>👁 {car.views_count || 0} views</span>
                  <span>🗓 {new Date(car.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <Link href={`/cars/${car.id}`} className="btn-secondary text-xs py-1.5 px-3">View</Link>
                <Link href={`/dashboard/seller/edit/${car.id}`} className="btn-primary text-xs py-1.5 px-3">Edit</Link>
                <button
                  onClick={() => handleDelete(car.id)}
                  disabled={deleting === car.id}
                  className="btn-danger text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  {deleting === car.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
