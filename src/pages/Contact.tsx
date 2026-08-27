import { useSettings, buildWhatsAppLink } from "@/lib/useSettings";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export function Contact() {
  const { settings } = useSettings();

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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-forest/10 bg-white p-6">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-fire" />
          <div>
            <h4 className="font-display text-sm font-semibold text-forest-deep">العنوان</h4>
            <p className="mt-1 text-sm text-muted-foreground">{settings.addressAr}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-forest/10 bg-white p-6">
          <Clock className="mt-1 h-5 w-5 shrink-0 text-fire" />
          <div>
            <h4 className="font-display text-sm font-semibold text-forest-deep">مواعيد العمل</h4>
            <p className="mt-1 text-sm text-muted-foreground">{settings.hoursAr}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-forest/10">
        <div className="flex h-64 items-center justify-center bg-muted text-sm text-muted-foreground">
          خريطة الموقع — 2 ميدان سيوف، تاني الرمل، الإسكندرية
        </div>
      </div>
    </div>
  );
}
