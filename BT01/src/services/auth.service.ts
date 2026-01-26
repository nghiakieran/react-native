import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    VerifyOtpPayload,
    ResendOtpPayload,
    ForgetPasswordPayload,
    ResetPasswordPayload,
} from '../types/auth';
import { Platform } from 'react-native';

// specific basic url for android/ios
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/auth'
    : 'http://localhost:5000/api/auth';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token
apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const AuthService = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/login', payload);
        if (response.data.token) {
            await SecureStore.setItemAsync('userToken', response.data.token);
            if (response.data.user) {
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/register', payload);
        return response.data;
    },

    verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/verify-otp', payload);
        if (payload.purpose === 'REGISTER' && response.data.token) {
            await SecureStore.setItemAsync('userToken', response.data.token);
            if (response.data.user) {
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    resendOtp: async (payload: ResendOtpPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/resend-otp', payload);
        return response.data;
    },

    forgetPassword: async (payload: ForgetPasswordPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/forget-password', payload);
        return response.data;
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/reset-password', payload);
        return response.data;
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
    },

    getToken: async () => {
        return await SecureStore.getItemAsync('userToken');
    },

    getUser: async () => {
        const user = await SecureStore.getItemAsync('userData');
        return user ? JSON.parse(user) : null;
    }
};

export default AuthService;
