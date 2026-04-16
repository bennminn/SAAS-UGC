import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
    );
  }
  return _supabase;
}

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "ugc-assets";

/**
 * Sube un archivo a Supabase Storage y devuelve la URL publica.
 * `key` usa formato path: "videos/userId/videoId.mp4"
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, body, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Supabase Storage upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/** Alias retrocompatible (muchos archivos usan uploadVideo) */
export const uploadVideo = uploadFile;

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Supabase signed URL error: ${error?.message}`);
  }
  return data.signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Supabase Storage delete error: ${error.message}`);
}

/** Alias retrocompatible */
export const deleteVideo = deleteFile;

/** Genera la URL publica sin firma (bucket debe ser publico) */
export function getPublicUrl(key: string): string {
  const supabase = getSupabase();
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}
