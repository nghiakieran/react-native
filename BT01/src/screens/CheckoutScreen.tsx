import React, { useState } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import { useGetCartQuery } from '../services/api/cartApi';
import { useCreateOrderMutation } from '../services/api/orderApi';
import { RootStackParamList } from '../navigation/types';
import { useDispatch } from 'react-redux';
import { clearSelectedItems, setItemCount } from '../redux/slices/cartSlice';
import { cartApi } from '../services/api/cartApi';
import { productApi } from '../services/api/productApi';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: CheckoutScreenProps) {
    const dispatch = useDispatch();
    const { data: cartData } = useGetCartQuery();
    const [createOrder, { isLoading }] = useCreateOrderMutation();

    const cartItems = cartData?.data || [];
    const subtotal = cartData?.subtotal || 0;
    const shippingFee = 0; // Free shipping
    const totalAmount = subtotal + shippingFee;

    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');

    const handlePlaceOrder = async () => {
        if (!address.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        try {
            const res = await createOrder({
                shippingAddress: address.trim(),
                note: note.trim() || undefined,
            }).unwrap();

            dispatch(clearSelectedItems());
            dispatch(setItemCount(0));
            dispatch(cartApi.util.invalidateTags(['Cart']));
            dispatch(productApi.util.invalidateTags(['Product']));

            Alert.alert(
                '🎉 Đặt hàng thành công!',
                'Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.',
                [
                    {
                        text: 'Trang chủ',
                        style: 'cancel',
                        onPress: () => navigation.navigate('Home', {})
                    },
                    {
                        text: 'Xem đơn hàng',
                        onPress: () => {
                            // Chuyển sang stack Home rồi sang OrderList (nếu có thể)
                            // Tạm thời push thẳng sang OrderList
                            navigation.replace('OrderList');
                        }
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        }
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Giỏ hàng của bạn đang trống.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.btnText}>← Quay lại giỏ hàng</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thanh toán</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Information Section */}
                    <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                    <View style={styles.card}>
                        <TextInput
                            label="Địa chỉ nhận hàng *"
                            value={address}
                            onChangeText={setAddress}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                            outlineColor="#E5E7EB"
                            activeOutlineColor="#6366F1"
                            style={styles.input}
                        />
                        <TextInput
                            label="Ghi chú đơn hàng (Tùy chọn)"
                            value={note}
                            onChangeText={setNote}
                            mode="outlined"
                            multiline
                            numberOfLines={2}
                            placeholder="Chỉ dẫn giao hàng, thời gian nhận..."
                            outlineColor="#E5E7EB"
                            activeOutlineColor="#6366F1"
                            style={styles.input}
                        />
                    </View>

                    {/* Payment Method */}
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <View style={styles.card}>
                        <View style={styles.paymentMethod}>
                            <View style={[styles.radioBtn, styles.radioBtnActive]}>
                                <View style={styles.radioInner} />
                            </View>
                            <View style={styles.paymentMethodText}>
                                <Text style={styles.paymentMethodTitle}>Thanh toán tiền mặt (COD)</Text>
                                <Text style={styles.paymentMethodDesc}>Thanh toán khi nhận hàng</Text>
                            </View>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <Text style={styles.sectionTitle}>Tóm tắt đơn hàng ({cartItems.length} sản phẩm)</Text>
                    <View style={styles.card}>
                        {cartItems.map(item => (
                            <View key={item.id} style={styles.summaryItem}>
                                <Text style={styles.summaryItemQty}>x{item.quantity}</Text>
                                <Text style={styles.summaryItemName} numberOfLines={1}>{item.product.name}</Text>
                                <Text style={styles.summaryItemPrice}>
                                    {Math.round(item.product.price * (1 - item.product.discount / 100) * item.quantity).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        ))}

                        <Divider style={{ marginVertical: 12 }} />

                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Tổng tiền hàng:</Text>
                            <Text style={styles.calcValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Phí vận chuyển:</Text>
                            <Text style={styles.calcValue}>0đ</Text>
                        </View>
                        <View style={[styles.calcRow, { marginTop: 8 }]}>
                            <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
                            <Text style={styles.finalTotalValue}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Bottom Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerLabel}>Tổng thanh toán</Text>
                        <Text style={styles.footerPrice}>{totalAmount.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.placeOrderBtn, isLoading && { opacity: 0.7 }]}
                        onPress={handlePlaceOrder}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.placeOrderText}>Đặt hàng</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
    errorText: { fontSize: 16, color: '#4B5563', marginBottom: 20 },
    backBtn: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: 'bold' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    backBtnWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    backIcon: { fontSize: 24, color: '#111827', fontWeight: '700' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    content: { flex: 1, padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 8, marginTop: 12, textTransform: 'uppercase' },

    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    input: { backgroundColor: '#fff', marginBottom: 12, fontSize: 14 },

    paymentMethod: { flexDirection: 'row', alignItems: 'center' },
    radioBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    radioBtnActive: { borderColor: '#6366F1' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
    paymentMethodText: { flex: 1 },
    paymentMethodTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    paymentMethodDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    summaryItemQty: { fontSize: 14, fontWeight: '600', color: '#6366F1', width: 30 },
    summaryItemName: { flex: 1, fontSize: 14, color: '#374151', paddingRight: 10 },
    summaryItemPrice: { fontSize: 14, fontWeight: '600', color: '#111827' },

    calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    calcLabel: { fontSize: 14, color: '#6B7280' },
    calcValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
    finalTotalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
    finalTotalValue: { fontSize: 18, fontWeight: '800', color: '#6366F1' },

    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 12,
    },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
    footerPrice: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
    placeOrderBtn: { backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, minWidth: 140, alignItems: 'center' },
    placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
