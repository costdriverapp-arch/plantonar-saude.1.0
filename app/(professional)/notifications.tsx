import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

const notifIcons = {
  accepted: { icon: "check-circle" as const, color: "#16a34a" },
  rejected: { icon: "x-circle" as const, color: "#ef4444" },
  cancelled: { icon: "slash" as const, color: "#94a3b8" },
  vacancy_filled: { icon: "users" as const, color: "#6366f1" },
  new_application: { icon: "bell" as const, color: "#1e40af" },
};

export default function NotificationsScreen() {
  const { notifications, markNotificationsRead, loadNotifications } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    loadNotifications();
    markNotificationsRead();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
      </View>

      <FlatList
        data={notifications.slice().reverse()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyDesc}>Você está em dia!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const info = notifIcons[item.type] || notifIcons.new_application;
          return (
            <View style={[styles.card, !item.read && styles.cardUnread]}>
              <View style={[styles.iconWrap, { backgroundColor: info.color + "20" }]}>
                <Feather name={info.icon} size={22} color={info.color} />
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {},
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  list: { padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardUnread: { borderColor: "#bfdbfe", backgroundColor: "#f0f7ff" },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  message: { fontSize: 13, color: "#475569", lineHeight: 18 },
  time: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1e40af", marginTop: 4 },
});
