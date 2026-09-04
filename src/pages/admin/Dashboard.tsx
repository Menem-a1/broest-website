// =====================================================
// ملف: Dashboard.tsx
// الغرض: الصفحة الرئيسية للوحة التحكم — ملخص سريع
// =====================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { UtensilsCrossed, Settings, ArrowLeft, ClipboardList, Volume2 } from "lucide-react";

export function Dashboard() {
  const { role } = useAuth();
  const isDeveloper = role === "developer";
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // المتصفحات بتمنع تشغيل أي صوت قبل أول تفاعل من المستخدم مع الصفحة.
    // بمجرد ما تدوس في أي مكان في لوحة التحكم، بنسجل إن الصوت بقى مسموح.
    const key = "broest_admin_sound_enabled";
    if (sessionStorage.getItem(key)) {
      setSoundEnabled(true);
      return;
    }
    function markEnabled() {
      sessionStorage.setItem(key, "1");
      setSoundEnabled(true);
      document.removeEventListener("click", markEnabled);
    }
    document.addEventListener("click", markEnabled);
    return () => document.removeEventListener("click", markEnabled);
  }, []);

  useEffect(() => {
    async function fetchCounts() {
      const { count: newOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      setNewOrdersCount(newOrders ?? 0);

      // إحصائيات المنيو والأقسام مخصوصة بـ developer بس (owner أصلاً محجوب عنه
      // جدول menu_items بحماية قاعدة البيانات، فمفيش داعي نطلبها له)
      if (isDeveloper) {
        const { count: items } = await supabase
          .from("menu_items")
          .select("*", { count: "exact", head: true });
        const { count: cats } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });
        setItemCount(items ?? 0);
        setCategoryCount(cats ?? 0);
      }
    }
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeveloper]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-deep">أهلاً بيك </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        من هنا تقدر تعدّل على كل حاجة في موقع بروست بنفسك
      </p>

      {!soundEnabled && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-fire/30 bg-fire/5 px-4 py-3 text-sm text-forest-deep">
          <Volume2 className="h-4 w-4 shrink-0 text-fire" />
          دوس في أي مكان في الصفحة عشان تفعّل صوت التنبيه للطلبات الجديدة
          (المتصفح بيمنع الصوت لحد أول تفاعل منك)
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-fire/30 bg-fire/5 p-6">
          <span className="font-price text-3xl font-bold text-fire">
            {newOrdersCount ?? "..."}
          </span>
          <p className="mt-1 text-sm text-forest-deep">طلب جديد</p>
        </div>
        {isDeveloper && (
          <>
            <div className="rounded-xl border border-forest/10 bg-white p-6">
              <span className="font-price text-3xl font-bold text-fire">
                {itemCount ?? "..."}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">صنف في المنيو</p>
            </div>
            <div className="rounded-xl border border-forest/10 bg-white p-6">
              <span className="font-price text-3xl font-bold text-fire">
                {categoryCount ?? "..."}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">قسم</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/orders"
          className="group flex items-center justify-between rounded-xl border border-forest/10 bg-white p-6 transition-colors hover:border-fire"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fire/15 text-fire">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-forest-deep">الطلبات</h3>
              <p className="text-xs text-muted-foreground">شوف الطلبات الجايالك</p>
            </div>
          </div>
          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground transition-transform group-hover:-translate-x-1" />
        </Link>

        {isDeveloper && (
          <>
            <Link
              to="/admin/menu"
              className="group flex items-center justify-between rounded-xl border border-forest/10 bg-white p-6 transition-colors hover:border-fire"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fire/15 text-fire">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-forest-deep">المنيو والأسعار</h3>
                  <p className="text-xs text-muted-foreground">عدّل الأصناف والأسعار</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>

            <Link
              to="/admin/settings"
              className="group flex items-center justify-between rounded-xl border border-forest/10 bg-white p-6 transition-colors hover:border-fire"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fire/15 text-fire">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-forest-deep">إعدادات المطعم</h3>
                  <p className="text-xs text-muted-foreground">التليفون، واتساب، العنوان</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
