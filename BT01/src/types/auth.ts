export interface User {
    id: number;
    name: string;
    email: string;
    isVerified: boolean;
    role?: "USER" | "ADMIN";
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
    email?: string; // Returned in register/otp flows sometimes
    resetToken?: string; // Returned in verify-otp for password reset
    code?: string; // e.g. "ACCOUNT_NOT_VERIFIED"
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
    purpose: 'REGISTER' | 'RESET_PASSWORD';
}

export interface ResendOtpPayload {
    email: string;
    purpose: 'REGISTER' | 'RESET_PASSWORD';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface ForgetPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}
