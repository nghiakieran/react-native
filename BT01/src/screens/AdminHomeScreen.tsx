import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Paragraph, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';

export default function AdminHomeScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Admin Dashboard</Title>
                    <Paragraph style={styles.text}>Welcome, {user?.name}!</Paragraph>
                    <Paragraph style={styles.roleText}>Role: {user?.role}</Paragraph>
                    <Paragraph style={styles.description}>
                        This is a protected area for Administrators only.
                    </Paragraph>
                </Card.Content>
                <Card.Actions style={styles.actions}>
                    <Button mode="contained" onPress={handleLogout} color="#d32f2f">
                        Logout
                    </Button>
                </Card.Actions>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        elevation: 4,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 4,
        textAlign: 'center',
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        color: '#666',
    },
    actions: {
        justifyContent: 'center',
        marginTop: 16,
    },
});
