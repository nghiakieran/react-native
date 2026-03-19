import React, { useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";

import { RootStackParamList } from "../navigation/types";
import { AppDispatch, RootState } from "../redux/store";
import { ActivityPayload, markAllRead, markRead } from "../redux/slices/notificationSlice";
import * as notificationActions from "../redux/slices/notificationSlice";
import { useGetMyNotificationsQuery, useMarkAllReadMutation, useMarkReadByIdMutation } from "../services/api/notificationApi";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

const typeToEmoji: Partial<Record<ActivityPayload["type"], string>> = {
  ORDER_NEW: "📦",
  REVIEW_NEW: "⭐",
  REVIEW_COMMENT_NEW: "💬",
  PRODUCT_NEW: "🆕",
  COUPON_NEW: "🎟️",
};

export default function NotificationsScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.notifications.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const [markedForRead, setMarkedForRead] = React.useState(false);

  const {
    data: notificationsData,
    refetch,
  } = useGetMyNotificationsQuery(
    { page: 1, limit: 50 },
    { skip: !token },
  );

  const [markAllReadApi] = useMarkAllReadMutation();
  const [markReadByIdApi] = useMarkReadByIdMutation();

  useEffect(() => {
    if (!notificationsData?.data) return;
    dispatch(
      (notificationActions as any).hydrateNotifications({
        items: notificationsData.data.items as any,
        unreadCounts: notificationsData.data.unreadCounts as any,
      }),
    );
  }, [dispatch, notificationsData]);

  useEffect(() => {
    if (markedForRead) return;
    setMarkedForRead(true);

    void (async () => {
      try {
        await markAllReadApi().unwrap();
        dispatch(markAllRead());
        refetch();
      } catch (_e) {
        // If API fails, keep local state changes as best effort
        dispatch(markAllRead());
      }
    })();
  }, [dispatch, markedForRead, markAllReadApi, refetch]);

  const handlePress = (item: ActivityPayload & { read: boolean }) => {
    if (!item.read) {
      dispatch(markRead(item.eventId));
      // Mark read on server if we have notification id
      if ((item as any).id != null) {
        void markReadByIdApi((item as any).id).catch(() => {});
      }
    }

    const meta = item.meta || {};
    if (item.type === "ORDER_NEW" && typeof meta.orderId === "number") {
      navigation.navigate("OrderDetail", { orderId: meta.orderId });
      return;
    }

    if ((item.type === "REVIEW_NEW" || item.type === "REVIEW_COMMENT_NEW" || item.type === "PRODUCT_NEW") && typeof meta.productId === "number") {
      navigation.navigate("ProductDetail", { productId: meta.productId });
      return;
    }

    navigation.navigate("Home", {});
  };

  const renderItem = ({ item }: { item: (ActivityPayload & { read: boolean }) }) => {
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => handlePress(item)}>
        <View style={[styles.dot, { backgroundColor: item.read ? "#E5E7EB" : "#6366F1" }]} />
        <View style={styles.content}>
          <Text style={styles.title}>
            {typeToEmoji[item.type] || "🔔"} {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{format(new Date(item.createdAt), "HH:mm - dd/MM/yyyy")}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
          <Text style={styles.emptyHint}>Khi có hoạt động mới, bạn sẽ thấy tại đây.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.eventId}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  backText: { fontSize: 24, fontWeight: "700", color: "#111827" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
  emptyHint: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 4 },
  message: { fontSize: 13, color: "#374151" },
  time: { fontSize: 12, color: "#6B7280", marginTop: 6 },
});
