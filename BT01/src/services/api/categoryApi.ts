import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';

export interface Category {
    id: number;
    name: string;
    description?: string;
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryResponse {
    success: boolean;
    count: number;
    data: Category[];
}

const BASE_URL = `${API_URL}/categories`;

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({
        getCategories: builder.query<CategoryResponse, void>({
            query: () => '',
        }),
        getCategoryById: builder.query<{ success: boolean; data: Category }, number>({
            query: (id) => `/${id}`,
        }),
    }),
});

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoryApi;
