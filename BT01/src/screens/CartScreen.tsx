import React, { useEffect } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    Alert, Image, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { setItemCount } from '../redux/slices/cartSlice';
import {
    useGetCartQuery,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    CartItem,
} from '../services/api/cartApi';
import { RootStackParamList } from '../navigation/types';

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: CartScreenProps) {
    const dispatch = useDispatch<AppDispatch>();

    const { data: cartData, isLoading, refetch } = useGetCartQuery();
    const [updateItem] = useUpdateCartItemMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveFromCartMutation();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

    const cartItems = cartData?.data || [];
    const subtotal = cartData?.subtotal || 0;
    const totalItems = cartData?.totalItems || 0;

    // Cập nhật badge count
    useEffect(() => {
        dispatch(setItemCount(totalItems));
    }, [totalItems, dispatch]);

    const handleUpdateQty = async (item: CartItem, delta: number) => {
        const newQty = item.quantity + delta;
        if (newQty < 1) return;
        if (newQty > item.product.stock) {
            Alert.alert('Hết hàng', `Chỉ còn ${item.product.stock} sản phẩm trong kho`);
            return;
        }
        try {
            await updateItem({ id: item.id, quantity: newQty }).unwrap();
        } catch (err: any) {
            Alert.alert('Lỗi', err?.data?.message || 'Không thể cập nhật số lượng');
        }
    };

    const handleRemove = (item: CartItem) => {
        Alert.alert(
            'Xóa sản phẩm',
            `Bạn có chắc muốn xóa "${item.product.name}" khỏi giỏ hàng?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeItem(item.id).unwrap();
                        } catch (err: any) {
                            Alert.alert('Lỗi', err?.data?.message || 'Không thể xóa sản phẩm');
                        }
                    },
                },
            ]
        );
    };

    const handleClearCart = () => {
        if (cartItems.length === 0) return;
        Alert.alert(
            '🗑️ Xóa toàn bộ',
            'Bạn có chắc muốn xóa toàn bộ giỏ hàng?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tất cả', style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCart().unwrap();
                        } catch (err: any) {
                            Alert.alert('Lỗi', err?.data?.message || 'Không thể xóa giỏ hàng');
                        }
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        navigation.navigate('Checkout');
    };

    // ─── Render Cart Item ───────────────────────────────────────────────────────
    const renderItem = ({ item }: { item: CartItem }) => {
        const product = item.product;
        const itemPrice = product.discount > 0
            ? product.price * (1 - product.discount / 100)
            : product.price;
        const itemTotal = Math.round(itemPrice * item.quantity);

        return (
            <View style={styles.cartItemCard}>
                {/* Product Image */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                >
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                </TouchableOpacity>

                <View style={styles.itemContent}>
                    {/* Name + Remove */}
                    <View style={styles.itemHeader}>
                        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                        <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.removeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>
                            {Math.round(itemPrice).toLocaleString('vi-VN')}đ
                        </Text>
                        {product.discount > 0 && (
                            <Text style={styles.originalPrice}>
                                {Number(product.price).toLocaleString('vi-VN')}đ
                            </Text>
                        )}
                        {product.discount > 0 && (
                            <View style={styles.discountTag}>
                                <Text style={styles.discountTagText}>-{product.discount}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Quantity + Total */}
                    <View style={styles.qtyRow}>
                        <View style={styles.qtyControls}>
                            <TouchableOpacity
                                style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
                                onPress={() => handleUpdateQty(item, -1)}
                                disabled={item.quantity <= 1}
                            >
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{item.quantity}</Text>
                            <TouchableOpacity
                                style={[styles.qtyBtn, item.quantity >= product.stock && styles.qtyBtnDisabled]}
                                onPress={() => handleUpdateQty(item, 1)}
                                disabled={item.quantity >= product.stock}
                            >
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.itemTotal}>
                            {itemTotal.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // ─── Empty Cart ─────────────────────────────────────────────────────────────
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ để tiến hành mua sắm</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home', {})}>
                <Text style={styles.shopNowText}>Mua sắm ngay</Text>
            </TouchableOpacity>
        </View>
    );

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải giỏ hàng...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ hàng ({totalItems})</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={handleClearCart} disabled={isClearing}>
                        <Text style={styles.clearText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Cart Items List */}
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    cartItems.length === 0 && styles.listEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                onRefresh={refetch}
                refreshing={isLoading}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />

            {/* Order Summary + Checkout */}
            {cartItems.length > 0 && (
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính ({totalItems} sản phẩm)</Text>
                        <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                        <Text style={[styles.summaryValue, { color: '#10B981' }]}>Miễn phí</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={handleCheckout}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.checkoutText}>
                            Đặt hàng  →
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
        elevation: 2,
    },
    backBtn: { padding: 4 },
    backText: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    clearText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },

    // List
    listContent: { padding: 16 },
    listEmpty: { flex: 1 },

    // Cart item card
    cartItemCard: {
        backgroundColor: '#fff', borderRadius: 18,
        flexDirection: 'row', padding: 14,
        elevation: 3,
        shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    },
    productImage: {
        width: 90, height: 90, borderRadius: 14, backgroundColor: '#F3F4F6',
    },
    itemContent: { flex: 1, marginLeft: 12 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    productName: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8, lineHeight: 20 },
    removeBtn: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 10 },
    itemPrice: { fontSize: 16, fontWeight: '800', color: '#6366F1' },
    originalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
    discountTag: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    discountTagText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },

    qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
    },
    qtyBtnDisabled: { backgroundColor: '#F3F4F6' },
    qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#6366F1', lineHeight: 20 },
    qtyValue: { fontSize: 16, fontWeight: '800', color: '#111827', minWidth: 24, textAlign: 'center' },
    itemTotal: { fontSize: 15, fontWeight: '800', color: '#111827' },

    // Empty
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
    emptyIcon: { fontSize: 72, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22, marginBottom: 28 },
    shopNowBtn: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
    shopNowText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Summary
    summaryContainer: {
        backgroundColor: '#fff', padding: 20,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        elevation: 16,
        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    summaryLabel: { fontSize: 14, color: '#6B7280' },
    summaryValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
    totalLabel: { fontSize: 17, fontWeight: '800', color: '#111827' },
    totalValue: { fontSize: 22, fontWeight: '900', color: '#6366F1' },
    checkoutBtn: {
        backgroundColor: '#6366F1', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center', marginTop: 14,
    },
    checkoutText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
});
