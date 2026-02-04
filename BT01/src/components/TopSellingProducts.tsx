import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useGetTopSellingProductsQuery } from '../services/api/productApi';

interface TopSellingProductsProps {
    onProductPress: (productId: number) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = 150;

export default function TopSellingProducts({ onProductPress }: TopSellingProductsProps) {
    const { data, isLoading, error } = useGetTopSellingProductsQuery(10);

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
                <Text style={styles.title}>Sản phẩm bán chạy</Text>
                <Text style={styles.subtitle}>Top {products.length} sản phẩm được yêu thích nhất</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
            >
                {products.map((product, index) => (
                    <TouchableOpacity
                        key={product.id}
                        onPress={() => onProductPress(product.id)}
                        activeOpacity={0.7}
                        style={styles.cardWrapper}
                    >
                        <Card style={styles.card}>
                            <Card.Cover
                                source={{ uri: product.imageUrl }}
                                style={styles.cardImage}
                            />
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>#{index + 1}</Text>
                            </View>
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {product.name}
                                </Text>
                                <Text style={styles.price}>${product.price}</Text>
                                <View style={styles.soldInfo}>
                                    <Text style={styles.soldText}>
                                        ✓ Đã bán {product.soldCount}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        backgroundColor: '#fff',
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
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    scrollContent: {
        paddingHorizontal: 12,
    },
    cardWrapper: {
        marginHorizontal: 6,
    },
    card: {
        width: CARD_WIDTH,
        elevation: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardImage: {
        height: 150,
        backgroundColor: '#f5f5f5',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#ff6b6b',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        paddingTop: 8,
        paddingBottom: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        height: 36,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    soldInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    soldText: {
        fontSize: 12,
        color: '#666',
    },
});
