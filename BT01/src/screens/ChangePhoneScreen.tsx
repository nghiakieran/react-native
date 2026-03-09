import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useRequestChangePhoneMutation, useVerifyChangePhoneMutation } from '../services/api/userApi';
import { updateUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, "ChangePhone">;

export default function ChangePhoneScreen({ navigation }: Props) {
    const dispatch = useDispatch();
    const [step, setStep] = useState<1 | 2>(1);
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');

    const [requestOtp, { isLoading: isRequesting }] = useRequestChangePhoneMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyChangePhoneMutation();

    const handleRequestOtp = async () => {
        if (!newPhone.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại mới");
            return;
        }
        try {
            await requestOtp({ newPhone }).unwrap();
            Alert.alert("Đã gửi OTP", "Vui lòng kiểm tra email/điện thoại để lấy mã OTP.");
            setStep(2);
        } catch (err: any) {
            Alert.alert("Lỗi", err?.data?.message || "Không thể gửi mã OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Lỗi", "Mã OTP phải có 6 chữ số");
            return;
        }
        try {
            await verifyOtp({ newPhone, otp }).unwrap();
            dispatch(updateUser({ phone: newPhone }));
            Alert.alert("Thành công", "Cập nhật số điện thoại thành công", [
                { text: "Đồng ý", onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert("Lỗi", err?.data?.message || "Mã OTP không hợp lệ");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đổi số điện thoại</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                {step === 1 ? (
                    <>
                        <Text style={styles.subtitle}>Nhập số điện thoại mới của bạn. Chúng tôi sẽ gửi mã OTP để xác thực.</Text>
                        <TextInput
                            label="Số điện thoại mới"
                            value={newPhone}
                            onChangeText={setNewPhone}
                            mode="outlined"
                            keyboardType="phone-pad"
                            style={styles.input}
                            left={<TextInput.Icon icon="phone" />}
                        />
                        <Button
                            mode="contained"
                            onPress={handleRequestOtp}
                            loading={isRequesting}
                            disabled={isRequesting}
                            style={styles.button}
                        >
                            Gửi mã OTP
                        </Button>
                    </>
                ) : (
                    <>
                        <Text style={styles.subtitle}>Nhập mã OTP 6 chữ số đã được gửi.</Text>
                        <TextInput
                            label="Mã OTP"
                            value={otp}
                            onChangeText={setOtp}
                            mode="outlined"
                            keyboardType="number-pad"
                            maxLength={6}
                            style={styles.input}
                            left={<TextInput.Icon icon="message" />}
                        />
                        <Button
                            mode="contained"
                            onPress={handleVerifyOtp}
                            loading={isVerifying}
                            disabled={isVerifying}
                            style={styles.button}
                        >
                            Xác thực & Thay đổi
                        </Button>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    backText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#666'
    },
    input: {
        marginBottom: 20,
    },
    button: {
        paddingVertical: 6,
        borderRadius: 8,
    },
    cancelButton: {
        marginTop: 10,
    }
});
