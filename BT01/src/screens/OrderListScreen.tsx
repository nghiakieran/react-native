import React, { useState } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme } from 'react-native-paper';
import { RootStackParamList } from '../navigation/types';
import {
    useGetMyOrdersQuery, Order, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, OrderStatus
} from '../services/api/orderApi';
import { format } from 'date-fns';

type OrderListScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderList'>;

const STATUS_FILTERS = [
    { label: 'Tất cả', value: '' },
    { label: 'Mới đặt', value: 'NEW' },
    { label: 'Đang chuẩn bị', value: 'PREPARING' },
    { label: 'Đang giao', value: 'SHIPPING' },
    { label: 'Hoàn thành', value: 'DELIVERED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
];

export default function OrderListScreen({ navigation }: OrderListScreenProps) {
    const theme = useTheme();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { data: response, isLoading, refetch, isFetching } = useGetMyOrdersQuery({
        status: (statusFilter as OrderStatus) || undefined,
        limit: 50, // Lấy nhiều một chút để đỡ phải trang thủ công (do FlatList)
    });

    const orders = response?.data || [];

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Chưa có đơn hàng nào{statusFilter ? ' ở trạng thái này' : ''}</Text>
                {!statusFilter && (
                    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home', {})}>
                        <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const statusColor = ORDER_STATUS_COLOR[item.status] || '#6B7280';
        const itemCount = item.items.reduce((sum, i) => sum + i.quantity, 0);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderIdText}>Đơn hàng #{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {ORDER_STATUS_LABEL[item.status]}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Thời gian đặt:</Text>
                        <Text style={styles.detailValue}>
                            {format(new Date(item.createdAt), 'HH:mm - dd/MM/yyyy')}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Số lượng:</Text>
                        <Text style={styles.detailValue}>{itemCount} sản phẩm</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tổng tiền:</Text>
                        <Text style={styles.orderPrice}>{Number(item.totalAmount).toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>

                <View style={styles.detailArrow}>
                    <Text style={styles.detailArrowText}>Xem chi tiết →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterWrapper}>
                <FlatList
                    horizontal
                    data={STATUS_FILTERS}
                    keyExtractor={(it) => it.value}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, statusFilter === item.value && styles.filterChipActive]}
                            onPress={() => setStatusFilter(item.value)}
                        >
                            <Text style={[styles.filterText, statusFilter === item.value && styles.filterTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Content List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={[styles.listContent, orders.length === 0 && { flex: 1 }]}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isFetching && !isLoading}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    backText: { fontSize: 24, fontWeight: '700', color: '#111827' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    filterWrapper: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
    filterTextActive: { color: '#fff' },

    listContent: { padding: 16, paddingBottom: 40 },

    orderCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderIdText: { fontSize: 16, fontWeight: '800', color: '#111827' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '700' },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

    orderDetails: { gap: 6 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontSize: 13, color: '#6B7280' },
    detailValue: { fontSize: 13, color: '#374151', fontWeight: '500' },
    orderPrice: { fontSize: 15, fontWeight: '800', color: '#6366F1' },

    detailArrow: { marginTop: 12, alignItems: 'flex-end' },
    detailArrowText: { fontSize: 13, color: '#6366F1', fontWeight: '600' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 16, color: '#4B5563', fontWeight: '500', marginBottom: 20 },
    shopBtn: { backgroundColor: '#6366F1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    shopBtnText: { color: '#fff', fontWeight: 'bold' },
});
