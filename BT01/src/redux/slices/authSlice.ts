import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth.service';
import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    VerifyOtpPayload,
    ResendOtpPayload,
    ForgetPasswordPayload,
    ResetPasswordPayload,
    User,
} from '../../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    message: string | null; // For success messages
    resetToken: string | null; // Store token for reset password flow
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

// Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (payload: RegisterPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.register(payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload: VerifyOtpPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.verifyOtp(payload);
            return { ...response, purpose: payload.purpose };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'OTP Verification failed');
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (payload: ResendOtpPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.resendOtp(payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Resend OTP failed');
        }
    }
);

export const forgetPassword = createAsyncThunk(
    'auth/forgetPassword',
    async (payload: ForgetPasswordPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.forgetPassword(payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Request failed');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (payload: ResetPasswordPayload, { rejectWithValue }) => {
        try {
            const response = await AuthService.resetPassword(payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Reset password failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await AuthService.logout();
});

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
    const token = await AuthService.getToken();
    const user = await AuthService.getUser();
    if (token && user) {
        return { token, user };
    }
    throw new Error('No user data');
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
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user || null;
            state.token = action.payload.token || null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Verify OTP
        builder.addCase(verifyOtp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(verifyOtp.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload.purpose === 'REGISTER') {
                state.isAuthenticated = true;
                state.user = action.payload.user || null;
                state.token = action.payload.token || null;
            } else if (action.payload.purpose === 'RESET_PASSWORD') {
                state.resetToken = action.payload.resetToken || null;
                state.message = action.payload.message;
            }
        });
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Forget Password
        builder.addCase(forgetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(forgetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message;
        });
        builder.addCase(forgetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Reset Password
        builder.addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.message = action.payload.message;
            state.resetToken = null; // Clear reset token
        });
        builder.addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

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
    },
});

export const { clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
