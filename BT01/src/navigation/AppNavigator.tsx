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
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import RecentViewsScreen from '../screens/RecentViewsScreen';
import AdminProductManagerScreen from '../screens/AdminProductManagerScreen';
import AdminCategoryManagerScreen from '../screens/AdminCategoryManagerScreen';
import AdminOrderManagerScreen from '../screens/AdminOrderManagerScreen';
import AdminUserManagerScreen from '../screens/AdminUserManagerScreen';
import CartBadge from '../components/CartBadge';

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
                            <Stack.Screen
                                name="AdminProductManager"
                                component={AdminProductManagerScreen}
                                options={{ title: 'Quản lý Sản phẩm' }}
                            />
                            <Stack.Screen
                                name="AdminCategoryManager"
                                component={AdminCategoryManagerScreen}
                                options={{ title: 'Quản lý Danh mục' }}
                            />
                            <Stack.Screen
                                name="AdminOrderManager"
                                component={AdminOrderManagerScreen}
                                options={{ title: 'Quản lý Đơn hàng' }}
                            />
                            <Stack.Screen
                                name="AdminUserManager"
                                component={AdminUserManagerScreen}
                                options={{ title: 'Quản lý Người dùng' }}
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
                                    headerTitle: 'Trang chủ',
                                    headerBackVisible: false,
                                    headerStyle: { backgroundColor: '#6366f1' },
                                    headerTintColor: '#fff',
                                    headerTitleStyle: { fontWeight: 'bold' },
                                    headerRight: () => <CartBadge />,
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
                            options={{ title: 'Hồ sơ của tôi', headerShown: false }}
                        />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ title: 'Chỉnh sửa hồ sơ', headerShown: false }}
                        />
                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{ title: 'Đổi mật khẩu', headerShown: false }}
                        />
                        <Stack.Screen
                            name="ChangePhone"
                            component={ChangePhoneScreen}
                            options={{ title: 'Đổi số điện thoại', headerShown: false }}
                        />
                        <Stack.Screen
                            name="ChangeEmail"
                            component={ChangeEmailScreen}
                            options={{ title: 'Đổi email', headerShown: false }}
                        />
                        <Stack.Screen
                            name="ProductDetail"
                            component={ProductDetailScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Cart"
                            component={CartScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Checkout"
                            component={CheckoutScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="OrderList"
                            component={OrderListScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="OrderDetail"
                            component={OrderDetailScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Favorites"
                            component={FavoritesScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="RecentViews"
                            component={RecentViewsScreen}
                            options={{ headerShown: false }}
                        />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
