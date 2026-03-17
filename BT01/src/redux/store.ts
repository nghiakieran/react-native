import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import { authApi } from '../services/api/authApi';
import { userApi } from '../services/api/userApi';
import { productApi } from '../services/api/productApi';
import { categoryApi } from '../services/api/categoryApi';
import { cartApi } from '../services/api/cartApi';
import { orderApi } from '../services/api/orderApi';
import { adminApi } from '../services/api/adminApi';
import { reviewApi } from '../services/api/reviewApi';
import { favoriteApi } from '../services/api/favoriteApi';
import { recentViewApi } from '../services/api/recentViewApi';
import { loyaltyApi } from '../services/api/loyaltyApi';
import { couponApi } from '../services/api/couponApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [cartApi.reducerPath]: cartApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [reviewApi.reducerPath]: reviewApi.reducer,
        [favoriteApi.reducerPath]: favoriteApi.reducer,
        [recentViewApi.reducerPath]: recentViewApi.reducer,
        [loyaltyApi.reducerPath]: loyaltyApi.reducer,
        [couponApi.reducerPath]: couponApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            userApi.middleware,
            productApi.middleware,
            categoryApi.middleware,
            cartApi.middleware,
            orderApi.middleware,
            adminApi.middleware,
            reviewApi.middleware,
            favoriteApi.middleware,
            recentViewApi.middleware,
            loyaltyApi.middleware,
            couponApi.middleware,
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
