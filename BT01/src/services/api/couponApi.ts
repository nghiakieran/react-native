import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';

export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/coupons`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    validateCoupon: builder.query<
      { success: boolean; data: { coupon: Coupon; discount: number } },
      { code: string; subtotal: number }
    >({
      query: ({ code, subtotal }) =>
        `/validate?code=${encodeURIComponent(code)}&subtotal=${encodeURIComponent(String(subtotal))}`,
    }),
  }),
});

export const { useValidateCouponQuery } = couponApi;

