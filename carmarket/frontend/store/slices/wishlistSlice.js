import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../lib/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.getAll();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (carId, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.toggle(carId);
    return { carId, status: res.data.status };
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (s, { payload }) => {
      s.items = payload.results || payload;
    });
    builder.addCase(toggleWishlist.fulfilled, (s, { payload }) => {
      if (payload.status === 'removed') {
        s.items = s.items.filter((item) => item.car.id !== payload.carId);
      }
    });
  },
});

export default wishlistSlice.reducer;
