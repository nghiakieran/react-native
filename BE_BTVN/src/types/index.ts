export interface IUser {
  id?: number;
  name: string;
  email: string;
  password?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  resetToken?: string;
  email?: string;
  code?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    isVerified?: boolean;
    role?: "USER" | "ADMIN";
    createdAt?: Date;
  };
  errors?: any[];
}

export interface IOTPRequest {
  email: string;
  otp: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}

export interface IResendOTPRequest {
  email: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}

export interface IResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}
