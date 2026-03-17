import React, { useState } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, Divider } from 'react-native-paper';
import { RootStackParamList } from '../navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
    useGetOrderByIdQuery,
    useCancelOrderMutation,
    ORDER_STATUS_LABEL,
    ORDER_STATUS_COLOR,
    OrderStatus,
} from '../services/api/orderApi';
import { format } from 'date-fns';

type OrderDetailProps = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route, navigation }: OrderDetailProps) {
    const { orderId } = route.params;
    const { data: response, isLoading, refetch } = useGetOrderByIdQuery(orderId);
    const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === 'ADMIN';

    const order = response?.data;
    const cancelInfo = response?.cancelInfo;

    const handleCancelPress = () => {
        if (!cancelInfo) return;

        let title = 'Hủy đơn hàng';
        let message = 'Bạn có chắc chắn muốn hủy đơn hàng này?';
        let btnText = 'Xác nhận hủy';

        if (cancelInfo.canRequestCancel) {
            title = 'Yêu cầu hủy đơn';
            message = 'Đơn hàng đang được chuẩn bị. Bạn có muốn gửi yêu cầu hủy đến shop không? (Shop sẽ xem xét)';
            btnText = 'Gửi yêu cầu hủy';
        }

        Alert.alert(title, message, [
            { text: 'Bỏ qua', style: 'cancel' },
            {
                text: btnText,
                style: 'destructive',
                onPress: async () => {
                    try {
                        const cancelReason = isAdmin ? 'Admin hủy đơn' : 'Người dùng hủy';
                        const res = await cancelOrder({ id: orderId, reason: cancelReason }).unwrap();
                        Alert.alert('Thành công', res.message);
                        refetch();
                    } catch (err: any) {
                        Alert.alert('Lỗi', err?.data?.message || 'Không thể hủy đơn hàng');
                    }
                }
            }
        ]);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff' }}>Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusColor = ORDER_STATUS_COLOR[order.status] || '#6B7280';

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Status Bar */}
                <View style={[styles.statusSection, { backgroundColor: `${statusColor}15` }]}>
                    <View style={styles.statusHeader}>
                        <Text style={[styles.statusLabel, { color: statusColor }]}>
                            {ORDER_STATUS_LABEL[order.status].toUpperCase()}
                        </Text>
                        <Text style={styles.orderId}>Mã ĐH: #{order.id}</Text>
                    </View>
                    <Text style={styles.statusDate}>
                        Đặt lúc: {format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy')}
                    </Text>
                    {order.status === 'CANCELLED' && order.cancelReason && (
                        <Text style={styles.cancelReason}>Lý do hủy: {order.cancelReason}</Text>
                    )}
                </View>

                {/* Cancel Notice / Actions */}
                {cancelInfo?.canCancelDirectly && (
                    <View style={styles.cancelNotice}>
                        <Text style={styles.cancelNoticeText}>
                            Bạn có thể hủy trực tiếp trong vòng <Text style={{ fontWeight: '800' }}>{cancelInfo.remainingCancelMinutes} phút</Text> nữa.
                        </Text>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelPress} disabled={isCanceling}>
                            {isCanceling ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.cancelBtnText}>Hủy Đơn Hàng</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {cancelInfo?.canRequestCancel && (
                    <View style={styles.cancelNoticeWarn}>
                        <Text style={styles.cancelNoticeTextWarn}>
                            Đơn hàng đang được chuẩn bị. Bạn chỉ có thể gửi yêu cầu hủy.
                        </Text>
                        <TouchableOpacity style={styles.cancelBtnWarn} onPress={handleCancelPress} disabled={isCanceling}>
                            {isCanceling ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.cancelBtnText}>Gửi yêu cầu hủy</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Delivery Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
                    <Divider style={styles.cardDivider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoText}>{order.shippingAddress}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>💳</Text>
                        <Text style={styles.infoText}>Thanh toán: Tiền mặt (COD)</Text>
                    </View>
                    {order.note ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoIcon}>📝</Text>
                            <Text style={styles.infoText}>Ghi chú: {order.note}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Items List */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Sản phẩm ({order.items.length})</Text>
                    <Divider style={styles.cardDivider} />
                    {order.items.map((item, idx) => (
                        <View key={item.id}>
                            <View style={styles.productRow}>
                                <Image
                                    source={{ uri: item.productImage || 'https://via.placeholder.com/80' }}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {item.productName}
                                    </Text>
                                    <View style={styles.productPriceRow}>
                                        <Text style={styles.productPrice}>
                                            {Math.round(item.price * (1 - item.discount / 100)).toLocaleString('vi-VN')}đ
                                        </Text>
                                        <Text style={styles.productQty}>x{item.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                            {idx < order.items.length - 1 && <Divider style={{ marginVertical: 12, borderStyle: 'dotted' }} />}
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Tóm tắt hóa đơn</Text>
                    <Divider style={styles.cardDivider} />
                    {order.pricing ? (
                        <>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                                <Text style={styles.summaryValue}>
                                    {Number(order.pricing.subtotal).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            {!!order.pricing.couponCode && Number(order.pricing.couponDiscount) > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Mã ({order.pricing.couponCode}):</Text>
                                    <Text style={styles.summaryValue}>
                                        -{Number(order.pricing.couponDiscount).toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            )}
                            {Number(order.pricing.pointsUsed) > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Dùng điểm:</Text>
                                    <Text style={styles.summaryValue}>
                                        -{Number(order.pricing.pointsUsed).toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
                                <Text style={styles.summaryValue}>0đ</Text>
                            </View>
                            <Divider style={styles.cardDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                                <Text style={styles.totalValue}>
                                    {Number(order.pricing.finalTotal).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </>
                    ) : (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tiền hàng:</Text>
                        <Text style={styles.summaryValue}>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.summaryValue}>0đ</Text>
                    </View>
                    <Divider style={styles.cardDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                        <Text style={styles.totalValue}>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</Text>
                    </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
    backBtn: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    headerBack: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, fontWeight: '700', color: '#111827' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    scrollContent: { padding: 16 },

    statusSection: { padding: 20, borderRadius: 16, marginBottom: 16 },
    statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    statusLabel: { fontSize: 18, fontWeight: '900' },
    orderId: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
    statusDate: { fontSize: 13, color: '#6B7280' },
    cancelReason: { fontSize: 13, color: '#DC2626', marginTop: 8, fontWeight: '500', backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },

    cancelNotice: { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
    cancelNoticeText: { fontSize: 13, color: '#4F46E5', textAlign: 'center', marginBottom: 12 },
    cancelBtn: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },
    cancelBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    cancelNoticeWarn: { backgroundColor: '#FFFBEB', padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
    cancelNoticeTextWarn: { fontSize: 13, color: '#D97706', textAlign: 'center', marginBottom: 12 },
    cancelBtnWarn: { backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
    cardDivider: { marginVertical: 12, backgroundColor: '#F3F4F6' },

    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    infoIcon: { fontSize: 16, marginRight: 12, marginTop: 2 },
    infoText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },

    productRow: { flexDirection: 'row' },
    productImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F3F4F6' },
    productInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    productName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 6 },
    productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productPrice: { fontSize: 14, fontWeight: '800', color: '#111827' },
    productQty: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#6B7280' },
    summaryValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#6366F1' },
});
