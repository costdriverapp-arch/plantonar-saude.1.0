type Role = "client" | "professional";

type Input = {
  role: Role;
  baseComplete: boolean;
  professionalComplete?: boolean;
};

export function resolveProfileRoute({
  role,
  baseComplete,
  professionalComplete,
}: Input) {
  if (!baseComplete) {
    return "/profile-form";
  }

  if (role === "professional" && !professionalComplete) {
    return "/(professional)/complete-profile";
  }

  if (role === "professional") {
    return "/(professional)/(tabs)/dashboard";
  }

  return "/(client)/dashboard";
}