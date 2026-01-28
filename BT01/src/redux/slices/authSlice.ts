import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    message: string | null;
    resetToken: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    message: null,
    resetToken: null,
};

// Simple loadUser thunk using SecureStore directly
export const loadUser = createAsyncThunk('auth/loadUser', async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const userStr = await SecureStore.getItemAsync('userData');
    const user = userStr ? JSON.parse(userStr) : null;
    if (token && user) {
        return { token, user };
    }
    throw new Error('No user data');
});

// Logout thunk
export const logout = createAsyncThunk('auth/logout', async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = !!action.payload.user;
        },
    },
    extraReducers: (builder) => {
        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.resetToken = null;
        });

        // Load User
        builder.addCase(loadUser.fulfilled, (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(loadUser.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export const { clearError, clearMessage, setCredentials } = authSlice.actions;
export default authSlice.reducer;
