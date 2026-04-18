export const PROFILE_AVATAR_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;

export type ProfileAvatarAllowedExtension =
  (typeof PROFILE_AVATAR_ALLOWED_EXTENSIONS)[number];

export type ProfileAvatarValidationResult =
  | {
      valid: true;
      extension: ProfileAvatarAllowedExtension;
    }
  | {
      valid: false;
      error: string;
    };

export type BuildProfileAvatarPathInput = {
  authUserId: string;
  extension: string;
};

export function normalizeProfileAvatarExtension(
  extension?: string | null
): string {
  if (!extension) return "";
  return extension.replace(".", "").trim().toLowerCase();
}

export function validateProfileAvatarExtension(
  extension?: string | null
): ProfileAvatarValidationResult {
  const normalized = normalizeProfileAvatarExtension(extension);

  if (!normalized) {
    return {
      valid: false,
      error: "Extensão da imagem não encontrada.",
    };
  }

  if (
    !PROFILE_AVATAR_ALLOWED_EXTENSIONS.includes(
      normalized as ProfileAvatarAllowedExtension
    )
  ) {
    return {
      valid: false,
      error: "Formato de imagem não permitido.",
    };
  }

  return {
    valid: true,
    extension: normalized as ProfileAvatarAllowedExtension,
  };
}

export function sanitizeProfileAvatarFileNamePart(value?: string | null): string {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export function buildProfileAvatarFileName(extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const normalizedExtension = normalizeProfileAvatarExtension(extension);

  return `avatar-${timestamp}-${random}.${normalizedExtension}`;
}

export function buildProfileAvatarPath({
  authUserId,
  extension,
}: BuildProfileAvatarPathInput): string {
  const safeAuthUserId = sanitizeProfileAvatarFileNamePart(authUserId);
  const fileName = buildProfileAvatarFileName(extension);

  if (!safeAuthUserId) {
    throw new Error("Usuário inválido para montar caminho do avatar.");
  }

  return `${safeAuthUserId}/${fileName}`;
}

export function extractProfileAvatarExtensionFromUri(uri?: string | null): string {
  if (!uri) return "";

  const cleanUri = uri.split("?")[0];
  const parts = cleanUri.split(".");
  return normalizeProfileAvatarExtension(parts[parts.length - 1] || "");
}

export function resolveProfileAvatarContentType(extension: string): string {
  const normalized = normalizeProfileAvatarExtension(extension);

  switch (normalized) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function isProfileAvatarUrl(value?: string | null): boolean {
  if (!value) return false;

  const clean = value.trim().toLowerCase();

  return (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("file://")
  );
}

export function extractProfileAvatarStoragePathFromUrl(
  avatarUrl?: string | null,
  bucketName = "avatars"
): string | null {
  if (!avatarUrl) return null;

  const marker = `/storage/v1/object/public/${bucketName}/`;
  const index = avatarUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return avatarUrl.slice(index + marker.length);
}