import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useRequestChangeEmailMutation, useVerifyChangeEmailMutation } from '../services/api/userApi';
import { updateUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, "ChangeEmail">;

export default function ChangeEmailScreen({ navigation }: Props) {
    const dispatch = useDispatch();
    const [step, setStep] = useState<1 | 2>(1);
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');

    const [requestOtp, { isLoading: isRequesting }] = useRequestChangeEmailMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyChangeEmailMutation();

    const handleRequestOtp = async () => {
        if (!newEmail.trim()) {
            Alert.alert("Error", "Please enter new email address");
            return;
        }
        try {
            await requestOtp({ newEmail }).unwrap();
            Alert.alert("OTP Sent", "Please check your NEW email for the OTP code.");
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
            await verifyOtp({ newEmail, otp }).unwrap();
            dispatch(updateUser({ email: newEmail }));
            Alert.alert("Success", "Email updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert("Error", err?.data?.message || "Invalid OTP");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Title style={styles.title}>Change Email</Title>

                {step === 1 ? (
                    <>
                        <Text style={styles.subtitle}>Enter your new email address. We will send you an OTP to verify it.</Text>
                        <TextInput
                            label="New Email Address"
                            value={newEmail}
                            onChangeText={setNewEmail}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            left={<TextInput.Icon icon="email" />}
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
                        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {newEmail}.</Text>
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
