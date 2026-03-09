import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Text, useTheme, Searchbar, ActivityIndicator, Title } from 'react-native-paper';
import { RootState, AppDispatch } from '../redux/store';
import { loadUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';
import { BASE_URL } from '../config';
import { useGetProductsQuery } from '../services/api/productApi';
import { useAddToCartMutation } from '../services/api/cartApi';
import { Snackbar } from 'react-native-paper';
import ProductCard from '../components/ProductCard';
import CategorySlider from '../components/CategorySlider';
import TopSellingProducts from '../components/TopSellingProducts';
import DiscountedProducts from '../components/DiscountedProducts';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route, navigation }: HomeScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const user = reduxUser || route.params?.user;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [addToCart] = useAddToCartMutation();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Products with pagination
  const { data: productData, isLoading, isFetching, refetch } = useGetProductsQuery({
    q: debouncedSearch,
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    page: page,
    limit: 10,
  });

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([dispatch(loadUser()), refetch()]);
    setRefreshing(false);
  }, [dispatch, refetch]);

  const handleLoadMore = () => {
    if (
      !isFetching && 
      productData?.pagination && 
      productData.pagination.currentPage < productData.pagination.totalPages
    ) {
      setIsFetchingMore(true);
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!isFetching) {
      setIsFetchingMore(false);
    }
  }, [isFetching]);

  const handleQuickAddToCart = async (product: any) => {
    if (product.stock === 0) {
      setSnackbarMessage(`Sản phẩm "${product.name}" đã hết hàng!`);
      setSnackbarVisible(true);
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
      setSnackbarMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
      setSnackbarVisible(true);
    } catch (err: any) {
      const msg = err?.data?.message || 'Không thể thêm vào giỏ hàng';
      setSnackbarMessage(`Lỗi: ${msg}`);
      setSnackbarVisible(true);
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  const getAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${BASE_URL}${avatarPath}`;
  };

  // 1. Header Top (Welcome + Avatar) - Scrolls away
  const renderHeaderTop = () => (
    <View style={[styles.headerTopContainer, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerTopContent}>
        <View>
          <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
          <Title style={styles.nameText}>{user?.name || 'Người dùng'}</Title>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user?.avatar ? (
            <Avatar.Image
              size={50}
              source={{ uri: getAvatarUrl(user.avatar)! }}
              style={{ backgroundColor: theme.colors.secondary || '#ff9800' }}
            />
          ) : (
            <Avatar.Text
              size={50}
              label={getInitials(user?.name)}
              style={{ backgroundColor: theme.colors.secondary || '#ff9800' }}
              color="white"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // 2. Search & Filter Widget - Sticky
  const renderSearchAndFilter = () => (
    <View style={styles.stickyHeaderContainer}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.primary }]}>
        <Searchbar
          placeholder="Tìm kiếm quần áo..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }}
          mode="bar"
        />
      </View>

      {/* Categories Slider */}
      <CategorySlider
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Prepare data
  const products = productData?.data || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['right', 'bottom', 'left']}
    >
      {/* Fixed Header Section */}
      <View style={styles.fixedHeaderContainer}>
        {renderHeaderTop()}
        {renderSearchAndFilter()}
      </View>

      {/* Scrollable Product List */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} 
              onAddToCart={() => handleQuickAddToCart(item)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {(!debouncedSearch && selectedCategory === 'All') ? (
              <>
                <TopSellingProducts
                  onProductPress={(productId) => navigation.navigate('ProductDetail', { productId })}
                />
                <View style={{ height: 10 }} />
                <DiscountedProducts
                  onProductPress={(productId) => navigation.navigate('ProductDetail', { productId })}
                />
                <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tất cả sản phẩm</Text>
                </View>
              </>
            ) : (
              <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                  {debouncedSearch ? `Kết quả cho "${debouncedSearch}"` : `Danh mục: ${selectedCategory}`}
                </Text>
              </View>
            )}
          </>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading && page === 1 ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text>Không tìm thấy sản phẩm nào</Text>
            </View>
          )
        }
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Xem giỏ',
          onPress: () => navigation.navigate('Cart'),
        }}
        style={{ marginBottom: 20 }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  fixedHeaderContainer: {
    backgroundColor: '#fff',
    elevation: 4,
    zIndex: 1000,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 5,
  },
  headerTopContainer: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  headerTopContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  stickyHeaderContainer: {
    backgroundColor: 'transparent',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    borderRadius: 8,
    backgroundColor: 'white',
    height: 45,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
