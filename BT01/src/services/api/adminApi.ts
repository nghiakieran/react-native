import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

export interface DashboardStats {
    success: boolean;
    data: {
        users: number;
        products: number;
        categories: number;
        orders: number;
    }
}

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/admin`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['AdminStats'],
    endpoints: (builder) => ({
        getStats: builder.query<DashboardStats, void>({
            query: () => 'stats',
            providesTags: ['AdminStats'],
        }),
    }),
});

export const { useGetStatsQuery } = adminApi;
