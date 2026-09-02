import { useSettings } from "@/lib/useSettings";
import { useBranches, formatHoursAr } from "@/lib/useBranches";
import { useFooterSettings } from "@/lib/useFooterSettings";
import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Globe, Image as ImageIcon, MessageCircle } from "lucide-react";

// دي قيم تسويقية بسيطة مش محتاجة تتعدل باستمرار، فسايبينها هنا
// (لو حبيت تضيفها للوحة التحكم بعدين، سهل تتنقل لجدول restaurant_settings)
const TAGLINE_AR = "دجاج مقرمش. من غير كلام كتير.";
const RATING_VALUE = 4.2;
const RATING_COUNT = 930;

export function SiteFooter() {
  const { settings } = useSettings();
  const { branches } = useBranches();
  const { settings: footer } = useFooterSettings();
  const primaryBranch = branches[0];

  const socialLinks = [
    { url: footer.facebookUrl, icon: Globe, label: "فيسبوك" },
    { url: footer.instagramUrl, icon: ImageIcon, label: "إنستجرام" },
    { url: footer.whatsappUrl, icon: MessageCircle, label: "واتساب" },
  ].filter((s) => s.url.trim() !== "");

  return (
    <footer className="bg-forest-deep px-4 pb-28 pt-12 text-cream/80 md:px-8 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-cream">{settings.nameAr}</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/60">
            {TAGLINE_AR}
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-fire hover:text-forest-deep"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-fire-light">
            تواصل معنا
          </h4>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
              <a href={settings.phoneHref} className="hover:text-cream">
                {settings.phoneDisplay}
              </a>
            </li>
            {primaryBranch && (
              <>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
                  <span>{primaryBranch.addressAr}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-fire" />
                  <span>{formatHoursAr(primaryBranch.opensAt, primaryBranch.closesAt)}</span>
                </li>
              </>
            )}
            <li>
              <Link to="/contact" className="text-fire-light hover:underline">
                شوف كل الفروع ←
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-fire-light">
            التقييم
          </h4>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-price text-2xl font-bold text-cream">
              {RATING_VALUE}
            </span>
            <div className="text-fire">★★★★☆</div>
          </div>
          <p className="mt-1 text-sm text-cream/60">
            بناءً على {RATING_COUNT} تقييم · {settings.avgSpendAr}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} {settings.nameAr} — كل الحقوق محفوظة
      </div>

      {footer.designerShowName && footer.designerName && (
        <div
          className="mx-auto mt-2 max-w-6xl text-center text-cream/40"
          style={{ fontSize: `${footer.designerFontSize}px`, opacity: footer.designerOpacity }}
        >
          {footer.designerShowContact && footer.designerContactUrl ? (
            <a
              href={footer.designerContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {footer.designerName} — تواصل
            </a>
          ) : (
            <span>{footer.designerName}</span>
          )}
        </div>
      )}
    </footer>
  );
}
