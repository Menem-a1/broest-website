// =====================================================
// ملف: useImageUpload.ts
// الغرض: دالة واحدة مشتركة لرفع أي صورة (صنف، شعار، أيقونة)
// لمساحة التخزين في Supabase، وترجع رابط الصورة الجاهز
// =====================================================
import { supabase } from "@/lib/supabase";

const BUCKET = "menu-images";
const MAX_SIZE_MB = 5;

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadImage(file: File, folder: string): Promise<UploadResult> {
  // تحقق بسيط قبل الرفع
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "الملف ده مش صورة" };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { success: false, error: `الصورة أكبر من ${MAX_SIZE_MB} ميجا، اختار صورة أصغر` };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    return { success: false, error: "فشل رفع الصورة، حاول تاني" };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
