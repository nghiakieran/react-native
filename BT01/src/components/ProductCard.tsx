import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, Button } from 'react-native-paper';
import { Product } from '../services/api/productApi';

interface ProductCardProps {
    product: Product;
    onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Cover source={{ uri: product.imageUrl }} style={styles.image} />
            <Card.Content style={styles.content}>
                <Title numberOfLines={1}>{product.name}</Title>
                <Paragraph numberOfLines={2} style={styles.description}>{product.description}</Paragraph>
                <Text style={styles.price}>${product.price}</Text>
            </Card.Content>
            <Card.Actions>
                <Button mode="contained">Add to Cart</Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        elevation: 4,
    },
    image: {
        height: 200,
    },
    content: {
        marginTop: 10,
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginVertical: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6200ee',
        marginTop: 5,
    },
});

export default ProductCard;
