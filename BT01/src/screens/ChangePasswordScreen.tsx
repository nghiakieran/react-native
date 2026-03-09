import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, HelperText } from 'react-native-paper';
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
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới không khớp");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        try {
            await changePassword({ oldPassword, newPassword }).unwrap();
            Alert.alert("Thành công", "Đổi mật khẩu thành công", [
                { text: "Đồng ý", onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            const msg = err?.data?.message || "Không thể đổi mật khẩu";
            Alert.alert("Lỗi", msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                <TextInput
                    label="Mật khẩu hiện tại"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    mode="outlined"
                    secureTextEntry={!showOldPass}
                    style={styles.input}
                    right={<TextInput.Icon icon={showOldPass ? "eye-off" : "eye"} onPress={() => setShowOldPass(!showOldPass)} />}
                />

                <TextInput
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry={!showNewPass}
                    style={styles.input}
                    right={<TextInput.Icon icon={showNewPass ? "eye-off" : "eye"} onPress={() => setShowNewPass(!showNewPass)} />}
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                    <HelperText type="error" visible={true}>
                        Mật khẩu phải có ít nhất 6 ký tự
                    </HelperText>
                )}

                <TextInput
                    label="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showNewPass}
                    style={styles.input}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <HelperText type="error" visible={true}>
                        Mật khẩu không khớp
                    </HelperText>
                )}

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading || hasErrors()}
                    style={styles.button}
                >
                    Cập nhật mật khẩu
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
