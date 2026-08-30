// =====================================================
// ملف: AdminErrorBoundary.tsx
// الغرض: لو أي صفحة في لوحة التحكم فيها خطأ برمجي غير متوقع،
// بيظهر رسالة واضحة بدل ما الصفحة تفضل بيضا بالكامل
// =====================================================
import { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("خطأ في لوحة التحكم:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-chili" />
          <h2 className="font-display text-xl font-bold text-forest-deep">
            حصلت مشكلة في عرض الصفحة دي
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            جرب تحدّث الصفحة (Refresh). لو المشكلة استمرت، قول لمين بنى الموقع
            عشان يراجع الكود.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-fire px-6 py-2.5 text-sm font-semibold text-forest-deep"
          >
            حدّث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
