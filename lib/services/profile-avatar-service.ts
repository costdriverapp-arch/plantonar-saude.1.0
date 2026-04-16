import { supabase } from "../supabase";

export const PROFILE_AVATAR_BUCKET = "avatars";

export type UploadProfileAvatarInput = {
  authUserId: string;
  imageUri: string;
  oldAvatarUrl?: string | null;
};

export type UploadProfileAvatarResult = {
  avatarUrl: string;
  storagePath: string;
};

function getExtensionFromImageUri(uri?: string | null): string {
  if (!uri) return "";

  const cleanUri = uri.split("?")[0];
  const parts = cleanUri.split(".");
  const extension = parts[parts.length - 1] || "";

  return extension.replace(".", "").trim().toLowerCase();
}

function getContentTypeFromExtension(extension: string): string {
  const normalized = extension.trim().toLowerCase();

  if (normalized === "jpg" || normalized === "jpeg") return "image/jpeg";
  if (normalized === "png") return "image/png";
  if (normalized === "webp") return "image/webp";

  return "image/jpeg";
}

function validateExtension(extension: string): void {
  const allowed = ["jpg", "jpeg", "png", "webp"];

  if (!allowed.includes(extension)) {
    throw new Error("Formato de imagem não permitido.");
  }
}

function buildStoragePath(authUserId: string, extension: string): string {
  const safeUserId = authUserId.trim();

  if (!safeUserId) {
    throw new Error("Usuário inválido para upload da foto.");
  }

  return `${safeUserId}/avatar-${Date.now()}.${extension}`;
}

function extractStoragePathFromAvatarUrl(
  avatarUrl?: string | null
): string | null {
  if (!avatarUrl) return null;

  const marker = `/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`;
  const index = avatarUrl.indexOf(marker);

  if (index === -1) return null;

  return avatarUrl.slice(index + marker.length);
}

async function readImageAsArrayBuffer(imageUri: string): Promise<ArrayBuffer> {
  const response = await fetch(imageUri);

  if (!response.ok) {
    throw new Error("Não foi possível ler a imagem selecionada.");
  }

  return await response.arrayBuffer();
}

export async function removeProfileAvatar(
  avatarUrl?: string | null
): Promise<void> {
  const storagePath = extractStoragePathFromAvatarUrl(avatarUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(error.message || "Não foi possível remover a foto anterior.");
  }
}

export async function saveProfileAvatarUrl(
  authUserId: string,
  avatarUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      avatar: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", authUserId);

  if (error) {
    throw new Error(error.message || "Não foi possível salvar a foto do perfil.");
  }
}

export async function uploadProfileAvatar({
  authUserId,
  imageUri,
  oldAvatarUrl,
}: UploadProfileAvatarInput): Promise<UploadProfileAvatarResult> {
  if (!authUserId?.trim()) {
    throw new Error("Usuário inválido para upload da foto.");
  }

  if (!imageUri?.trim()) {
    throw new Error("Imagem inválida para upload.");
  }

  const extension = getExtensionFromImageUri(imageUri);
  validateExtension(extension);

  const storagePath = buildStoragePath(authUserId, extension);
  const contentType = getContentTypeFromExtension(extension);
  const fileBuffer = await readImageAsArrayBuffer(imageUri);

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Não foi possível enviar a foto.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(storagePath);

  if (!publicUrl) {
    throw new Error("Não foi possível gerar a URL pública da foto.");
  }

  await saveProfileAvatarUrl(authUserId, publicUrl);

  if (oldAvatarUrl && oldAvatarUrl !== publicUrl) {
    try {
      await removeProfileAvatar(oldAvatarUrl);
    } catch {}
  }

  return {
    avatarUrl: publicUrl,
    storagePath,
  };
}