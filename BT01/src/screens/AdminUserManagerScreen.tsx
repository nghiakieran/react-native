import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton, useTheme, Avatar } from 'react-native-paper';
import { useGetAllUsersQuery, useDeleteUserMutation } from '../services/api/userApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminUserManager'>;

export default function AdminUserManagerScreen({ navigation }: Props) {
    const theme = useTheme();
    const { data: userData, isLoading, refetch, isError, error } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();

    const users = userData?.data || [];

    React.useEffect(() => {
        if (isError) {
            console.error('[AdminUser] Load error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng kiểm tra lại quyền truy cập.');
        }
    }, [isError, error]);

    const handleBack = () => navigation.goBack();

    const handleDeleteUser = (id: number, name: string) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa người dùng "${name}"? Thao tác này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: 'Xóa', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(id).unwrap();
                            Alert.alert('Thành công', 'Đã xóa người dùng');
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.data?.message || 'Không thể xóa người dùng');
                        }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <View style={styles.cardRow}>
                {item.avatar ? (
                    <Image source={{ uri: `http://localhost:5000${item.avatar}` }} style={styles.avatarImg} />
                ) : (
                    <Avatar.Text 
                        size={48} 
                        label={item.name.substring(0, 2).toUpperCase()} 
                        style={styles.avatarText}
                        color="#fff"
                    />
                )}
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.roleContainer}>
                        <Text style={[styles.roleBadge, { color: item.role === 'ADMIN' ? '#EF4444' : '#10B981' }]}>
                            ● {item.role}
                        </Text>
                        <Text style={styles.userJoined}>• Tham gia: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                </View>
                <IconButton 
                    icon="trash-can-outline" 
                    iconColor="#EF4444" 
                    size={22} 
                    onPress={() => handleDeleteUser(item.id, item.name)} 
                />
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
                <IconButton icon="refresh" onPress={() => refetch()} />
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text>Chưa có người dùng nào</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
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
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1, padding: 12 },
    listContent: { paddingBottom: 20 },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    avatarImg: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarText: {
        backgroundColor: '#6366F1',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    userEmail: {
        fontSize: 12,
        color: '#6B7280',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    roleBadge: {
        fontSize: 11,
        fontWeight: '700',
        marginRight: 8,
    },
    userJoined: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    emptyState: { alignItems: 'center', marginTop: 40 }
});
