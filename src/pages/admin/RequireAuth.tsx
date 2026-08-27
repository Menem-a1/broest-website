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
