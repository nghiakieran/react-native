import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';
import { User } from '../../types/auth';

export interface UserListResponse {
    success: boolean;
    data: User[];
}

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/users`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // User Profile Actions
        updateProfile: builder.mutation<{ success: boolean; user: User }, FormData>({
            query: (body) => ({
                url: '/profile',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation<{ success: boolean; message: string }, any>({
            query: (body) => ({
                url: '/change-password',
                method: 'PUT',
                body,
            }),
        }),
        requestChangePhone: builder.mutation<{ success: boolean; message: string }, { newPhone: string }>({
            query: (body) => ({
                url: '/change-phone/request',
                method: 'POST',
                body,
            }),
        }),
        verifyChangePhone: builder.mutation<{ success: boolean; message: string }, { newPhone: string; otp: string }>({
            query: (body) => ({
                url: '/change-phone/verify',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        requestChangeEmail: builder.mutation<{ success: boolean; message: string }, { newEmail: string }>({
            query: (body) => ({
                url: '/change-email/request',
                method: 'POST',
                body,
            }),
        }),
        verifyChangeEmail: builder.mutation<{ success: boolean; message: string }, { newEmail: string; otp: string }>({
            query: (body) => ({
                url: '/change-email/verify',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),

        // Admin Actions
        getAllUsers: builder.query<UserListResponse, void>({
            query: () => '/admin/all',
            providesTags: ['User'],
        }),
        deleteUser: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useRequestChangePhoneMutation,
    useVerifyChangePhoneMutation,
    useRequestChangeEmailMutation,
    useVerifyChangeEmailMutation,
    useGetAllUsersQuery,
    useDeleteUserMutation,
} = userApi;
