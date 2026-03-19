import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Badge, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootState } from "../redux/store";
import { RootStackParamList } from "../navigation/types";
import { selectTotalUnread } from "../redux/slices/notificationSlice";

export default function NotificationsBadge() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const totalUnread = useSelector((state: RootState) => selectTotalUnread(state));

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("Notifications")}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🔔</Text>
      {totalUnread > 0 && (
        <Badge size={18} style={styles.badge}>
          {totalUnread > 99 ? "99+" : totalUnread}
        </Badge>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    position: "relative",
    marginRight: 10,
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    color: "white",
    fontWeight: "bold",
  },
});
