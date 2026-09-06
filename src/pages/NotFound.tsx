import { Link } from "react-router-dom";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

export function NotFound() {
  return (
    <section
      className="flex min-h-[65vh] items-center justify-center px-4 py-16"
      aria-labelledby="not-found-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-fire/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-forest/10" />

        <div className="relative mx-auto flex max-w-lg flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-cream shadow-sm">
            <UtensilsCrossed className="h-8 w-8" aria-hidden="true" />
          </div>

          <p className="font-display text-7xl font-bold leading-none text-fire sm:text-8xl">
            404
          </p>

          <h1
            id="not-found-title"
            className="mt-5 font-display text-3xl font-bold text-forest-deep sm:text-4xl"
          >
            الصفحة دي مش موجودة
          </h1>

          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            شكل الرابط خدنا لمكان غلط. ارجع للرئيسية واختار اللي نفسك فيه من
            المنيو.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-chili focus:outline-none focus:ring-2 focus:ring-fire focus:ring-offset-2"
          >
            الرجوع للصفحة الرئيسية
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
