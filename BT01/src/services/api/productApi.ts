import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
    soldCount: number;
}

export interface ProductResponse {
    success: boolean;
    count: number;
    data: Product[];
}

export interface ProductFilter {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

const BASE_URL = `${API_URL}/products`;

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({
        getProducts: builder.query<ProductResponse, ProductFilter | void>({
            query: (filter) => {
                if (!filter) return '';

                const params = new URLSearchParams();
                if (filter.q) params.append('q', filter.q);
                if (filter.category) params.append('category', filter.category);
                if (filter.minPrice) params.append('minPrice', filter.minPrice.toString());
                if (filter.maxPrice) params.append('maxPrice', filter.maxPrice.toString());

                return `?${params.toString()}`;
            },
        }),
        getProductById: builder.query<ProductResponse, number>({
            query: (id) => `/${id}`,
        }),
        getTopSellingProducts: builder.query<ProductResponse, number | void>({
            query: (limit = 10) => `/top-selling?limit=${limit}`,
        }),
    }),
});

export const { useGetProductsQuery, useGetProductByIdQuery, useGetTopSellingProductsQuery } = productApi;
