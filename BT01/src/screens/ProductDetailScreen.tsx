import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Title, Button, ActivityIndicator, Divider, useTheme, Paragraph } from 'react-native-paper';
import { RootStackParamList } from '../navigation/types';
import { useGetProductByIdQuery } from '../services/api/productApi';

type ProductDetailScreenProps = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ route, navigation }: ProductDetailScreenProps) {
    const { productId } = route.params;
    const theme = useTheme();
    const { data: response, isLoading, error } = useGetProductByIdQuery(productId);

    // Check if the response matches the ProductResponse structure (data field) or is direct
    // Based on previous API code, it returns { success: true, data: Product } or { success: true, count: N, data: Product[] }
    // getProductById controller returns { success: true, data: product }
    // but the types in productApi might need adjustment if it expects an array. 
    // Let's assume response.data is the product object directly or nested.

    // Actually, looking at productApi.ts, getProductById returns ProductResponse which has data: Product[].
    // BUT the backend controller returns a single object in `data`. 
    // I should probably fix the type in productApi.ts first or cast it here.
    // For now, let's treat it safely.
    // Wait, the backend controller: res.json({ success: true, data: product }); 
    // So data is a single object, not an array.

    const product = (response as any)?.data;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load product details.</Text>
                <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()}>Back</Button>
                </View>

                {/* Product Image */}
                <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Title style={styles.title}>{product.name}</Title>
                        <Title style={styles.price}>${product.price}</Title>
                    </View>

                    <View style={styles.chipContainer}>
                        <Text style={[styles.categoryChip, { backgroundColor: theme.colors.secondaryContainer }]}>
                            {product.category}
                        </Text>
                        <Text style={[styles.stockText, { color: product.stock > 0 ? 'green' : 'red' }]}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </Text>
                    </View>

                    <Divider style={styles.divider} />

                    <Title style={styles.subTitle}>Description</Title>
                    <Paragraph style={styles.description}>
                        {product.description}
                    </Paragraph>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    icon="cart"
                    style={styles.addToCartButton}
                    contentStyle={{ height: 50 }}
                    onPress={() => console.log('Add to cart')}
                >
                    Add to Cart
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginBottom: 20,
        fontSize: 16,
        color: 'red',
    },
    scrollContent: {
        paddingBottom: 80, // Space for footer
    },
    header: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
    },
    image: {
        width: '100%',
        height: 350,
    },
    content: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    chipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 10,
        fontSize: 12,
        fontWeight: 'bold',
    },
    stockText: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        marginVertical: 15,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
    },
    addToCartButton: {
        borderRadius: 8,
    },
});
