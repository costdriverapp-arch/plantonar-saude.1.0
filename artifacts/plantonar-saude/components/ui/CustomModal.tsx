import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

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

export function CustomModal({ visible, onClose, title, message, buttons, icon }: CustomModalProps) {
  const colors = useColors();

  const defaultButtons: ModalButton[] = buttons || [
    { label: "OK", onPress: onClose, variant: "primary" },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.card }]}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
              <View style={[styles.buttons, defaultButtons.length === 2 && styles.buttonsRow]}>
                {defaultButtons.map((btn, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.button,
                      defaultButtons.length === 2 && styles.buttonHalf,
                      btn.variant === "primary" && { backgroundColor: colors.primary },
                      btn.variant === "danger" && { backgroundColor: colors.destructive },
                      btn.variant === "secondary" && {
                        backgroundColor: colors.secondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                      !btn.variant && { backgroundColor: colors.primary },
                    ]}
                    onPress={btn.onPress}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        btn.variant === "secondary"
                          ? { color: colors.foreground }
                          : { color: "#ffffff" },
                      ]}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttons: {
    width: "100%",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 6,
    flex: 1,
  },
  buttonHalf: {
    marginTop: 0,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
