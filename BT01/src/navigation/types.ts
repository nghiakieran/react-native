export type RootStackParamList = {
    Intro: undefined;
    Login: undefined;
    Register: undefined;
    VerifyOtp: { email: string; purpose: 'REGISTER' | 'RESET_PASSWORD' };
    ForgetPassword: undefined;
    ResetPassword: { resetToken: string };
    Home: { user?: { id: number; name: string; email: string } };
    AdminHome: undefined;
};
