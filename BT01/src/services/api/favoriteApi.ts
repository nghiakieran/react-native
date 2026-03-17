import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';
import type { Product } from './productApi';

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: Product;
}

export const favoriteApi = createApi({
  reducerPath: 'favoriteApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/favorites`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Favorites', 'FavoriteStatus'],
  endpoints: (builder) => ({
    getMyFavorites: builder.query<{ success: boolean; data: Favorite[] }, void>({
      query: () => '/',
      providesTags: ['Favorites'],
    }),
    isFavorite: builder.query<{ success: boolean; data: { isFavorite: boolean } }, { productId: number }>({
      query: ({ productId }) => `/${productId}`,
      providesTags: (_r, _e, { productId }) => [{ type: 'FavoriteStatus', id: productId }],
    }),
    toggleFavorite: builder.mutation<{ success: boolean; data: { isFavorite: boolean } }, { productId: number }>({
      query: ({ productId }) => ({
        url: '/toggle',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: (_r, _e, { productId }) => ['Favorites', { type: 'FavoriteStatus', id: productId }],
    }),
  }),
});

export const { useGetMyFavoritesQuery, useIsFavoriteQuery, useToggleFavoriteMutation } = favoriteApi;

