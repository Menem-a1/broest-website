// =====================================================
// ملف: PublicErrorBoundary.tsx
// الغرض: لو حصل خطأ برمجي غير متوقع في الموقع العام (المنيو، السلة،
// الطلب)، بيظهر للعميل رسالة واضحة وزرار "حدّث الصفحة" بدل ما
// يشوف شاشة بيضا فاضية من غير أي تفسير
// =====================================================
import { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class PublicErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("خطأ في الموقع العام:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-forest px-6 text-center"
          dir="rtl"
        >
          <AlertTriangle className="h-14 w-14 text-fire" />
          <h1 className="font-display text-2xl font-bold text-paper">
            حصلت مشكلة بسيطة
          </h1>
          <p className="max-w-sm text-sm text-paper/80">
            حاول تحدّث الصفحة، وهنكون في الخدمة. لو المشكلة استمرت، تقدر
            تتواصل معانا مباشرة.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 flex items-center gap-2 rounded-full bg-fire px-6 py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            حدّث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
