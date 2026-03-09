import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const CartBadge = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { itemCount } = useSelector((state: RootState) => state.cart);

    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
        >
            <Text style={styles.icon}>🛒</Text>
            {itemCount > 0 && (
                <Badge 
                    size={18} 
                    style={styles.badge}
                >
                    {itemCount > 99 ? '99+' : itemCount}
                </Badge>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 5,
        marginRight: 10,
        position: 'relative',
    },
    icon: {
        fontSize: 22,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ef4444',
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CartBadge;
