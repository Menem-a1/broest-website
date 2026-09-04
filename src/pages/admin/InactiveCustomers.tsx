// =====================================================
// ملف: InactiveCustomers.tsx
// الغرض: يعرض للمطور قايمة العملاء اللي عدّى وقت طويل من
// آخر طلب ليهم، عشان يقدر يتواصل معاهم بعرض أو تذكير.
// دي قايمة يدوية دلوقتي، مش إرسال بريد تلقائي — عشان
// نتجنب بناء نظام إرسال معقد جوه الموقع نفسه
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Clock } from "lucide-react";

type InactiveCustomer = {
  user_id: string;
  email: string;
  full_name: string;
  last_order_at: string;
  days_since_last_order: number;
};

export function InactiveCustomers() {
  const [customers, setCustomers] = useState<InactiveCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [minDays, setMinDays] = useState(14);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("inactive_customers")
        .select("*")
        .gte("days_since_last_order", minDays)
        .order("days_since_last_order", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, [minDays]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-deep">العملاء الغائبين</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عملاء مسجّلين دخول بجوجل ومعدّى وقت طويل من آخر طلب ليهم — ممكن تبعتلهم عرض تذكير
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-semibold text-forest-deep">أظهر اللي غايبين أكتر من</label>
        <select
          value={minDays}
          onChange={(e) => setMinDays(Number(e.target.value))}
          className="rounded-lg border border-forest/15 px-3 py-1.5 text-sm"
        >
          <option value={7}>أسبوع</option>
          <option value={14}>أسبوعين</option>
          <option value={30}>شهر</option>
          <option value={60}>شهرين</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-fire" />
        </div>
      ) : customers.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          مفيش عملاء غايبين بالمدة دي دلوقتي
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-forest/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-forest/5 text-right">
              <tr>
                <th className="px-4 py-3 font-semibold text-forest-deep">العميل</th>
                <th className="px-4 py-3 font-semibold text-forest-deep">آخر طلب</th>
                <th className="px-4 py-3 font-semibold text-forest-deep">غايب من</th>
                <th className="px-4 py-3 font-semibold text-forest-deep">تواصل</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.user_id} className="border-t border-forest/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-forest-deep">{c.full_name || "بدون اسم"}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.last_order_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-chili">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.round(c.days_since_last_order)} يوم
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${c.email}?subject=مشتقناك في بروست!&body=إزيك، لاحظنا إنك مطلبتش من فترة، وعملنالك عرض خاص عشان ترجعلنا`}
                      className="flex items-center gap-1.5 rounded-full border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-forest/5"
                    >
                      <Mail className="h-3.5 w-3.5" /> ابعتله إيميل
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
