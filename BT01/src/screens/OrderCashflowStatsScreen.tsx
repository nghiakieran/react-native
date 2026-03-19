import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Card, Text, Divider } from "react-native-paper";
import { RootStackParamList } from "../navigation/types";
import { useGetMyOrderCashflowStatsQuery } from "../services/api/orderApi";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "OrderCashflowStats">;

const formatMoney = (n: number) => `${Number(n).toLocaleString("vi-VN")}đ`;

export default function OrderCashflowStatsScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch } = useGetMyOrderCashflowStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const stats = data?.data;

  // When user navigates back to this screen, force a refresh.
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const CardRow = ({
    label,
    color,
    count,
    totalAmount,
  }: {
    label: string;
    color: string;
    count: number;
    totalAmount: number;
  }) => {
    return (
      <Card style={[styles.card, { borderLeftColor: color }]}>
        <Card.Content>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardCount}>{count} đơn</Text>
          <Text style={styles.cardTotal}>{formatMoney(totalAmount)}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê dòng tiền</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : isError ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>Không thể tải thống kê.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <CardRow
            label="Chờ xác nhận"
            color="#3B82F6"
            count={stats?.pending.count ?? 0}
            totalAmount={stats?.pending.totalAmount ?? 0}
          />
          <View style={{ height: 12 }} />
          <CardRow
            label="Đang giao"
            color="#06B6D4"
            count={stats?.shipping.count ?? 0}
            totalAmount={stats?.shipping.totalAmount ?? 0}
          />
          <View style={{ height: 12 }} />
          <CardRow
            label="Đã giao"
            color="#10B981"
            count={stats?.delivered.count ?? 0}
            totalAmount={stats?.delivered.totalAmount ?? 0}
          />

          <Divider style={{ marginVertical: 16 }} />

          <Card>
            <Card.Content>
              <Text style={styles.summaryLabel}>Tổng tiền (theo 3 trạng thái)</Text>
              <Text style={styles.summaryTotal}>{formatMoney(stats?.total ?? 0)}</Text>
              <Text style={styles.summaryHint}>
                Tương ứng: NEW / SHIPPING / DELIVERED
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { fontSize: 14, fontWeight: "600", color: "#EF4444", marginBottom: 12, textAlign: "center" },
  retryBtn: { backgroundColor: "#6366F1", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: "#fff", fontWeight: "800" },

  card: { borderLeftWidth: 6, borderRadius: 14, backgroundColor: "#fff", elevation: 1 },
  cardLabel: { fontSize: 14, fontWeight: "900", color: "#111827" },
  cardCount: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#6B7280" },
  cardTotal: { marginTop: 6, fontSize: 20, fontWeight: "900", color: "#111827" },

  summaryLabel: { fontSize: 13, fontWeight: "800", color: "#6B7280" },
  summaryTotal: { marginTop: 6, fontSize: 26, fontWeight: "900", color: "#6366F1" },
  summaryHint: { marginTop: 4, fontSize: 12, color: "#9CA3AF", fontWeight: "700" },
});

