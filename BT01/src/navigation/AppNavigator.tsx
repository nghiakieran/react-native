import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { loadUser } from '../redux/slices/authSlice';
import { RootStackParamList } from './types';

import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChangePhoneScreen from '../screens/ChangePhoneScreen';
import ChangeEmailScreen from '../screens/ChangeEmailScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {isAuthenticated ? (
                    user?.role === 'ADMIN' ? (
                        // Admin Stack
                        <>
                            <Stack.Screen
                                name="AdminHome"
                                component={AdminHomeScreen}
                                options={{ title: 'Admin Dashboard' }}
                            />
                        </>
                    ) : (
                        // User Stack
                        <>
                            <Stack.Screen
                                name="Home"
                                component={HomeScreen}
                                options={{
                                    headerShown: true,
                                    headerTitle: 'Home',
                                    headerBackVisible: false,
                                    headerStyle: { backgroundColor: '#6366f1' },
                                    headerTintColor: '#fff',
                                    headerTitleStyle: { fontWeight: 'bold' },
                                }}
                            />
                        </>
                    )
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Intro" component={IntroScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
                        <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                    </>
                )}

                {isAuthenticated && (
                    <Stack.Group screenOptions={{ presentation: 'card' }}>
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{ title: 'My Profile', headerShown: true }}
                        />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ title: 'Edit Profile', headerShown: true }}
                        />
                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{ title: 'Change Password', headerShown: true }}
                        />
                        <Stack.Screen
                            name="ChangePhone"
                            component={ChangePhoneScreen}
                            options={{ title: 'Change Phone', headerShown: true }}
                        />
                        <Stack.Screen
                            name="ChangeEmail"
                            component={ChangeEmailScreen}
                            options={{ title: 'Change Email', headerShown: true }}
                        />
                        <Stack.Screen
                            name="ProductDetail"
                            component={ProductDetailScreen}
                            options={{ headerShown: false }}
                        />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
