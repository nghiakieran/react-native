import { User } from '../types/auth';

export type RootStackParamList = {
    Intro: undefined;
    Login: undefined;
    Register: undefined;
    VerifyOtp: { email: string; purpose: 'REGISTER' | 'RESET_PASSWORD' };
    ForgetPassword: undefined;
    ResetPassword: { resetToken: string };
    Home: { user?: User };
    AdminHome: undefined;
};
