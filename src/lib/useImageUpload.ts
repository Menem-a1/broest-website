// =====================================================
// ملف: useImageUpload.ts
// الغرض: دالة واحدة مشتركة لرفع أي صورة (صنف، شعار، أيقونة)
// لمساحة التخزين في Supabase، وترجع رابط الصورة الجاهز
// =====================================================
import { supabase } from "@/lib/supabase";

const BUCKET = "menu-images";
const MAX_SIZE_MB = 5;
const MAX_DIMENSION = 1600; // أقصى عرض/ارتفاع بالبكسل بعد الضغط
const JPEG_QUALITY = 0.8;

// بتصغّر الصورة وتحولها لـ JPEG مضغوط قبل الرفع، عشان الموقع
// يفتح أسرع للعميل ونستهلك مساحة تخزين أقل. لو الضغط فشل لأي
// سبب (متصفح قديم مثلًا)، بنرفع الصورة الأصلية زي ما هي —
// أفضل من ما نمنع الرفع خالص
async function compressImage(file: File): Promise<File> {
  // الصور المتحركة (GIF) بنسيبها زي ما هي عشان الضغط بيكسر الحركة
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    // لو الملف المضغوط طلع أكبر من الأصلي (نادر بس ممكن)، نسيب الأصلي
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

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

  const compressedFile = await compressImage(file);

  const fileExt = compressedFile.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, compressedFile, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    return { success: false, error: "فشل رفع الصورة، حاول تاني" };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
