'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { carsAPI, classAPI } from '../../../../../lib/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function EditCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector(s => s.auth);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    Promise.all([
      carsAPI.getById(id),
      classAPI.getCategories(),
      classAPI.getTypes(),
      classAPI.getClasses(),
      classAPI.getTags(),
    ]).then(([carRes, catRes, typeRes, classRes, tagRes]) => {
      const car = carRes.data;
      setForm({
        title: car.title, brand: car.brand, model: car.model, variant: car.variant || '',
        year: car.year, price: car.price, mileage: car.mileage,
        fuel_type: car.fuel_type, transmission: car.transmission, drive_type: car.drive_type,
        condition: car.condition, engine_capacity: car.engine_capacity || '',
        color: car.color || '', description: car.description,
        location: car.location || '', city: car.city,
        category: car.category?.id || '', car_type: car.car_type?.id || '',
        car_class: car.car_class?.id || '', video_url: car.video_url || '',
      });
      setSelectedTags(car.tags?.map(t => t.id) || []);
      setExistingImages(car.images || []);
      setCategories(catRes.data.results || catRes.data);
      setTypes(typeRes.data.results || typeRes.data);
      setClasses(classRes.data.results || classRes.data);
      setTags(tagRes.data.results || tagRes.data);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load car'); setLoading(false); });
  }, [id, isAuthenticated]);

  const handleDeleteImage = async (imgId) => {
    try {
      await carsAPI.deleteImage(imgId);
      setExistingImages(prev => prev.filter(i => i.id !== imgId));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
      selectedTags.forEach(t => fd.append('tag_ids', t));
      await carsAPI.update(id, fd);

      if (newImages.length > 0) {
        const imgFd = new FormData();
        newImages.forEach(img => imgFd.append('images', img));
        await carsAPI.addImages(id, imgFd);
      }
      toast.success('Listing updated!');
      router.push('/dashboard/seller');
    } catch (err) {
      const errs = err.response?.data;
      const msg = errs ? Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Update failed';
      toast.error(msg);
    }
    setSaving(false);
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!form) return <p className="text-center py-20 text-gray-400">Car not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Listing Title *</label>
          <input required className="input-field mt-1" value={form.title} onChange={e => f('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['Brand *','brand','text'],['Model *','model','text'],['Variant','variant','text'],['Year *','year','number'],['Price (PKR) *','price','number'],['Mileage (km) *','mileage','number'],['Engine (cc)','engine_capacity','number'],['Color','color','text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input type={type} className="input-field mt-1" value={form[key]} required={label.includes('*')}
                onChange={e => f(key, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Fuel Type','fuel_type',[['petrol','Petrol'],['diesel','Diesel'],['electric','Electric'],['hybrid','Hybrid'],['cng','CNG']]],
            ['Transmission','transmission',[['manual','Manual'],['automatic','Automatic'],['cvt','CVT'],['dct','DCT']]],
            ['Drive','drive_type',[['fwd','FWD'],['rwd','RWD'],['awd','AWD'],['4wd','4WD']]],
            ['Condition','condition',[['used','Used'],['new','New'],['certified','CPO']]],
          ].map(([label, key, opts]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <select className="input-field mt-1" value={form[key]} onChange={e => f(key, e.target.value)}>
                {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select className="input-field mt-1" value={form.category} onChange={e => f('category', e.target.value)}>
              <option value="">Select</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Body Type</label>
            <select className="input-field mt-1" value={form.car_type} onChange={e => f('car_type', e.target.value)}>
              <option value="">Select</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Class</label>
            <select className="input-field mt-1" value={form.car_class} onChange={e => f('car_class', e.target.value)}>
              <option value="">Select</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">City *</label><input required className="input-field mt-1" value={form.city} onChange={e => f('city', e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700">Location/Area</label><input className="input-field mt-1" value={form.location} onChange={e => f('location', e.target.value)} /></div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description *</label>
          <textarea required rows="4" className="input-field mt-1" value={form.description} onChange={e => f('description', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <label key={t.id} className={`cursor-pointer badge ${selectedTags.includes(t.id) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700'}`}>
                <input type="checkbox" className="hidden" checked={selectedTags.includes(t.id)}
                  onChange={() => setSelectedTags(prev => prev.includes(t.id) ? prev.filter(i => i !== t.id) : [...prev, t.id])} />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        {existingImages.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Current Images</label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map(img => (
                <div key={img.id} className="relative">
                  <img src={img.image} alt="" className="h-16 w-20 object-cover rounded-lg" />
                  <button type="button" onClick={() => handleDeleteImage(img.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Add More Photos</label>
          <input type="file" multiple accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
            onChange={e => setNewImages(Array.from(e.target.files))} />
        </div>
        <button type="submit" disabled={saving} className="w-full btn-primary py-3">{saving ? 'Saving...' : 'Update Listing'}</button>
      </form>
    </div>
  );
}
