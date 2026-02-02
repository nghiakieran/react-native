import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Title, HelperText } from 'react-native-paper';
import { useChangePasswordMutation } from '../services/api/userApi';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, "ChangePassword">;

export default function ChangePasswordScreen({ navigation }: Props) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    const hasErrors = () => {
        if (newPassword.length > 0 && newPassword.length < 6) return true;
        if (confirmPassword.length > 0 && newPassword !== confirmPassword) return true;
        return false;
    };

    const handleSave = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        try {
            await changePassword({ oldPassword, newPassword }).unwrap();
            Alert.alert("Success", "Password changed successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            const msg = err?.data?.message || "Failed to change password";
            Alert.alert("Error", msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Title style={styles.title}>Change Password</Title>

                <TextInput
                    label="Current Password"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    mode="outlined"
                    secureTextEntry={!showOldPass}
                    style={styles.input}
                    right={<TextInput.Icon icon={showOldPass ? "eye-off" : "eye"} onPress={() => setShowOldPass(!showOldPass)} />}
                />

                <TextInput
                    label="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry={!showNewPass}
                    style={styles.input}
                    right={<TextInput.Icon icon={showNewPass ? "eye-off" : "eye"} onPress={() => setShowNewPass(!showNewPass)} />}
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                    <HelperText type="error" visible={true}>
                        Password must be at least 6 characters
                    </HelperText>
                )}

                <TextInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showNewPass} // Same toggle for simplicity, or add another
                    style={styles.input}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <HelperText type="error" visible={true}>
                        Passwords do not match
                    </HelperText>
                )}

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading || hasErrors()}
                    style={styles.button}
                >
                    Update Password
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                >
                    Cancel
                </Button>
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
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
    },
    button: {
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 10,
    },
    cancelButton: {
        marginTop: 10,
    }
});
