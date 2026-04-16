import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  backgroundColor?: string;
  contentStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
};

export function ScreenContainer({
  children,
  scroll = false,
  keyboard = false,
  backgroundColor = "#f8fafc",
  contentStyle,
  containerStyle,
  scrollProps,
}: Props) {
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 20 },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        { paddingBottom: insets.bottom + 20 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }, containerStyle]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
});