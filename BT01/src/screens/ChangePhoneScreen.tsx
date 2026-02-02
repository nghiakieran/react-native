import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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
            Alert.alert("Error", "Please enter new phone number");
            return;
        }
        try {
            await requestOtp({ newPhone }).unwrap();
            Alert.alert("OTP Sent", "Please check your email/phone for the OTP code.");
            setStep(2);
        } catch (err: any) {
            Alert.alert("Error", err?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "OTP must be 6 digits");
            return;
        }
        try {
            await verifyOtp({ newPhone, otp }).unwrap();
            dispatch(updateUser({ phone: newPhone }));
            Alert.alert("Success", "Phone number updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert("Error", err?.data?.message || "Invalid OTP");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Title style={styles.title}>Change Phone Number</Title>

                {step === 1 ? (
                    <>
                        <Text style={styles.subtitle}>Enter your new phone number. We will send you an OTP to verify it.</Text>
                        <TextInput
                            label="New Phone Number"
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
                            Send OTP
                        </Button>
                    </>
                ) : (
                    <>
                        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to your email/phone.</Text>
                        <TextInput
                            label="OTP Code"
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
                            Verify & Change
                        </Button>
                        <Button
                            mode="text"
                            onPress={() => setStep(1)}
                            disabled={isVerifying}
                            style={styles.cancelButton}
                        >
                            Go Back
                        </Button>
                    </>
                )}

                {step === 1 && (
                    <Button
                        mode="text"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </Button>
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
    title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
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
