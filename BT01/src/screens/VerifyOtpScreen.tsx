import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/types';
import { setCredentials } from '../redux/slices/authSlice';
import { useResendOtpMutation, useVerifyOtpMutation } from '../services/api/authApi';
import { AppDispatch } from '../redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ navigation, route }: Props) {
    const { email, purpose } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);

    const dispatch = useDispatch<AppDispatch>();

    const [verifyOtp, { isLoading: isVerifying, error: verifyError }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResending, error: resendError }] = useResendOtpMutation();

    const isLoading = isVerifying || isResending;
    const error = (verifyError as any)?.data?.message || (resendError as any)?.data?.message || null;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (error) {
            // Alert.alert('Verification Failed', error);
            // dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
            return;
        }
        try {
            const response = await verifyOtp({ email, otp, purpose }).unwrap();

            if (purpose === 'REGISTER' && response.token && response.user) {
                await SecureStore.setItemAsync('userToken', response.token);
                await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
                dispatch(setCredentials({ user: response.user, token: response.token }));
            }

            Alert.alert('Thành công', response.message || 'Xác thực thành công', [
                {
                    text: 'Đồng ý', onPress: () => {
                        if (purpose === 'REGISTER') {
                            navigation.replace('Home', {});
                        } else {
                            const r = response as any;
                            if (r.resetToken) {
                                navigation.navigate('ResetPassword', { resetToken: r.resetToken });
                            }
                        }
                    }
                }
            ]);

        } catch (err: any) {
            Alert.alert('Xác thực thất bại', err as string || 'Không thể xác thực mã OTP');
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp({ email, purpose }).unwrap();
            Alert.alert('Thành công', 'Đã gửi mã OTP mới');
            setTimer(60);
        } catch (err: any) {
            const errMsg = err?.data?.message || 'Không thể gửi lại mã OTP';
            Alert.alert('Lỗi', errMsg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Xác thực OTP</Text>
                        <Text style={styles.subtitle}>
                            Nhập mã 6 chữ số đã gửi đến {email}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mã OTP</Text>
                            <TextInput
                                placeholder="000000"
                                value={otp}
                                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                                keyboardType="number-pad"
                                editable={!isLoading}
                                maxLength={6}
                                textAlign="center"
                                style={[styles.input, { fontSize: 24, letterSpacing: 10 }]}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleVerify}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Xác thực</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {timer > 0 ? `Gửi lại mã sau ${timer}s` : "Không nhận được mã?"}
                            </Text>

                            {timer === 0 && (
                                <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                    <Text style={styles.linkText}> Gửi lại</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        color: '#1f2937',
        textAlign: 'center',
        letterSpacing: 10,
    },
    button: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
    },
    linkText: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '600',
        marginLeft: 4,
    },
});
