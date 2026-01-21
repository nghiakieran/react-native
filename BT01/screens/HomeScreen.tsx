import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ReactLogo from "../components/ReactLogo";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ReactLogo width={80} height={72} color="#ffffff" />
          </View>
          <Text style={styles.title}>Xin chào ạ</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu bản thân</Text>
            <Text style={styles.text}>
              Em là sinh viên năm 4 đang học React Native để phát triển ứng dụng
              di động.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Họ và tên:</Text>
              <Text style={styles.value}>Lê Chí Nghĩa</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>MSSV:</Text>
              <Text style={styles.value}>22110187</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Trường:</Text>
              <Text style={styles.value}>
                Đại học Công nghệ Kỹ thuật TP.Hồ Chí Minh
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngành:</Text>
              <Text style={styles.value}>Công nghệ thông tin</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Kỹ năng:</Text>
              <Text style={styles.value}>
                Javascript, Typescript, React, React Native, Flutter, Nodejs,
                Expressjs, MongoDB, MySQL
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6366f1",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    marginBottom: 15,
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
    paddingLeft: 10,
  },
  text: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    width: 100,
  },
  value: {
    fontSize: 16,
    color: "#6b7280",
    flex: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#d1d5db",
  },
});
