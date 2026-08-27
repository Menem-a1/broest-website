import { Link } from "react-router-dom";
import { Phone, MessageCircle, Star, Clock, MapPin, Flame } from "lucide-react";
import { useSettings, buildWhatsAppLink } from "@/lib/useSettings";
import { useMenu } from "@/lib/useMenu";
import { MenuItemCard } from "@/components/MenuItemCard";

// دي القيم اللي بتظهر في قسم "الأكتر طلباً" — تقدر تغيرها بتعديل الأرقام هنا
const RATING_VALUE = 4.2;
const RATING_COUNT = 930;
const FEATURED_IDS = ["family-meal", "zinger", "mix-meals", "chicken-smoked-mix"];

export function Home() {
  const { settings } = useSettings();
  const { menu } = useMenu();
  const featured = menu.filter((m) => FEATURED_IDS.includes(m.id));

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-fire/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-chili/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fire/15 px-3 py-1 text-xs font-semibold text-fire-light">
              <Flame className="h-3.5 w-3.5" /> أول تندوري بروست في الإسكندرية
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-cream md:text-6xl">
              دجاج مقرمش
              <br />
              <span className="text-fire">من غير كلام كتير</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/70">
              وجبات عائلية، ساندوتشات بروست، وكريسبي طازة كل يوم. اطلب دلوقتي ووصلها لحد عندك في أقل وقت.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="rounded-full bg-fire px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-forest-deep transition-transform hover:scale-[1.03] active:scale-95"
              >
                اطلب دلوقتي
              </Link>
              <a
                href={buildWhatsAppLink(settings.whatsappNumber, "أهلاً بروست، عايز أعرف تفاصيل الطلب")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3.5 font-display text-sm font-semibold text-cream transition-colors hover:border-fire hover:text-fire-light"
              >
                <MessageCircle className="h-4 w-4" /> واتساب
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-6 text-sm text-cream/60">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-fire text-fire" />
                <span className="font-semibold text-cream">{RATING_VALUE}</span>
                <span>({RATING_COUNT} تقييم)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-fire" />
                <span>مفتوح دلوقتي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-fire" />
                <span>تاني الرمل</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex h-72 w-72 items-center justify-center md:h-96 md:w-96">
            <div className="clip-splash absolute inset-0 bg-gradient-to-br from-fire to-chili" />
            <span className="relative font-display text-3xl font-bold text-cream drop-shadow-lg md:text-4xl">
              🍗
              <br />
              <span className="text-xl md:text-2xl">قرمشة أول قضمة</span>
            </span>
          </div>
        </div>
      </section>

      {/* QUICK ORDER STRIP */}
      <section className="border-b border-forest/10 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 text-center md:px-8">
          <a href={settings.phoneHref} className="flex items-center gap-2 font-display text-forest-deep">
            <Phone className="h-4 w-4 text-fire" /> {settings.phoneDisplay}
          </a>
          <span className="hidden text-forest/20 md:block">|</span>
          <span className="text-sm text-muted-foreground">{settings.hoursAr}</span>
          <span className="hidden text-forest/20 md:block">|</span>
          <span className="text-sm text-muted-foreground">{settings.avgSpendAr}</span>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-fire">
              الأكتر طلباً
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold text-forest-deep">
              مفضّلين العملاء
            </h2>
          </div>
          <Link
            to="/menu"
            className="hidden font-display text-sm font-semibold text-fire hover:underline md:block"
          >
            كل المنيو ←
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        <Link
          to="/menu"
          className="mt-8 block text-center font-display text-sm font-semibold text-fire hover:underline md:hidden"
        >
          كل المنيو ←
        </Link>
      </section>

      {/* WHY US */}
      <section className="bg-forest-deep px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {[
            { title: "طازة كل يوم", desc: "بنقلي الدجاج طازة من غير أي تخزين، من أول ما تطلب لحد ما يوصلك." },
            { title: "توصيل سريع", desc: "أوردر بيوصلك في أسرع وقت، حار وطازة زي ما طلبته بالظبط." },
            { title: "وصفة تندوري مميزة", desc: "توابل مخصوصة بنسبة سرية، بتدي طعم مختلف عن أي بروست تاني." },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-cream/10 p-6">
              <span className="font-display text-3xl font-bold text-fire">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-cream">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
