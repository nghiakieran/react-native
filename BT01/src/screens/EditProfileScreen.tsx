import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateUser } from '../redux/slices/authSlice';
import { useUpdateProfileMutation } from '../services/api/userApi';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [name, setName] = useState(user?.name || '');
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên không được để trống");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);

            const response = await updateProfile(formData).unwrap();
            dispatch(updateUser(response.user));
            Alert.alert("Thành công", "Cập nhật hồ sơ thành công", [
                { text: "Đồng ý", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể cập nhật hồ sơ");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                <TextInput
                    label="Họ và tên"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                />

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.button}
                >
                    Lưu thay đổi
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
