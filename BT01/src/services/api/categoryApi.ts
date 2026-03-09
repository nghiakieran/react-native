import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

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

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${API_URL}/categories`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Category'],
    endpoints: (builder) => ({
        getCategories: builder.query<CategoryResponse, void>({
            query: () => '',
            providesTags: ['Category'],
        }),
        getCategoryById: builder.query<{ success: boolean; data: Category }, number>({
            query: (id) => `/${id}`,
            providesTags: (_result, _err, id) => [{ type: 'Category', id }],
        }),
        createCategory: builder.mutation<{ success: boolean; message: string; data: Category }, Partial<Category>>({
            query: (body) => ({
                url: '/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation<{ success: boolean; message: string; data: Category }, { id: number; updates: Partial<Category> }>({
            query: ({ id, updates }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (_result, _err, { id }) => ['Category', { type: 'Category', id }],
        }),
        deleteCategory: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
});

export const { 
    useGetCategoriesQuery, 
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} = categoryApi;
