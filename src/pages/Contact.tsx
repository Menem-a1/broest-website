import { useSettings, buildWhatsAppLink } from "@/lib/useSettings";
import { useBranches, isBranchOpenNow, formatHoursAr } from "@/lib/useBranches";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export function Contact() {
  const { settings } = useSettings();
  const { branches, loading } = useBranches();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-fire">
          تواصل معنا
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest-deep">إزاي نساعدك؟</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <a
          href={settings.phoneHref}
          className="flex flex-col items-center gap-3 rounded-xl border border-forest/10 bg-paper p-8 text-center transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fire text-forest-deep">
            <Phone className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-forest-deep">اتصل بينا</h3>
          <p className="font-price text-xl font-bold text-fire">{settings.phoneDisplay}</p>
        </a>

        <a
          href={buildWhatsAppLink(settings.whatsappNumber, "أهلاً بروست، عندي استفسار")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 rounded-xl border border-forest/10 bg-paper p-8 text-center transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-forest-deep">واتساب</h3>
          <p className="text-sm text-muted-foreground">رد سريع على استفساراتك</p>
        </a>
      </div>

      {/* فروع المطعم */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-forest-deep">فروعنا</h2>

        {loading && <p className="text-sm text-muted-foreground">بنجيب الفروع...</p>}

        <div className="flex flex-col gap-4">
          {branches.map((branch) => {
            const open = isBranchOpenNow(branch.opensAt, branch.closesAt);
            return (
              <div key={branch.id} className="overflow-hidden rounded-xl border border-forest/10 bg-white">
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-forest-deep">
                      {branch.nameAr}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        open ? "bg-emerald-100 text-emerald-700" : "bg-chili/10 text-chili"
                      }`}
                    >
                      {open ? "مفتوح دلوقتي" : "مقفول دلوقتي"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
                      <span className="text-muted-foreground">{branch.addressAr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-fire" />
                      <span className="text-muted-foreground">
                        {formatHoursAr(branch.opensAt, branch.closesAt)}
                      </span>
                    </div>
                    {branch.phoneDisplay && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-fire" />
                        <a href={`tel:${branch.phoneDisplay}`} className="text-forest-deep hover:underline">
                          {branch.phoneDisplay}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* خريطة جوجل ماب للفرع ده */}
                {branch.latitude && branch.longitude && (
                  <div className="h-56 w-full">
                    <iframe
                      title={`خريطة ${branch.nameAr}`}
                      className="h-full w-full border-0"
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && branches.length === 0 && (
          <p className="text-sm text-muted-foreground">لسه مفيش فروع مضافة</p>
        )}
      </div>
    </div>
  );
}
