import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton, useTheme, Chip, Menu, Divider, Button, Portal } from 'react-native-paper';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, OrderStatus } from '../services/api/orderApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminOrderManager'>;

const StatusActionMenu = ({
    currentStatus,
    orderId,
    onUpdateStatus
}: {
    currentStatus: OrderStatus,
    orderId: number,
    onUpdateStatus: (id: number, status: OrderStatus) => void
}) => {
    const handlePress = () => {
        const availableStatuses: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

        Alert.alert(
            'Cập nhật trạng thái',
            `Chọn trạng thái mới cho đơn hàng #${orderId}:`,
            [
                ...availableStatuses.map(status => ({
                    text: ORDER_STATUS_LABEL[status],
                    onPress: () => onUpdateStatus(orderId, status),
                    style: status === 'CANCELLED' ? 'destructive' as const : 'default' as const
                })),
                { text: 'Hủy bỏ', style: 'cancel' as const }
            ]
        );
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.statusChip, { backgroundColor: ORDER_STATUS_COLOR[currentStatus] }]}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
            <Text style={styles.statusText}>{ORDER_STATUS_LABEL[currentStatus]}</Text>
        </TouchableOpacity>
    );
};

export default function AdminOrderManagerScreen({ navigation }: Props) {
    const theme = useTheme();
    const { data: orderData, isLoading, refetch, isError, error } = useGetAllOrdersQuery();
    const [updateStatus] = useUpdateOrderStatusMutation();

    const orders = orderData?.data || [];

    React.useEffect(() => {
        if (isError) {
            console.error('[AdminOrder] Load error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng. Vui lòng kiểm tra lại quyền truy cập.');
        }
    }, [isError, error]);

    const handleBack = () => navigation.goBack();

    const handleUpdateStatus = async (id: number, status: OrderStatus) => {
        try {
            await updateStatus({ id, status }).unwrap();
            Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
        } catch (error: any) {
            Alert.alert('Lỗi', error.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const renderOrderItem = ({ item }: { item: any }) => {
        const createdAt = new Date(item.createdAt).getTime();
        const elapsedMinutes = (Date.now() - createdAt) / 60000;
        const isWithinCancelWindow = elapsedMinutes < 30;

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.orderHeader}>
                        <TouchableOpacity 
                            style={styles.headerInfo} 
                            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                            {item.status === 'NEW' && isWithinCancelWindow && (
                                <Text style={styles.waitLabel}>⚠️ Chờ khách hủy (còn {Math.ceil(30 - elapsedMinutes)}p)</Text>
                            )}
                        </TouchableOpacity>
                        <StatusActionMenu 
                            currentStatus={item.status} 
                            orderId={item.id} 
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </View>
                    
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                        activeOpacity={0.6}
                    >
                        <View style={styles.orderMeta}>
                            <Text style={styles.metaLabel}>Khách hàng:</Text>
                            <Text style={styles.metaValue}>{item.user?.name || 'Khách vãng lai'}</Text>
                        </View>

                        <View style={styles.orderMeta}>
                            <Text style={styles.metaLabel}>Ngày đặt:</Text>
                            <Text style={styles.metaValue}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                        </View>
                    </TouchableOpacity>

                    <Divider style={styles.divider} />

                    <View style={styles.orderTotal}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                            activeOpacity={0.6}
                            style={{ flex: 1 }}
                        >
                            <Text style={styles.totalLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalValue}>{Number(item.totalAmount).toLocaleString('vi-VN')}đ</Text>
                        </TouchableOpacity>
                        
                        {item.status === 'NEW' && (
                            <Button 
                                mode="contained" 
                                compact 
                                onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                                style={styles.confirmBtn}
                            >
                                Xác nhận ngay
                            </Button>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
                <IconButton icon="refresh" onPress={() => refetch()} />
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text>Chưa có đơn hàng nào</Text>
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
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    orderMeta: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        fontSize: 14,
        color: '#6B7280',
        width: 100,
    },
    metaValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    divider: {
        marginVertical: 12,
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#6366F1',
    },
    emptyState: { alignItems: 'center', marginTop: 40 },
    waitLabel: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '700',
        marginTop: 4,
    },
    confirmBtn: {
        borderRadius: 8,
        backgroundColor: '#6366F1',
    }
});
