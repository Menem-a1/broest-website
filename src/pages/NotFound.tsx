// =====================================================
// ملف: NotFound.tsx
// الغرض: صفحة بسيطة تظهر لو الزائر فتح رابط مش موجود في الموقع
// =====================================================
import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <UtensilsCrossed className="h-12 w-12 text-fire" />
      <h1 className="font-display text-3xl font-bold text-forest-deep">الصفحة مش موجودة</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        يمكن الرابط اتغيّر أو مش موجود أصلاً. ارجع للصفحة الرئيسية وكمّل طلبك من هناك.
      </p>
      <Link
        to="/"
        className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-fire"
      >
        الرجوع للصفحة الرئيسية
      </Link>
    </div>
  );
}
