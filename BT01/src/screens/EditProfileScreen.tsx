import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Title } from 'react-native-paper';
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
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);

            const response = await updateProfile(formData).unwrap();
            dispatch(updateUser(response.user));
            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert("Error", "Failed to update profile");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Title style={styles.title}>Edit Profile</Title>

                <TextInput
                    label="Full Name"
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
                    Save Changes
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
