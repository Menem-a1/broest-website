// =====================================================
// ملف: ClosedBanner.tsx
// الغرض: يظهر تنبيه واضح لما يكون الفرع مقفول، ويمنع
// المتابعة للطلب لحد ما يفتح تاني
// =====================================================
import { Clock } from "lucide-react";
import { formatHoursAr } from "@/lib/useBranches";

type Props = {
  opensAt: string;
  closesAt: string;
};

export function ClosedBanner({ opensAt, closesAt }: Props) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-chili/30 bg-chili/5 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chili/15 text-chili">
        <Clock className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-sm font-bold text-chili">المطعم مقفول دلوقتي</p>
        <p className="mt-0.5 text-xs text-chili/80">{formatHoursAr(opensAt, closesAt)}</p>
      </div>
    </div>
  );
}
