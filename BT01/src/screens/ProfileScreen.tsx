import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Title, Text, useTheme, List, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { logout, updateUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';
import { useUpdateProfileMutation } from '../services/api/userApi';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../config';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const handleLogout = () => {
        dispatch(logout());
    };

    const getInitials = (name?: string) => {
        return name ? name.substring(0, 2).toUpperCase() : 'US';
    };

    // Construct full avatar URL if it's a relative path from backend
    const getAvatarUrl = (avatarPath?: string | null) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http')) return avatarPath;
        return `${BASE_URL}${avatarPath}`;
    };

    const currentAvatarUrl = avatarUri || getAvatarUrl(user?.avatar);

    const pickImage = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);

            // Upload immediately
            const formData = new FormData();
            formData.append('avatar', {
                uri: result.assets[0].uri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            } as any);

            try {
                const response = await updateProfile(formData).unwrap();
                dispatch(updateUser(response.user));
                setAvatarUri(null);
                Alert.alert("Success", "Avatar updated successfully");
            } catch (err) {
                Alert.alert("Error", "Failed to update avatar");
                setAvatarUri(null);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Profile Info */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {currentAvatarUrl ? (
                            <Avatar.Image size={100} source={{ uri: currentAvatarUrl }} />
                        ) : (
                            <Avatar.Text size={100} label={getInitials(user?.name)} style={{ backgroundColor: theme.colors.primary }} />
                        )}
                        <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
                            <IconButton icon="camera" iconColor="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    <Title style={styles.name}>{user?.name}</Title>
                    <Text style={styles.email}>{user?.email}</Text>
                    {user?.phone && <Text style={styles.phone}>{user?.phone}</Text>}
                </View>

                {/* Menu Options */}
                <Card style={styles.card}>
                    <Card.Content>
                        <List.Item
                            title="Edit Profile"
                            description="Change your name"
                            left={props => <List.Icon {...props} icon="account-edit" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <Divider />
                        <List.Item
                            title="Change Password"
                            left={props => <List.Icon {...props} icon="lock-reset" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ChangePassword')}
                        />
                        <Divider />
                        <List.Item
                            title="Change Phone Number"
                            description={user?.phone || "Not set"}
                            left={props => <List.Icon {...props} icon="phone" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ChangePhone')}
                        />
                        <Divider />
                        <List.Item
                            title="Change Email"
                            description={user?.email}
                            left={props => <List.Icon {...props} icon="email" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ChangeEmail')}
                        />
                    </Card.Content>
                </Card>

                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    textColor={theme.colors.error}
                    icon="logout"
                >
                    Log Out
                </Button>

            </ScrollView>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator animating={true} size="large" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#6200ee',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        color: 'gray',
        marginTop: 5,
    },
    phone: {
        color: 'gray',
        marginTop: 2,
    },
    card: {
        margin: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 2,
    },
    logoutButton: {
        margin: 15,
        borderColor: '#ef5350',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
