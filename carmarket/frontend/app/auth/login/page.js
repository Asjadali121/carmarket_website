'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { fetchCart } from '../../../store/slices/cartSlice';
import { fetchWishlist } from '../../../store/slices/wishlistSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.first_name}!`);
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      const user = result.payload.user;
      if (user.role === 'admin' || user.is_staff) router.push('/admin');
      else router.push('/dashboard');
    } else {
      const err = result.payload;
      toast.error(err?.detail || err?.non_field_errors?.[0] || 'Invalid email or password');
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">🚗</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your CarMarket account</p>
        </div>

        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" required autoComplete="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  className="input-field pr-10"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Logging in...
                </span>
              ) : 'Login →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700">Register free</Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="card p-4 mt-4 shadow-sm">
          <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">🔑 Demo Accounts</p>
          <div className="space-y-2">
            {[
              { label: 'Admin', email: 'admin@carmarket.pk', password: 'Admin@1234', color: 'purple' },
              { label: 'Seller', email: 'seller1@carmarket.pk', password: 'Seller@1234', color: 'blue' },
              { label: 'Buyer', email: 'buyer1@carmarket.pk', password: 'Buyer@1234', color: 'green' },
            ].map(({ label, email, password, color }) => (
              <button key={label} onClick={() => fillDemo(email, password)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all hover:shadow-sm
                  ${color === 'purple' ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' :
                    color === 'blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
                    'border-green-200 bg-green-50 hover:bg-green-100'}`}>
                <span className={`font-bold ${color === 'purple' ? 'text-purple-700' : color === 'blue' ? 'text-blue-700' : 'text-green-700'}`}>{label}</span>
                <span className="text-gray-500 ml-2">{email}</span>
                <span className="float-right text-gray-400">Click to fill →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
