import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProvider>
    </AuthProvider>
  );
}