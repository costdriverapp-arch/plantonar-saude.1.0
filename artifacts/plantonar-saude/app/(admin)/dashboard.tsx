import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { CustomModal } from "@/components/ui/CustomModal";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "@plantonar:users";

const statusOptions = ["active", "pending", "blocked", "review", "notified"] as const;
type UserStatus = typeof statusOptions[number];

const statusInfo: Record<UserStatus, { label: string; color: string }> = {
  active: { label: "Ativo", color: "#16a34a" },
  pending: { label: "Pendente", color: "#f59e0b" },
  blocked: { label: "Bloqueado", color: "#ef4444" },
  review: { label: "Em Revisão", color: "#6366f1" },
  notified: { label: "Notificado", color: "#0ea5e9" },
};

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "professional" | "client">("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const all = stored ? JSON.parse(stored) : [];
      setUsers(all.filter((u: any) => u.role !== "admin"));
    } catch {}
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const all: any[] = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        all[idx].status = status;
        all[idx].isBlocked = status === "blocked";
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(all));
      }
      await loadUsers();
      setSelectedUser(null);
    } catch {}
  };

  const filtered = users.filter((u) => filter === "all" || u.role === filter);
  const proCount = users.filter((u) => u.role === "professional").length;
  const clientCount = users.filter((u) => u.role === "client").length;

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Painel Admin</Text>
            <Text style={styles.headerSub}>Gerenciar usuários</Text>
          </View>
          <TouchableOpacity onPress={() => setLogoutModal(true)} hitSlop={8}>
            <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Feather name="user-check" size={14} color="#a78bfa" />
            <Text style={styles.statText}>{proCount} Profissionais</Text>
          </View>
          <View style={styles.statChip}>
            <Feather name="heart" size={14} color="#a78bfa" />
            <Text style={styles.statText}>{clientCount} Clientes</Text>
          </View>
        </View>
        <View style={styles.filterRow}>
          {(["all", "professional", "client"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === "all" ? "Todos" : f === "professional" ? "Profissionais" : "Clientes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        onRefresh={loadUsers}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={44} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = item.status as UserStatus || "pending";
          const info = statusInfo[st];
          return (
            <TouchableOpacity style={styles.userCard} onPress={() => setSelectedUser(item)} activeOpacity={0.85}>
              <View style={styles.userLeft}>
                <View style={[styles.userAvatar, { backgroundColor: item.role === "professional" ? "#dbeafe" : "#dcfce7" }]}>
                  <Feather name={item.role === "professional" ? "user-check" : "heart"} size={20} color={item.role === "professional" ? "#1e40af" : "#16a34a"} />
                </View>
                <View>
                  <Text style={styles.userName}>
                    {item.firstName ? `${item.firstName} ${item.lastName}` : item.email}
                  </Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={[styles.roleText, { color: item.role === "professional" ? "#1e40af" : "#16a34a" }]}>
                    {item.role === "professional" ? "Profissional" : "Cliente"}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusChip, { backgroundColor: info.color + "20" }]}>
                <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selectedUser && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setSelectedUser(null)} />
          <View style={[styles.sheet, { paddingBottom: bottomPad + 12 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUser.email}
            </Text>
            <Text style={styles.sheetEmail}>{selectedUser.email}</Text>
            <Text style={styles.sheetSubtitle}>Alterar Status</Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((s) => {
                const info = statusInfo[s];
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusOption, { backgroundColor: info.color + "18", borderColor: info.color + "40" }]}
                    onPress={() => updateUserStatus(selectedUser.id, s)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.statusOptionText, { color: info.color }]}>{info.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sair do painel"
        message="Tem certeza que deseja sair?"
        icon={<Feather name="log-out" size={40} color="#ef4444" />}
        buttons={[
          { label: "Cancelar", onPress: () => setLogoutModal(false), variant: "secondary" },
          { label: "Sair", onPress: handleLogout, variant: "danger" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#581c87", paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 7, borderRadius: 20, alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  filterBtnActive: { backgroundColor: "#fff" },
  filterText: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "#581c87" },
  list: { padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  userCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  userLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  userEmail: { fontSize: 12, color: "#64748b" },
  roleText: { fontSize: 11, fontWeight: "600", marginTop: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  sheetEmail: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  sheetSubtitle: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  statusOptionText: { fontSize: 13, fontWeight: "700" },
});
