import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface ModalButton {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons?: ModalButton[];
  icon?: React.ReactNode;
}

export function CustomModal({
  visible,
  onClose,
  title,
  message,
  buttons,
  icon,
}: CustomModalProps) {
  const defaultButtons: ModalButton[] = buttons || [
    { label: "OK", onPress: onClose, variant: "primary" },
  ];

  const primaryButton =
    defaultButtons.find((btn) => btn.variant !== "secondary") || defaultButtons[0];

  const secondaryButton =
    defaultButtons.length > 1
      ? defaultButtons.find((btn) => btn.variant === "secondary")
      : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <View style={styles.spacer} />
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          {icon ? (
            <View style={styles.iconContainer}>{icon}</View>
          ) : (
            <LinearGradient
              colors={["rgba(30,64,175,0.16)", "rgba(30,64,175,0.22)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <View style={styles.iconInner}>
                <Feather name="alert-circle" size={24} color="#1e40af" />
              </View>
            </LinearGradient>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View
            style={[
              styles.actions,
              secondaryButton ? styles.actionsRow : styles.actionsColumn,
            ]}
          >
            {secondaryButton ? (
              <PrimaryButton
                title={secondaryButton.label}
                onPress={secondaryButton.onPress}
                variant="secondary"
                style={styles.actionBtnHalf}
              />
            ) : null}

            <PrimaryButton
              title={primaryButton?.label || "OK"}
              onPress={primaryButton?.onPress || onClose}
              style={secondaryButton ? styles.actionBtnHalf : styles.actionBtnFull}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  spacer: {
    width: 32,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.28)",
    marginTop: 2,
    marginBottom: 14,
    padding: 1,
  },
  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  actions: {
    width: "100%",
  },
  actionsColumn: {
    gap: 10,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtnFull: {
    width: "100%",
  },
  actionBtnHalf: {
    flex: 1,
  },
});