import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

interface GradientHeaderProps {
  title: string;
  type: "professional" | "client" | "admin";
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

const GRADIENT_COLORS = {
  professional: { start: "#1e3a8a", end: "#3b82f6" },
  client: { start: "#14532d", end: "#22c55e" },
  admin: { start: "#581c87", end: "#a855f7" },
};

export function GradientHeader({
  title,
  type,
  onBack,
  showBack = false,
  rightElement,
  subtitle,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = GRADIENT_COLORS[type];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + 12,
          backgroundColor: colors.start,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.rightContainer}>
          {rightElement || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
});
