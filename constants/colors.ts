const colors = {
  light: {
    text: "#0f172a",
    tint: "#1e40af",

    background: "#f8fafc",
    foreground: "#0f172a",

    card: "#ffffff",
    cardForeground: "#0f172a",

    primary: "#1e40af",
    primaryForeground: "#ffffff",

    secondary: "#f1f5f9",
    secondaryForeground: "#1e293b",

    muted: "#f1f5f9",
    mutedForeground: "#64748b",

    accent: "#dbeafe",
    accentForeground: "#1e40af",

    destructive: "#ef4444",
    destructiveForeground: "#ffffff",

    success: "#16a34a",
    successForeground: "#ffffff",

    warning: "#f59e0b",
    warningForeground: "#ffffff",

    border: "#e2e8f0",
    input: "#e2e8f0",

    // Professional (blue gradient)
    professionalGradientStart: "#1e3a8a",
    professionalGradientEnd: "#3b82f6",

    // Client (green gradient)
    clientGradientStart: "#14532d",
    clientGradientEnd: "#22c55e",

    // Admin (purple gradient)
    adminGradientStart: "#581c87",
    adminGradientEnd: "#a855f7",

    overlay: "rgba(0,0,0,0.5)",
    surface: "#ffffff",
  },
  radius: 12,
};

export const gradientsByRole = {
  professional: [colors.light.professionalGradientStart, colors.light.professionalGradientEnd],
  client: [colors.light.clientGradientStart, colors.light.clientGradientEnd],
  admin: [colors.light.adminGradientStart, colors.light.adminGradientEnd],
} as const;

export default colors;
