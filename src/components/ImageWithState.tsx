import { useState } from "react";
import { ImageOff } from "lucide-react";

// كومبوننت بسيط بيلف أي <img> عادية، وبيضيف له حالة تحميل (skeleton)
// وحالة فشل تحميل (fallback احترافي بدل أيقونة الصورة المكسورة
// الافتراضية من المتصفح). مساحة الصورة محجوزة من الأب (aspect-ratio
// أو ارتفاع ثابت) من غير ما نضطر نغيّر حاجة في التخطيط الحالي.
export function ImageWithState({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span className="text-[11px]">تعذر تحميل الصورة</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`${className} ${status === "loaded" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        />
      )}
    </>
  );
}
