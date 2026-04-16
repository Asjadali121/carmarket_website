'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { carsAPI } from '../../lib/api';
import CarCard from '../../components/CarCard';
import FilterPanel from '../../components/FilterPanel';
import Spinner from '../../components/Spinner';

export default function CarsPage() {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const PAGE_SIZE = 12;

  // Init from URL params
  useEffect(() => {
    const init = {};
    for (const [k, v] of searchParams.entries()) { if (v) init[k] = v; }
    if (init.search) { setSearch(init.search); delete init.search; }
    if (init.ordering) { setOrdering(init.ordering); delete init.ordering; }
    setFilters(init);
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, ordering, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      Object.keys(params).forEach(k => (params[k] === '' || params[k] === null || params[k] === undefined) && delete params[k]);
      const res = await carsAPI.getAll(params);
      setCars(res.data.results || res.data);
      setCount(res.data.count || (res.data.results ? res.data.count : res.data.length) || 0);
    } catch { setCars([]); }
    setLoading(false);
  }, [filters, page, search, ordering]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search cars by brand, model, city..."
            className="input-field pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>
        <select
          className="input-field max-w-xs"
          value={ordering}
          onChange={e => { setOrdering(e.target.value); setPage(1); }}
        >
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-year">Year: Newest</option>
          <option value="year">Year: Oldest</option>
          <option value="mileage">Lowest Mileage</option>
          <option value="-views_count">Most Viewed</option>
        </select>
        <button
          className="sm:hidden btn-secondary"
          onClick={() => setShowMobileFilter(true)}
        >
          ⚙️ Filters {Object.values(filters).filter(v => v).length > 0 && `(${Object.values(filters).filter(v => v).length})`}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterPanel filters={filters} onChange={handleFilterChange} />
        </aside>

        {/* Mobile Filter Drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
              <FilterPanel filters={filters} onChange={(f) => { handleFilterChange(f); setShowMobileFilter(false); }} onClose={() => setShowMobileFilter(false)} />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${count.toLocaleString()} car${count !== 1 ? 's' : ''} found`}
            </p>
            <div className="lg:hidden">
              <button onClick={() => setShowMobileFilter(true)} className="text-sm text-blue-600 font-medium">
                ⚙️ Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20 card">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No cars found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
              <button onClick={() => { handleFilterChange({}); setSearch(''); }} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                  <button disabled={page === 1} onClick={() => setPage(1)}
                    className="btn-secondary text-xs py-2 px-3 disabled:opacity-40">«</button>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p = page <= 3 ? i + 1 : page - 2 + i;
                      if (p > totalPages) return null;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}
                    className="btn-secondary text-xs py-2 px-3 disabled:opacity-40">»</button>
                </div>
              )}
              <p className="text-center text-xs text-gray-400 mt-2">Page {page} of {totalPages}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
