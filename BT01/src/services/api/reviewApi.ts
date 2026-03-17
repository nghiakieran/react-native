import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

export type ReviewReward =
  | { type: 'POINTS'; pointsAdded: number; pointsBalance: number }
  | { type: string; [k: string]: any };

export interface ReviewUser {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: ReviewUser;
}

export interface ReviewStats {
  reviewCount: number;
  avgRating: number;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: Review[];
  stats: ReviewStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewEligibilityResponse {
  success: boolean;
  data: { canReview: boolean; reason?: string; reviewed?: boolean; orderId?: number };
}

export interface CreateReviewRequest {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: Review;
  reward?: ReviewReward;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/reviews`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Reviews', 'ReviewEligibility'],
  endpoints: (builder) => ({
    getProductReviews: builder.query<ProductReviewsResponse, { productId: number; page?: number; limit?: number }>({
      query: ({ productId, page = 1, limit = 20 }) => `/product/${productId}?page=${page}&limit=${limit}`,
      providesTags: (_r, _e, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    getReviewEligibility: builder.query<ReviewEligibilityResponse, { productId: number }>({
      query: ({ productId }) => `/eligibility/${productId}`,
      providesTags: (_r, _e, { productId }) => [{ type: 'ReviewEligibility', id: productId }],
    }),
    createReview: builder.mutation<CreateReviewResponse, CreateReviewRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        { type: 'Reviews', id: body.productId },
        { type: 'ReviewEligibility', id: body.productId },
      ],
    }),
  }),
});

export const { useGetProductReviewsQuery, useGetReviewEligibilityQuery, useCreateReviewMutation } = reviewApi;

