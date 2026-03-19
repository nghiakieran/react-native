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
import { useGetMyWalletQuery } from '../services/api/loyaltyApi';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const { data: walletRes } = useGetMyWalletQuery();
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const handleLogout = () => {
        dispatch(logout());
    };

    const getInitials = (name?: string) => {
        return name ? name.substring(0, 2).toUpperCase() : 'US';
    };

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
            Alert.alert("Yêu cầu quyền truy cập", "Bạn đã từ chối cho phép ứng dụng truy cập ảnh!");
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
                Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật");
            } catch (err) {
                Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện");
                setAvatarUri(null);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerTitleContainer}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
                <View style={{ width: 40 }} />
            </View>

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
                    <Text style={styles.points}>
                        Điểm tích lũy: {(walletRes?.data?.points || 0).toLocaleString('vi-VN')}
                    </Text>
                </View>

                {/* Menu Options */}
                <Card style={styles.card}>
                    <Card.Content>
                        <List.Item
                            title="Sản phẩm yêu thích"
                            description="Danh sách sản phẩm bạn đã lưu"
                            left={props => <List.Icon {...props} icon="heart" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('Favorites')}
                        />
                        <Divider />
                        <List.Item
                            title="Đã xem gần đây"
                            description="Những sản phẩm bạn vừa xem"
                            left={props => <List.Icon {...props} icon="history" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('RecentViews')}
                        />
                        <Divider />
                        <List.Item
                            title="Đơn hàng của tôi"
                            description="Xem lại lịch sử và theo dõi đơn hàng"
                            left={props => <List.Icon {...props} icon="package-variant-closed" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('OrderList')}
                        />
                        <Divider />
                        <List.Item
                            title="Thống kê dòng tiền"
                            description="Tổng tiền theo trạng thái đơn hàng"
                            left={props => <List.Icon {...props} icon="cash-multiple" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('OrderCashflowStats')}
                        />
                        <Divider />
                        <List.Item
                            title="Chỉnh sửa hồ sơ"
                            description="Thay đổi tên của bạn"
                            left={props => <List.Icon {...props} icon="account-edit" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <Divider />
                        <List.Item
                            title="Đổi mật khẩu"
                            left={props => <List.Icon {...props} icon="lock-reset" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ChangePassword')}
                        />
                        <Divider />
                        <List.Item
                            title="Đổi số điện thoại"
                            description={user?.phone || "Chưa thiết lập"}
                            left={props => <List.Icon {...props} icon="phone" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('ChangePhone')}
                        />
                        <Divider />
                        <List.Item
                            title="Đổi Email"
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
                    Đăng xuất
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
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
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
    points: {
        marginTop: 10,
        color: '#111827',
        fontWeight: '800',
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
