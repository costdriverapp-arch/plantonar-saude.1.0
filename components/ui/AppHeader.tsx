import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { gradientsByRole } from "@/constants/colors";

type Props = {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightPress?: () => void;
  rightContent?: React.ReactNode;
};

export function AppHeader({
  title,
  showBack = false,
  rightIcon,
  onRightPress,
  rightContent,
}: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const topPad = Platform.OS === "web" ? 40 : insets.top;

  const resolvedRole =
    user?.role ||
    (user as any)?.tipoUsuario ||
    "professional";

  const fallbackGradient = ["#1e3a8a", "#3b82f6"];

  const gradient =
    gradientsByRole?.[resolvedRole as keyof typeof gradientsByRole] ||
    fallbackGradient;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: topPad + 10 }]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.side} activeOpacity={0.85}>
            <LinearGradient
              colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backCircle}
            >
              <View style={styles.backInner}>
                <Feather name="arrow-left" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {rightContent ? (
          <View style={styles.rightContentWrapper}>{rightContent}</View>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.side} activeOpacity={0.85}>
            <LinearGradient
              colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCircle}
            >
              <View style={styles.backInner}>
                <Feather name={rightIcon} size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  side: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContentWrapper: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 10,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 1,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 1,
  },
  backInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(13,43,94,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
});