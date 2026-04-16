import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../lib/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await ordersAPI.getCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (carId, { rejectWithValue }) => {
  try {
    await ordersAPI.addToCart({ car_id: carId, quantity: 1 });
    const res = await ordersAPI.getCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    await ordersAPI.removeFromCart(itemId);
    const res = await ordersAPI.getCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await ordersAPI.clearCart();
    return { items: [], total: 0 };
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const handle = (builder, thunk) => {
      builder.addCase(thunk.pending, (s) => { s.loading = true; });
      builder.addCase(thunk.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.items = payload?.items || [];
        s.total = payload?.total || 0;
      });
      builder.addCase(thunk.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
    };
    handle(builder, fetchCart);
    handle(builder, addToCart);
    handle(builder, removeFromCart);
    handle(builder, clearCart);
  },
});

export default cartSlice.reducer;
