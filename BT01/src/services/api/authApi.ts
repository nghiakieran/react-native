import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';
import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    VerifyOtpPayload,
    ResendOtpPayload,
    ForgetPasswordPayload,
    ResetPasswordPayload
} from '../../types/auth'; // Ensure these wrap what backend sends

// Base URL
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/auth'
    : 'http://localhost:5000/api/auth';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginPayload>({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<AuthResponse, RegisterPayload>({
            query: (userData) => ({
                url: 'register',
                method: 'POST',
                body: userData,
            }),
        }),
        verifyOtp: builder.mutation<AuthResponse, VerifyOtpPayload>({
            query: (data) => ({
                url: 'verify-otp',
                method: 'POST',
                body: data,
            }),
        }),
        resendOtp: builder.mutation<AuthResponse, ResendOtpPayload>({
            query: (data) => ({
                url: 'resend-otp',
                method: 'POST',
                body: data,
            }),
        }),
        forgetPassword: builder.mutation<AuthResponse, ForgetPasswordPayload>({
            query: (data) => ({
                url: 'forget-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation<AuthResponse, ResetPasswordPayload>({
            query: (data) => ({
                url: 'reset-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation
} = authApi;
