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

type ModalType = "info" | "success" | "error" | "confirm" | "danger";

type ActionButton = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ModalType;
  closeOnBackdrop?: boolean;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  children?: React.ReactNode;
};

function getModalConfig(type: ModalType) {
  switch (type) {
    case "success":
      return {
        icon: "check",
        circleBg: "rgba(34,197,94,0.16)",
        circleBorder: "rgba(34,197,94,0.28)",
        innerBg: "rgba(34,197,94,0.22)",
        iconColor: "#22c55e",
      };
    case "error":
      return {
        icon: "alert-circle",
        circleBg: "rgba(239,68,68,0.16)",
        circleBorder: "rgba(239,68,68,0.28)",
        innerBg: "rgba(239,68,68,0.22)",
        iconColor: "#ef4444",
      };
    case "danger":
      return {
        icon: "trash-2",
        circleBg: "rgba(239,68,68,0.16)",
        circleBorder: "rgba(239,68,68,0.28)",
        innerBg: "rgba(239,68,68,0.22)",
        iconColor: "#ef4444",
      };
    case "confirm":
      return {
        icon: "help-circle",
        circleBg: "rgba(245,158,11,0.16)",
        circleBorder: "rgba(245,158,11,0.28)",
        innerBg: "rgba(245,158,11,0.22)",
        iconColor: "#f59e0b",
      };
    case "info":
    default:
      return {
        icon: "info",
        circleBg: "rgba(30,64,175,0.16)",
        circleBorder: "rgba(30,64,175,0.28)",
        innerBg: "rgba(30,64,175,0.22)",
        iconColor: "#1e40af",
      };
  }
}

export function AppModal({
  visible,
  onClose,
  title,
  message,
  type = "info",
  closeOnBackdrop = true,
  primaryAction,
  secondaryAction,
  children,
}: Props) {
  const config = getModalConfig(type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <View style={styles.spacer} />
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          <LinearGradient
            colors={[config.circleBg, config.innerBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconCircle, { borderColor: config.circleBorder }]}
          >
            <View style={styles.iconInner}>
              <Feather
                name={config.icon as keyof typeof Feather.glyphMap}
                size={24}
                color={config.iconColor}
              />
            </View>
          </LinearGradient>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {children ? <View style={styles.content}>{children}</View> : null}

          <View
            style={[
              styles.actions,
              secondaryAction ? styles.actionsRow : styles.actionsColumn,
            ]}
          >
            {secondaryAction ? (
              <PrimaryButton
                title={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant="secondary"
                style={styles.actionBtnHalf}
              />
            ) : null}

            {primaryAction ? (
              <PrimaryButton
                title={primaryAction.label}
                onPress={primaryAction.onPress}
                style={secondaryAction ? styles.actionBtnHalf : styles.actionBtnFull}
              />
            ) : (
              <PrimaryButton
                title="Fechar"
                onPress={onClose}
                style={secondaryAction ? styles.actionBtnHalf : styles.actionBtnFull}
              />
            )}
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
  content: {
    marginBottom: 18,
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