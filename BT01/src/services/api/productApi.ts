import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    category: string;
    imageUrl: string;
    stock: number;
    soldCount: number;
}

export interface ProductResponse {
    success: boolean;
    pagination: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    data: Product[];
}

export interface ProductSimpleResponse {
    success: boolean;
    data: Product[];
    count: number;
}

export interface ProductFilter {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

const BASE_URL = `${API_URL}/products`;

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${API_URL}/products`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        getProducts: builder.query<ProductResponse, ProductFilter | void>({
            query: (filter) => {
                const params = new URLSearchParams();
                if (filter) {
                    if (filter.q) params.append('q', filter.q);
                    if (filter.category) params.append('category', filter.category);
                    if (filter.minPrice) params.append('minPrice', filter.minPrice.toString());
                    if (filter.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
                    if (filter.page) params.append('page', filter.page.toString());
                    if (filter.limit) params.append('limit', filter.limit.toString());
                }

                const qs = params.toString();
                return qs ? `?${qs}` : '';
            },
            providesTags: ['Product'],
            // Merge strategy for infinite scroll
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                // Ignore page and limit when caching, so we can append to the same list
                const { page, limit, ...rest } = queryArgs || {};
                return `${endpointName}-${JSON.stringify(rest)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg && arg.page && arg.page > 1) {
                    currentCache.data.push(...newItems.data);
                    currentCache.pagination = newItems.pagination;
                    return currentCache;
                }
                return newItems;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg;
            },
        }),
        getProductById: builder.query<{ success: boolean; data: Product }, number>({
            query: (id) => `/${id}`,
            providesTags: (_result, _err, id) => [{ type: 'Product', id }],
        }),
        getTopSellingProducts: builder.query<ProductSimpleResponse, number | void>({
            query: (limit = 10) => `/top-selling?limit=${limit}`,
            providesTags: ['Product'],
        }),
        getDiscountedProducts: builder.query<ProductSimpleResponse, number | void>({
            query: (limit = 20) => `/discounted?limit=${limit}`,
            providesTags: ['Product'],
        }),
        // Admin actions
        createProduct: builder.mutation<{ success: boolean; message: string; data: Product }, Partial<Product>>({
            query: (body) => ({
                url: '/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation<{ success: boolean; message: string; data: Product }, { id: number; updates: Partial<Product> }>({
            query: ({ id, updates }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (_result, _err, { id }) => ['Product', { type: 'Product', id }],
        }),
        deleteProduct: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
    }),
});

export const { 
    useGetProductsQuery, 
    useGetProductByIdQuery, 
    useGetTopSellingProductsQuery, 
    useGetDiscountedProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation
} = productApi;
