// =====================================================
// ملف: ImageUploadField.tsx
// الغرض: مربع رفع صورة قابل لإعادة الاستخدام —
// بيتظهر بيه معاينة الصورة الحالية، وزرار لرفع صورة جديدة
// مستخدم في: صور الأصناف، شعار الموقع، أيقونة الـ Tab
// =====================================================
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/useImageUpload";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  currentUrl: string | null;
  folder: string;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
  shape?: "square" | "circle";
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "h-14 w-14",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImageUploadField({
  currentUrl,
  folder,
  onUploaded,
  onRemoved,
  shape = "square",
  size = "md",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const result = await uploadImage(file, folder);
    setUploading(false);

    if (result.success) {
      onUploaded(result.url);
    } else {
      setError(result.error);
    }

    // نصفّر قيمة الـ input عشان يقدر يرفع نفس الصورة تاني لو حبّ
    if (inputRef.current) inputRef.current.value = "";
  }

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-forest/15 bg-muted ${SIZE_CLASSES[size]} ${shapeClass}`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-fire" />
          ) : currentUrl ? (
            <img src={currentUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-forest/5 disabled:opacity-50"
          >
            {currentUrl ? "غيّر الصورة" : "ارفع صورة"}
          </button>
          {currentUrl && onRemoved && (
            <button
              type="button"
              onClick={onRemoved}
              className="flex items-center gap-1 text-xs text-chili hover:underline"
            >
              <X className="h-3 w-3" /> إزالة الصورة
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-chili">{error}</p>}
    </div>
  );
}
