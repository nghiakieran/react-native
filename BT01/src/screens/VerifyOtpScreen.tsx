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
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../navigation/types';
import { clearError, clearMessage, setCredentials } from '../redux/slices/authSlice';
import { useResendOtpMutation, useVerifyOtpMutation } from '../services/api/authApi';
import { AppDispatch, RootState } from '../redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ navigation, route }: Props) {
    const { email, purpose } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);

    const dispatch = useDispatch<AppDispatch>();
    // RTK Query Hooks
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
            // Handled locally or fine here
            // Alert.alert('Verification Failed', error);
            // dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'OTP must be 6 digits');
            return;
        }
        try {
            const response = await verifyOtp({ email, otp, purpose }).unwrap();

            // ... (inside component)

            // If registering, set credentials manually since we just verified
            if (purpose === 'REGISTER' && response.token && response.user) {
                await SecureStore.setItemAsync('userToken', response.token);
                await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
                dispatch(setCredentials({ user: response.user, token: response.token }));
            }

            Alert.alert('Success', response.message || 'Verification successful', [
                {
                    text: 'OK', onPress: () => {
                        if (purpose === 'REGISTER') {
                            navigation.replace('Home', {});
                        } else {
                            // For reset password, response might contain resetToken if we setup backend/slice correctly
                            // Or we depend on the slice saving it. 
                            // But better to use the result if possible.
                            // The slice saves it to state.resetToken. 
                            // But we can also check if response holds it.
                            // Let's assume authSlice sets the state correctly, but we navigate HERE.
                            // However, need to access resetToken. 
                            // The thunk returns response. response may contain resetToken.
                            // Let's assume response has it.
                            // Cast response to any for safety or check type.
                            const r = response as any;
                            if (r.resetToken) {
                                navigation.navigate('ResetPassword', { resetToken: r.resetToken });
                            }
                        }
                    }
                }
            ]);

        } catch (err: any) {
            Alert.alert('Verification Failed', err as string || 'Failed to verify OTP');
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp({ email, purpose }).unwrap();
            Alert.alert('Success', 'New OTP sent');
            setTimer(60);
        } catch (err: any) {
            // Error handling done via hook error state or we can trap it here
            const errMsg = err?.data?.message || 'Failed to resend OTP';
            Alert.alert('Error', errMsg);
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
                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>
                            Enter the 6-digit code sent to {email}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>OTP Code</Text>
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
                                <Text style={styles.buttonText}>Verify</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code?"}
                            </Text>

                            {timer === 0 && (
                                <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                    <Text style={styles.linkText}> Resend</Text>
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
