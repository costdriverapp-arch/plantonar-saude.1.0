import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

if (user?.role === "professional") return <Redirect href="/(professional)/(tabs)/dashboard" />;
if (user?.role === "client") return <Redirect href="/(client)/dashboard" />;
if (user?.role === "admin") return <Redirect href="/(admin)/dashboard" />;

  return <Redirect href="/(auth)/welcome" />;
}
