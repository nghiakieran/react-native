import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, Image, TouchableOpacity,
    Alert, Animated, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { RootStackParamList } from '../navigation/types';
import { useGetProductByIdQuery } from '../services/api/productApi';
import { useAddToCartMutation } from '../services/api/cartApi';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setAddingProduct } from '../redux/slices/cartSlice';

type ProductDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route, navigation }: ProductDetailScreenProps) {
    const { productId } = route.params;
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { isAddingProductId } = useSelector((state: RootState) => state.cart);

    const { data: response, isLoading, error } = useGetProductByIdQuery(productId);
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

    const [quantity, setQuantity] = useState(1);
    const scaleAnim = new Animated.Value(1);

    const product = (response as any)?.data;

    const handleAddToCart = async () => {
        if (!product) return;
        dispatch(setAddingProduct(product.id));

        // Bounce animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        try {
            await addToCart({ productId: product.id, quantity }).unwrap();
            Alert.alert(
                '🛒 Đã thêm vào giỏ!',
                `${product.name} x${quantity} đã được thêm vào giỏ hàng.`,
                [
                    { text: 'Tiếp tục mua', style: 'cancel' },
                    { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
                ]
            );
        } catch (err: any) {
            Alert.alert('Lỗi', err?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            dispatch(setAddingProduct(null));
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            await addToCart({ productId: product.id, quantity }).unwrap();
            navigation.navigate('Cart');
        } catch (err: any) {
            Alert.alert('Lỗi', err?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tải được thông tin sản phẩm</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>← Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const discountedPrice = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : null;

    const isOutOfStock = product.stock === 0;
    const isThisAdding = isAddingProductId === product.id;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Fixed Header Back Button */}
            <View style={styles.fixedHeader}>
                <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Product Image */}
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Category + Stock */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                            <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                                {product.category}
                            </Text>
                        </View>
                        <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#FEE2E2' : '#DCFCE7' }]}>
                            <Text style={{ color: isOutOfStock ? '#DC2626' : '#16A34A', fontSize: 12, fontWeight: '600' }}>
                                {isOutOfStock ? '❌ Hết hàng' : `✅ Còn ${product.stock} sản phẩm`}
                            </Text>
                        </View>
                    </View>

                    {/* Name */}
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.mainPrice}>
                            {discountedPrice
                                ? `${Math.round(discountedPrice).toLocaleString('vi-VN')}đ`
                                : `${Number(product.price).toLocaleString('vi-VN')}đ`
                            }
                        </Text>
                        {discountedPrice && (
                            <>
                                <Text style={styles.originalPrice}>
                                    {Number(product.price).toLocaleString('vi-VN')}đ
                                </Text>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>-{product.discount}%</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.sectionLabel}>Số lượng</Text>
                        <View style={styles.quantityRow}>
                            <TouchableOpacity
                                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
                                onPress={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                disabled={quantity >= product.stock}
                            >
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.totalPriceHint}>
                                = {Math.round((discountedPrice ?? product.price) * quantity).toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.sectionLabel}>Mô tả sản phẩm</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{product.soldCount}</Text>
                            <Text style={styles.statLabel}>Đã bán</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{product.stock}</Text>
                            <Text style={styles.statLabel}>Còn lại</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{product.discount > 0 ? `${product.discount}%` : '0%'}</Text>
                            <Text style={styles.statLabel}>Giảm giá</Text>
                        </View>
                    </View>

                    <View style={{ height: 20 }} />
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addToCartBtn, isOutOfStock && styles.btnDisabled]}
                    onPress={handleAddToCart}
                    disabled={isOutOfStock || isThisAdding}
                    activeOpacity={0.85}
                >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'center' }}>
                        {isThisAdding
                            ? <ActivityIndicator size="small" color="white" />
                            : <Text style={styles.addToCartText}>🛒  Thêm vào giỏ</Text>
                        }
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buyNowBtn, isOutOfStock && styles.btnDisabled]}
                    onPress={handleBuyNow}
                    disabled={isOutOfStock}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buyNowText}>
                        {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
    backBtn: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    scrollContent: { paddingBottom: 100 },

    // Fixed Header
    fixedHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: 20,
        zIndex: 100,
    },
    backCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    backIcon: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    cartCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
    },
    cartIcon: { fontSize: 18 },

    // Image
    image: { width: '100%', height: 340, backgroundColor: '#E5E7EB' },

    // Content card
    contentCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -24, padding: 24,
        elevation: 8,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12,
    },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    categoryBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    categoryText: { fontSize: 12, fontWeight: '700' },
    stockBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },

    productName: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 30, marginBottom: 12 },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    mainPrice: { fontSize: 26, fontWeight: '900', color: '#6366F1' },
    originalPrice: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
    discountBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    discountText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

    // Quantity
    quantitySection: { marginBottom: 20 },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 10 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    qtyBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
    },
    qtyBtnDisabled: { backgroundColor: '#F3F4F6' },
    qtyBtnText: { fontSize: 20, fontWeight: '700', color: '#6366F1', lineHeight: 22 },
    qtyValue: { fontSize: 18, fontWeight: '800', color: '#111827', minWidth: 30, textAlign: 'center' },
    totalPriceHint: { fontSize: 14, color: '#6B7280', marginLeft: 8 },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
    description: { fontSize: 15, lineHeight: 24, color: '#4B5563', marginBottom: 20 },

    // Stats
    statsRow: {
        flexDirection: 'row', backgroundColor: '#F9FAFB',
        borderRadius: 16, padding: 16, justifyContent: 'space-around',
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    statDivider: { width: 1, backgroundColor: '#E5E7EB' },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12,
        padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
        elevation: 12,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    },
    addToCartBtn: {
        flex: 1, backgroundColor: '#EEF2FF', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center',
        borderWidth: 2, borderColor: '#6366F1',
    },
    addToCartText: { color: '#6366F1', fontWeight: '800', fontSize: 15 },
    buyNowBtn: {
        flex: 1, backgroundColor: '#6366F1', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center',
    },
    buyNowText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    btnDisabled: { opacity: 0.5 },
});
