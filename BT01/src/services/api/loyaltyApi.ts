import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

export interface PointTransaction {
  id: number;
  userId: number;
  type: 'EARN' | 'SPEND';
  points: number;
  note?: string | null;
  orderId?: number | null;
  createdAt: string;
}

export const loyaltyApi = createApi({
  reducerPath: 'loyaltyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/loyalty`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Wallet'],
  endpoints: (builder) => ({
    getMyWallet: builder.query<{ success: boolean; data: { points: number; transactions: PointTransaction[] } }, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetMyWalletQuery } = loyaltyApi;

