import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';
import type { Product } from './productApi';

export interface RecentView {
  id: number;
  userId: number;
  productId: number;
  lastViewedAt: string;
  product?: Product;
}

export const recentViewApi = createApi({
  reducerPath: 'recentViewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/recent-views`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['RecentViews'],
  endpoints: (builder) => ({
    getMyRecentViews: builder.query<{ success: boolean; data: RecentView[] }, { limit?: number } | void>({
      query: (arg) => {
        const limit = arg && 'limit' in arg && arg.limit ? arg.limit : 20;
        return `/?limit=${limit}`;
      },
      providesTags: ['RecentViews'],
    }),
    upsertRecentView: builder.mutation<{ success: boolean; data: RecentView }, { productId: number }>({
      query: ({ productId }) => ({
        url: '/',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['RecentViews'],
    }),
  }),
});

export const { useGetMyRecentViewsQuery, useUpsertRecentViewMutation } = recentViewApi;

