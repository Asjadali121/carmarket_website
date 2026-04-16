'use client';
import { useState, useEffect } from 'react';
import { classAPI } from '../lib/api';

export default function FilterPanel({ filters, onChange, onClose }) {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    classAPI.getCategories().then(r => setCategories(r.data.results || r.data)).catch(() => {});
    classAPI.getTypes().then(r => setTypes(r.data.results || r.data)).catch(() => {});
    classAPI.getClasses().then(r => setClasses(r.data.results || r.data)).catch(() => {});
  }, []);

  const set = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({});

  const activeCount = Object.values(filters).filter(v => v !== '' && v !== undefined && v !== null).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Filters</h3>
          {activeCount > 0 && (
            <span className="badge bg-blue-100 text-blue-700">{activeCount} active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 font-medium">Reset all</button>
          )}
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">✕</button>}
        </div>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range (PKR)</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="input-field text-xs" value={filters.min_price || ''}
              onChange={e => set('min_price', e.target.value)} />
            <input type="number" placeholder="Max" className="input-field text-xs" value={filters.max_price || ''}
              onChange={e => set('max_price', e.target.value)} />
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {[['Under 20L','','2000000'],['20L-50L','2000000','5000000'],['50L-1Cr','5000000','10000000'],['1Cr+','10000000','']].map(([label, min, max]) => (
              <button key={label} onClick={() => onChange({...filters, min_price: min, max_price: max})}
                className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 px-2 py-1 rounded-md transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand & Model */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Brand</label>
          <input type="text" placeholder="e.g. Toyota, Honda, BMW" className="input-field text-xs"
            value={filters.brand || ''} onChange={e => set('brand', e.target.value)} />
          <div className="flex gap-1 mt-2 flex-wrap">
            {['Toyota','Honda','Suzuki','Kia','BMW','Mercedes'].map(b => (
              <button key={b} onClick={() => set('brand', b)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${filters.brand === b ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Model</label>
          <input type="text" placeholder="e.g. Corolla, Civic" className="input-field text-xs"
            value={filters.model || ''} onChange={e => set('model', e.target.value)} />
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Year</label>
          <div className="flex gap-2">
            <input type="number" placeholder="From" min="1990" max="2025" className="input-field text-xs"
              value={filters.min_year || ''} onChange={e => set('min_year', e.target.value)} />
            <input type="number" placeholder="To" min="1990" max="2025" className="input-field text-xs"
              value={filters.max_year || ''} onChange={e => set('max_year', e.target.value)} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <select className="input-field text-xs" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Body Type</label>
          <select className="input-field text-xs" value={filters.car_type || ''} onChange={e => set('car_type', e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Segment</label>
          <select className="input-field text-xs" value={filters.car_class || ''} onChange={e => set('car_class', e.target.value)}>
            <option value="">All Segments</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fuel Type</label>
          <div className="grid grid-cols-2 gap-1">
            {[['','All'],['petrol','Petrol'],['diesel','Diesel'],['electric','Electric'],['hybrid','Hybrid'],['cng','CNG']].map(([val, label]) => (
              <button key={val} onClick={() => set('fuel_type', val)}
                className={`text-xs py-1.5 px-2 rounded-lg border transition-colors ${filters.fuel_type === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transmission</label>
          <div className="grid grid-cols-2 gap-1">
            {[['','All'],['automatic','Automatic'],['manual','Manual'],['cvt','CVT']].map(([val, label]) => (
              <button key={val} onClick={() => set('transmission', val)}
                className={`text-xs py-1.5 px-2 rounded-lg border transition-colors ${filters.transmission === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Condition</label>
          <div className="flex gap-1">
            {[['','All'],['new','New'],['used','Used']].map(([val, label]) => (
              <button key={val} onClick={() => set('condition', val)}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${filters.condition === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City</label>
          <input type="text" placeholder="e.g. Karachi, Lahore" className="input-field text-xs"
            value={filters.city || ''} onChange={e => set('city', e.target.value)} />
          <div className="flex gap-1 mt-2 flex-wrap">
            {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar'].map(c => (
              <button key={c} onClick={() => set('city', c)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${filters.city === c ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
