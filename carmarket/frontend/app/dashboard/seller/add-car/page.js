'use client';
import { useState, useEffect } from 'react';
import { carsAPI, classAPI } from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AddCarPage() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);

  const [form, setForm] = useState({
    title: '', brand: '', model: '', variant: '', year: new Date().getFullYear(),
    price: '', mileage: '', fuel_type: 'petrol', transmission: 'manual',
    drive_type: 'fwd', condition: 'used', engine_capacity: '', color: '',
    description: '', location: '', city: '', category: '', car_type: '',
    car_class: '', video_url: '', features: '',
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user && user.role === 'buyer') { toast.error('Only sellers can post cars'); router.push('/dashboard'); return; }
    Promise.all([
      classAPI.getCategories(),
      classAPI.getTypes(),
      classAPI.getClasses(),
      classAPI.getTags(),
    ]).then(([c, t, cl, tg]) => {
      setCategories(c.data.results || c.data);
      setTypes(t.data.results || t.data);
      setClasses(cl.data.results || cl.data);
      setTags(tg.data.results || tg.data);
    });
  }, [isAuthenticated, user]);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.model || !form.price) {
      toast.error('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
      images.forEach(img => fd.append('images', img));
      selectedTags.forEach(t => fd.append('tag_ids', t));
      await carsAPI.create(fd);
      toast.success('🎉 Car listed! Pending review.');
      router.push('/dashboard/seller');
    } catch (err) {
      const errs = err.response?.data;
      if (errs && typeof errs === 'object') {
        Object.entries(errs).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`));
      } else {
        toast.error('Failed to post listing');
      }
    }
    setLoading(false);
  };

  const STEPS = ['Basic Info', 'Specs', 'Location & Details', 'Photos'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/seller" className="text-blue-600 hover:text-blue-700 text-sm">← My Listings</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Post New Car</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Car for Sale</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <button onClick={() => setStep(i + 1)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${step === i + 1 ? 'bg-blue-600 text-white' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === i + 1 ? 'bg-white text-blue-600' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-4 mx-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-800 text-lg">Basic Information</h2>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Listing Title *</label>
              <input required className="input-field" value={form.title}
                onChange={e => f('title', e.target.value)}
                placeholder="e.g. Toyota Corolla 2022 GLi White — Excellent Condition" />
              <p className="text-xs text-gray-400 mt-1">A descriptive title gets more views</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Brand *</label>
                <input required className="input-field" value={form.brand}
                  onChange={e => f('brand', e.target.value)} placeholder="Toyota" list="brands" />
                <datalist id="brands">
                  {['Toyota','Honda','Suzuki','Kia','BMW','Mercedes-Benz','Audi','Hyundai','MG','Changan','Proton','Ford','Land Rover','Porsche','Tesla'].map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Model *</label>
                <input required className="input-field" value={form.model}
                  onChange={e => f('model', e.target.value)} placeholder="Corolla" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Variant</label>
                <input className="input-field" value={form.variant}
                  onChange={e => f('variant', e.target.value)} placeholder="GLi 1.3" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Year *</label>
                <input type="number" required min="1990" max="2025" className="input-field"
                  value={form.year} onChange={e => f('year', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Price (PKR) *</label>
                <input type="number" required min="1" className="input-field" value={form.price}
                  onChange={e => f('price', e.target.value)} placeholder="4500000" />
                {form.price && <p className="text-xs text-blue-600 mt-1 font-medium">{parseFloat(form.price) >= 10000000 ? `PKR ${(form.price/1000000).toFixed(1)}M` : `PKR ${(form.price/100000).toFixed(1)}L`}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Mileage (km) *</label>
                <input type="number" required min="0" className="input-field" value={form.mileage}
                  onChange={e => f('mileage', e.target.value)} placeholder="50000" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="btn-primary px-6">Next: Specs →</button>
            </div>
          </div>
        )}

        {/* Step 2: Specs */}
        {step === 2 && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-800 text-lg">Technical Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Fuel Type</label>
                <select className="input-field" value={form.fuel_type} onChange={e => f('fuel_type', e.target.value)}>
                  {[['petrol','Petrol'],['diesel','Diesel'],['electric','Electric'],['hybrid','Hybrid'],['cng','CNG'],['lpg','LPG']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Transmission</label>
                <select className="input-field" value={form.transmission} onChange={e => f('transmission', e.target.value)}>
                  {[['manual','Manual'],['automatic','Automatic'],['cvt','CVT'],['dct','DCT']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Drive Type</label>
                <select className="input-field" value={form.drive_type} onChange={e => f('drive_type', e.target.value)}>
                  {[['fwd','FWD'],['rwd','RWD'],['awd','AWD'],['4wd','4WD']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Condition</label>
                <select className="input-field" value={form.condition} onChange={e => f('condition', e.target.value)}>
                  {[['used','Used'],['new','New'],['certified','Certified Pre-Owned']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Engine (cc)</label>
                <input type="number" className="input-field" value={form.engine_capacity}
                  onChange={e => f('engine_capacity', e.target.value)} placeholder="1300" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Color</label>
                <input className="input-field" value={form.color}
                  onChange={e => f('color', e.target.value)} placeholder="Pearl White" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Category</label>
                <select className="input-field" value={form.category} onChange={e => f('category', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Body Type</label>
                <select className="input-field" value={form.car_type} onChange={e => f('car_type', e.target.value)}>
                  <option value="">Select type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Class</label>
                <select className="input-field" value={form.car_class} onChange={e => f('car_class', e.target.value)}>
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <label key={t.id}
                    className={`cursor-pointer badge text-xs transition-all ${selectedTags.includes(t.id) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <input type="checkbox" className="hidden" checked={selectedTags.includes(t.id)}
                      onChange={() => setSelectedTags(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])} />
                    {selectedTags.includes(t.id) ? '✓ ' : ''}{t.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary px-6">← Back</button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary px-6">Next: Details →</button>
            </div>
          </div>
        )}

        {/* Step 3: Location & Details */}
        {step === 3 && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-800 text-lg">Location & Description</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">City *</label>
                <select className="input-field" value={form.city} onChange={e => f('city', e.target.value)} required>
                  <option value="">Select city</option>
                  {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Faisalabad','Multan','Hyderabad','Sialkot'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Area / Location</label>
                <input className="input-field" value={form.location}
                  onChange={e => f('location', e.target.value)} placeholder="DHA Phase 5, Clifton..." />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Description *</label>
              <textarea required rows="5" className="input-field" value={form.description}
                onChange={e => f('description', e.target.value)}
                placeholder="Describe the car in detail — condition, service history, modifications, reason for selling, special features..." />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 characters (aim for 100+)</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Key Features (optional)</label>
              <input className="input-field" value={form.features}
                onChange={e => f('features', e.target.value)}
                placeholder="Sunroof, Leather Seats, Push Start, Reverse Camera, Android Auto..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Video URL (YouTube/optional)</label>
              <input type="url" className="input-field" value={form.video_url}
                onChange={e => f('video_url', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary px-6">← Back</button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary px-6">Next: Photos →</button>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-800 text-lg">Photos</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <p className="text-4xl mb-3">📸</p>
              <p className="font-semibold text-gray-700 mb-1">Upload Car Photos</p>
              <p className="text-sm text-gray-400 mb-4">First photo will be the main listing photo. Up to 10 photos.</p>
              <label className="btn-primary cursor-pointer">
                Choose Photos
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">{imagePreviews.length} photo{imagePreviews.length !== 1 ? 's' : ''} selected</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="h-20 w-full object-cover rounded-xl" />
                      {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-md">Main</span>}
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs items-center justify-center hidden group-hover:flex">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary px-6">← Back</button>
              <button type="submit" disabled={loading}
                className="btn-primary px-8 py-3 text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Posting...
                  </span>
                ) : '🚀 Post Listing'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
