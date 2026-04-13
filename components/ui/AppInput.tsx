import React, { forwardRef } from "react";
import {
  ReturnKeyTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(
  ({ label, error, leftIcon, rightIcon, onRightIconPress, style, ...props }, ref) => {
    const colors = useColors();

    return (
      <View style={styles.container}>
        {label ? (
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        ) : null}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? colors.destructive : colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          {leftIcon ? (
            <Feather name={leftIcon} size={18} color={colors.mutedForeground} style={styles.leftIcon} />
          ) : null}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.foreground,
                paddingLeft: leftIcon ? 0 : 4,
                paddingRight: rightIcon ? 0 : 4,
              },
              style,
            ]}
            placeholderTextColor={colors.mutedForeground}
            returnKeyType={props.returnKeyType || "next"}
            {...props}
          />
          {rightIcon ? (
            <TouchableOpacity onPress={onRightIconPress} hitSlop={8}>
              <Feather name={rightIcon} size={18} color={colors.mutedForeground} style={styles.rightIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

AppInput.displayName = "AppInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
