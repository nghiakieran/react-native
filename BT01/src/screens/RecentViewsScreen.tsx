import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, ActivityIndicator } from 'react-native-paper';
import { RootStackParamList } from '../navigation/types';
import { useGetMyRecentViewsQuery } from '../services/api/recentViewApi';
import { appTheme } from '../theme/appTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'RecentViews'>;

export default function RecentViewsScreen({ navigation }: Props) {
  const { data, isLoading, refetch, isFetching } = useGetMyRecentViewsQuery({ limit: 30 });
  const items = data?.data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đã xem gần đây</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={appTheme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id.toString()}
          onRefresh={refetch}
          refreshing={isFetching}
          contentContainerStyle={[styles.list, items.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: appTheme.colors.textMuted }}>Chưa có sản phẩm đã xem.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const p: any = item.product;
            if (!p) return null;
            const price = Math.round(p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                activeOpacity={0.85}
              >
                <Image source={{ uri: p.imageUrl }} style={styles.img} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.price}>{price.toLocaleString('vi-VN')}đ</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, fontWeight: '900', color: appTheme.colors.text },
  headerTitle: { fontSize: 18, fontWeight: '900', color: appTheme.colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: 16,
    padding: 12,
  },
  img: { width: 72, height: 72, borderRadius: 14, backgroundColor: '#E5E7EB' },
  name: { color: appTheme.colors.text, fontWeight: '900' },
  price: { marginTop: 8, color: appTheme.colors.text, fontWeight: '900' },
});

