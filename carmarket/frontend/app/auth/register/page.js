'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', city: '', role: 'buyer', password: '', password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector(s => s.auth);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('🎉 Account created successfully!');
      router.push('/dashboard');
    } else {
      const errs = result.payload;
      if (typeof errs === 'object') {
        Object.entries(errs).forEach(([key, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          toast.error(`${key}: ${msg}`);
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">🚗</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Pakistan's #1 Car Marketplace</p>
        </div>

        <div className="card p-8 shadow-lg">
          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[['buyer', '🛒 Buy a Car', 'Browse and purchase cars'],
                ['seller', '🚗 Sell a Car', 'Post listings and sell']].map(([val, label, desc]) => (
                <label key={val} className={`cursor-pointer border-2 rounded-xl p-3 transition-all ${form.role === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="role" value={val} checked={form.role === val} onChange={() => set('role', val)} className="hidden" />
                  <p className="font-semibold text-sm text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">First Name *</label>
                <input required className="input-field" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ali" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Last Name *</label>
                <input required className="input-field" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Hassan" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Username *</label>
              <input required className="input-field" value={form.username} onChange={e => set('username', e.target.value)} placeholder="ali_hassan" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Email Address *</label>
              <input type="email" required className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ali@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="03XX-XXXXXXX" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">City</label>
                <select className="input-field" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select city</option>
                  {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Faisalabad','Multan','Hyderabad'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required className="input-field pr-10"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min. 8 characters" minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Confirm Password *</label>
              <input type={showPassword ? 'text' : 'password'} required className="input-field"
                value={form.password2} onChange={e => set('password2', e.target.value)}
                placeholder="Repeat password" />
              {form.password2 && form.password !== form.password2 && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <button type="submit" disabled={loading || (form.password2 && form.password !== form.password2)}
              className="w-full btn-primary py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating Account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
