'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await authAPI.logout(refresh);
    } catch {}
    dispatch(logout());
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push('/');
    toast.success('Logged out successfully');
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const navLink = (href, label) => (
    <Link href={href} onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${isActive(href) ? 'text-yellow-300' : 'text-blue-100 hover:text-white'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="bg-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <span className="text-2xl">🚗</span>
            <span>CarMarket</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/cars', 'Browse Cars')}
            {navLink('/cars?category__name=Electric', 'Electric')}
            {navLink('/cars?category__slug=luxury', 'Luxury')}
            {isAuthenticated && user?.role === 'seller' && navLink('/dashboard/seller', 'My Listings')}
            {isAuthenticated && (user?.role === 'admin' || user?.is_staff) && navLink('/admin', 'Admin')}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/wishlist" className="text-blue-100 hover:text-white text-sm flex items-center gap-1">
                  <span>♡</span> Wishlist
                </Link>
                <Link href="/cart" className="relative text-blue-100 hover:text-white text-sm flex items-center gap-1">
                  <span>🛒</span>
                  Cart
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {items.length}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors">
                    <div className="w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    {user?.first_name}
                    <span className="text-xs">▾</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                      <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                      {user?.role === 'seller' && <Link href="/dashboard/seller/add-car" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Post a Car</Link>}
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-blue-100 hover:text-white text-sm font-medium">Login</Link>
                <Link href="/auth/register" className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                  Post Free Ad
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl p-1">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600 px-4 py-4 space-y-3">
          <Link href="/cars" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">Browse Cars</Link>
          {isAuthenticated ? (
            <>
              <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">♡ Wishlist</Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">🛒 Cart ({items.length})</Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">Dashboard</Link>
              {user?.role === 'seller' && <Link href="/dashboard/seller" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">My Listings</Link>}
              {(user?.role === 'admin' || user?.is_staff) && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">Admin Panel</Link>}
              <button onClick={handleLogout} className="block text-red-300 hover:text-red-200 text-sm py-1">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white text-sm py-1">Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block bg-yellow-400 text-yellow-900 font-bold text-sm px-4 py-2 rounded-lg w-fit">Register Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
