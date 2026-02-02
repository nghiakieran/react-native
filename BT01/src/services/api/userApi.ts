import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../redux/store';

import { API_URL } from '../../config';

// Base URL
const BASE_URL = `${API_URL}/users`;

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        updateProfile: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: 'profile',
                method: 'PUT',
                body: formData,
            }),
        }),
        changePassword: builder.mutation<any, any>({
            query: (data) => ({
                url: 'change-password',
                method: 'PUT',
                body: data,
            }),
        }),
        requestChangePhone: builder.mutation<any, { newPhone: string }>({
            query: (data) => ({
                url: 'change-phone/request',
                method: 'POST',
                body: data,
            }),
        }),
        verifyChangePhone: builder.mutation<any, { newPhone: string; otp: string }>({
            query: (data) => ({
                url: 'change-phone/verify',
                method: 'POST',
                body: data,
            }),
        }),
        requestChangeEmail: builder.mutation<any, { newEmail: string }>({
            query: (data) => ({
                url: 'change-email/request',
                method: 'POST',
                body: data,
            }),
        }),
        verifyChangeEmail: builder.mutation<any, { newEmail: string; otp: string }>({
            query: (data) => ({
                url: 'change-email/verify',
                method: 'POST',
                body: data,
            }),
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
} = userApi;
