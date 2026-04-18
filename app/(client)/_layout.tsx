import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ClientLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "android" ? 2 : 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="my-vacancies"
        options={{
          title: "Meus Anúncios",
          tabBarIcon: ({ color }) => <Feather name="list" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create-vacancy"
        options={{
          title: "Criar Anúncio",
          tabBarIcon: ({ color }) => <Feather name="plus-circle" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
<Tabs.Screen
  name="profile-form"
  options={{
    href: null,
  }}
/>
      <Tabs.Screen
        name="creditos"
        options={{
          href: null,
        }}
      />
<Tabs.Screen
  name="vacancy-model-preview"
  options={{
    href: null,
  }}
/>
<Tabs.Screen
  name="vacancy-models"
  options={{
    href: null,
  }}
/>
<Tabs.Screen
  name="client-avaliacao"
  options={{
    href: null,
  }}
/>

      <Tabs.Screen
        name="vacancy-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}