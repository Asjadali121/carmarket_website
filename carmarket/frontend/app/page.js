'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { carsAPI, classAPI } from '../lib/api';
import CarCard from '../components/CarCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentCars, setRecentCars] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      carsAPI.getFeatured(),
      classAPI.getCategories(),
      carsAPI.getAll({ ordering: '-created_at', page_size: 8 }),
    ]).then(([featRes, catRes, recentRes]) => {
      setFeatured(featRes.data.results || featRes.data);
      setCategories(catRes.data.results || catRes.data);
      setRecentCars(recentRes.data.results || recentRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/cars?search=${encodeURIComponent(search)}`);
    else router.push('/cars');
  };

  const stats = [
    { num: '25,000+', label: 'Cars Listed', icon: '🚗' },
    { num: '10,000+', label: 'Happy Buyers', icon: '😊' },
    { num: '5,000+', label: 'Verified Sellers', icon: '✅' },
    { num: '50+', label: 'Cities Covered', icon: '📍' },
  ];

  const popularBrands = [
    { name: 'Toyota', emoji: '🏆' },
    { name: 'Honda', emoji: '🔵' },
    { name: 'Suzuki', emoji: '🟢' },
    { name: 'Kia', emoji: '🔴' },
    { name: 'BMW', emoji: '⚪' },
    { name: 'Mercedes', emoji: '⭐' },
    { name: 'Hyundai', emoji: '🔷' },
    { name: 'Audi', emoji: '⚙️' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="badge bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 mb-4 text-sm px-4 py-1">
            🏆 Pakistan's #1 Car Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your <span className="text-yellow-400">Dream Car</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Browse thousands of cars with easy installment plans, verified sellers, and the best prices across Pakistan.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by brand, model, city... e.g. Toyota Karachi"
              className="flex-1 px-5 py-4 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl transition-colors shadow-lg whitespace-nowrap">
              🔍 Search Cars
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Toyota Corolla','Honda Civic','Suzuki Alto','BMW 3 Series','Karachi','Lahore'].map(q => (
              <button key={q} onClick={() => router.push(`/cars?search=${q}`)}
                className="text-xs bg-white/10 hover:bg-white/20 text-blue-100 px-3 py-1 rounded-full transition-colors border border-white/20">
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ num, label, icon }) => (
            <div key={label} className="text-center py-2">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-2xl font-bold text-blue-700">{num}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 text-sm">Find the perfect car for your lifestyle</p>
          </div>
          <Link href="/cars" className="text-blue-600 hover:text-blue-700 text-sm font-medium hidden sm:block">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link key={cat.id} href={`/cars?category=${cat.id}`}
                className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group">
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{cat.icon || '🚗'}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Brands */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">Popular Brands</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {popularBrands.map(({ name, emoji }) => (
              <Link key={name} href={`/cars?brand=${name}`}
                className="flex items-center gap-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-400 px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 transition-all shadow-sm">
                <span>{emoji}</span>{name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">⭐ Featured Cars</h2>
            <p className="text-gray-500 text-sm">Hand-picked premium listings</p>
          </div>
          <Link href="/cars?is_featured=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No featured cars yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 8).map(car => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </section>

      {/* Recent Listings */}
      {!loading && recentCars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🆕 Recently Added</h2>
              <p className="text-gray-500 text-sm">Fresh listings just posted</p>
            </div>
            <Link href="/cars?ordering=-created_at" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentCars.slice(0, 4).map(car => <CarCard key={car.id} car={car} />)}
          </div>
        </section>
      )}

      {/* Why CarMarket */}
      <section className="bg-blue-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Choose CarMarket?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔒', title: 'Verified Sellers', desc: 'Every seller is verified for your safety' },
              { icon: '💳', title: 'Easy Installments', desc: 'Flexible EMI plans on any car' },
              { icon: '🔍', title: 'Smart Search', desc: 'Find exactly what you need with 10+ filters' },
              { icon: '📞', title: '24/7 Support', desc: 'We are here to help you anytime' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-blue-100">
                <span className="text-4xl">{icon}</span>
                <h3 className="font-bold text-gray-800 mt-3 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sell */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to sell your car?</h2>
        <p className="text-blue-200 mb-8 text-lg">Post your ad for free and reach 50,000+ active buyers.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-lg">
            Post Free Ad →
          </Link>
          <Link href="/cars" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base border border-white/30">
            Browse Cars
          </Link>
        </div>
      </section>
    </div>
  );
}
