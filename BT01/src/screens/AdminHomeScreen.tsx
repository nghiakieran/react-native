import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, useTheme, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

import { useGetStatsQuery } from '../services/api/adminApi';
import { RefreshControl } from 'react-native';

export default function AdminHomeScreen({ navigation }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: statsData, isLoading, refetch, isError, error } = useGetStatsQuery();

    const handleLogout = () => {
        dispatch(logout());
    };

    React.useEffect(() => {
        if (isError) {
            console.error('[AdminHome] Stats error:', error);
            Alert.alert('Lỗi', 'Không thể tải số liệu thống kê. Vui lòng kiểm tra lại quyền truy cập.');
        }
    }, [isError, error]);

    const stats = statsData?.data || { products: 0, categories: 0, orders: 0, users: 0 };

    const adminStats = [
        { title: 'Sản phẩm', count: stats.products?.toString() || '0', icon: 'package-variant', color: '#6366F1', screen: 'AdminProductManager' },
        { title: 'Danh mục', count: stats.categories?.toString() || '0', icon: 'format-list-bulleted', color: '#10B981', screen: 'AdminCategoryManager' },
        { title: 'Đơn hàng', count: stats.orders?.toString() || '0', icon: 'clipboard-list', color: '#F59E0B', screen: 'AdminOrderManager' },
        { title: 'Người dùng', count: stats.users?.toString() || '0', icon: 'account-group', color: '#EC4899', screen: 'AdminUserManager' },
    ];

    const menuItems = [
        { label: 'Quản lý Sản phẩm', icon: '🛍️', color: '#EEF2FF', textColor: '#6366F1', screen: 'AdminProductManager' },
        { label: 'Quản lý Danh mục', icon: '📁', color: '#ECFDF5', textColor: '#10B981', screen: 'AdminCategoryManager' },
        { label: 'Quản lý Đơn hàng', icon: '📋', color: '#FFFBEB', textColor: '#F59E0B', screen: 'AdminOrderManager' },
        { label: 'Quản lý Người dùng', icon: '👥', color: '#FDF2F8', textColor: '#EC4899', screen: 'AdminUserManager' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
            >
                {/* Header Profile */}
                <View style={styles.header}>
                    <View>
                        <Title style={styles.welcomeText}>Xin chào Admin,</Title>
                        <Text style={styles.adminName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout}>
                        <Avatar.Icon size={48} icon="logout" style={{ backgroundColor: '#FEE2E2' }} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    {adminStats.map((stat, index) => (
                        <Card key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                            <Card.Content>
                                <Text style={styles.statCount}>{stat.count}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>

                {/* Main Menu Grid */}
                <View style={styles.menuGrid}>
                    <Title style={styles.sectionTitle}>Chức năng quản trị</Title>
                    <View style={styles.gridRow}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.menuItem, { backgroundColor: item.color }]}
                                onPress={() => {
                                    if (item.screen && (navigation.getState().routeNames as any).includes(item.screen)) {
                                        (navigation.navigate as any)(item.screen);
                                    }
                                }}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={[styles.menuLabel, { color: item.textColor }]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    welcomeText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    adminName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        justifyContent: 'space-between',
    },
    statCard: {
        width: COLUMN_WIDTH,
        margin: 8,
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statCount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    statTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2,
    },
    menuGrid: {
        paddingHorizontal: 20,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuItem: {
        width: COLUMN_WIDTH,
        height: 120,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    menuIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
});

