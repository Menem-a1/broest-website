// =====================================================
// ملف: RequireAuth.tsx
// الغرض: يمنع أي حد يدخل صفحات لوحة التحكم من غير
// ما يكون مسجل دخول أولًا
// =====================================================
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// بتلف الصفحات اللي مخصوصة بـ developer بس (المنيو، الفروع، المراجعات،
// الصفحة الرئيسية، الإعدادات). لو owner حاول يدخل رابط الصفحة مباشرة
// من غير ما يمر بالقائمة، بنرجّعه لصفحة الطلبات بدل ما نوريه الصفحة
export function RequireDeveloper({ children }: { children: ReactNode }) {
  const { role, roleLoading } = useAuth();

  if (roleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  if (role !== "developer") {
    return <Navigate to="/admin/orders" replace />;
  }

  return <>{children}</>;
}
