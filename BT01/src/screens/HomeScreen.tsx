import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Text, useTheme, Searchbar, Chip, ActivityIndicator, Title } from 'react-native-paper';
import { RootState, AppDispatch } from '../redux/store';
import { loadUser } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/types';
import { BASE_URL } from '../config';
import { useGetProductsQuery } from '../services/api/productApi';
import ProductCard from '../components/ProductCard';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const CATEGORIES = ["All", "T-Shirts", "Pants", "Hoodies", "Dresses", "Shoes", "Jackets", "Shorts", "Accessories"];

export default function HomeScreen({ route, navigation }: HomeScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const user = reduxUser || route.params?.user;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Products
  const { data: productData, isLoading, refetch } = useGetProductsQuery({
    q: searchQuery,
    category: selectedCategory === 'All' ? undefined : selectedCategory,
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(loadUser()), refetch()]);
    setRefreshing(false);
  }, [dispatch, refetch]);

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
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Title style={styles.nameText}>{user?.name || 'User'}</Title>
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
          placeholder="Search clothes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }}
          mode="bar"
        />
      </View>

      {/* Categories Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              mode="outlined"
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.chip, selectedCategory === cat && { backgroundColor: theme.colors.primaryContainer }]}
              showSelectedOverlay
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  // Prepare data (just products now)
  const products = productData?.data || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f0f2f5' }]}>
      {/* Fixed Header Section */}
      <View style={styles.fixedHeaderContainer}>
        {renderHeaderTop()}
        {renderSearchAndFilter()}
      </View>

      {/* Scrollable Product List */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}

        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !isLoading && products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text>No products found.</Text>
            </View>
          ) : isLoading && products.length === 0 ? (
            <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
          ) : null
        }
      />
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
    overflow: 'hidden', // Ensure content respects border radius
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
  filterContainer: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 0,
  },
  filterScroll: {
    paddingHorizontal: 15,
  },
  chip: {
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
