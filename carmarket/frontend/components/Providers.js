'use client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initAuth } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';

function AuthInit({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initAuth());
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);
  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  );
}
