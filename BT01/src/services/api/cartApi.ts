import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface CartProduct {
    id: number;
    name: string;
    price: number;
    discount: number;
    imageUrl: string;
    stock: number;
}

export interface CartItem {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: CartProduct;
}

export interface CartResponse {
    success: boolean;
    data: CartItem[];
    subtotal: number;
    totalItems: number;
}

export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    id: number;
    quantity: number;
}

// ─── Cart API ──────────────────────────────────────────────────────────────────
export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/cart`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Cart'],
    endpoints: (builder) => ({
        // GET /api/cart
        getCart: builder.query<CartResponse, void>({
            query: () => '',
            providesTags: ['Cart'],
        }),

        // POST /api/cart
        addToCart: builder.mutation<{ success: boolean; message: string; data: CartItem }, AddToCartRequest>({
            query: (body) => ({
                url: '',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Cart'],
        }),

        // PUT /api/cart/:id
        updateCartItem: builder.mutation<{ success: boolean; message: string; data: CartItem }, UpdateCartItemRequest>({
            query: ({ id, quantity }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: { quantity },
            }),
            invalidatesTags: ['Cart'],
        }),

        // DELETE /api/cart/:id
        removeFromCart: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),

        // DELETE /api/cart (xóa toàn bộ giỏ)
        clearCart: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi;
