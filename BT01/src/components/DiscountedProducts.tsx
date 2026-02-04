import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetDiscountedProductsQuery } from '../services/api/productApi';

interface DiscountedProductsProps {
    onProductPress: (productId: number) => void;
}

const { width } = Dimensions.get('window');
const SPACING = 12;
const CARD_WIDTH = (width - SPACING * 3) / 2;

export default function DiscountedProducts({ onProductPress }: DiscountedProductsProps) {
    const theme = useTheme();
    const { data, isLoading, error } = useGetDiscountedProductsQuery(20);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (error || !data?.data || data.data.length === 0) {
        return null;
    }

    const products = data.data;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⚡ Siêu giảm giá</Text>
                <Text style={styles.subtitle}>Săn deal hot giá cực tốt</Text>
            </View>

            <View style={styles.grid}>
                {products.map((product) => {
                    const discountedPrice = (product.price * (1 - product.discount / 100)).toFixed(2);

                    return (
                        <TouchableOpacity
                            key={product.id}
                            onPress={() => onProductPress(product.id)}
                            activeOpacity={0.7}
                            style={styles.cardWrapper}
                        >
                            <Card style={styles.card}>
                                <View style={styles.imageContainer}>
                                    <Card.Cover
                                        source={{ uri: product.imageUrl }}
                                        style={styles.cardImage}
                                    />
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-{product.discount}%</Text>
                                    </View>
                                </View>

                                <Card.Content style={styles.cardContent}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product.name}
                                    </Text>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.discountedPrice}>${discountedPrice}</Text>
                                        <Text style={styles.originalPrice}>${product.price}</Text>
                                    </View>

                                    {product.soldCount > 0 && (
                                        <Text style={styles.soldText}>Đã bán {product.soldCount}</Text>
                                    )}
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING,
        gap: SPACING,
    },
    cardWrapper: {
        width: CARD_WIDTH,
        marginBottom: SPACING,
    },
    card: {
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    imageContainer: {
        position: 'relative',
    },
    cardImage: {
        height: 160,
        backgroundColor: '#f0f0f0',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#d32f2f',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardContent: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
        height: 40,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    discountedPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    soldText: {
        fontSize: 11,
        color: '#757575',
    },
});
