// =====================================================
// ملف: Login.tsx
// الغرض: صفحة تسجيل الدخول للوحة التحكم — /admin/login
// =====================================================
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2 } from "lucide-react";

export function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // لو أصلاً مسجل دخول، وديه على طول للوحة التحكم
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4" dir="rtl">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fire text-forest-deep">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">لوحة تحكم بروست</h1>
          <p className="mt-1 text-sm text-muted-foreground">سجّل دخول عشان تعدّل على الموقع</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">الإيميل</label>
            <div className="flex items-center gap-2 rounded-lg border border-forest/20 bg-white px-3 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="admin@broest.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">الباسورد</label>
            <div className="flex items-center gap-2 rounded-lg border border-forest/20 bg-white px-3 py-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-chili/10 px-3 py-2 text-sm text-chili">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-fire py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> بيدخل...
              </>
            ) : (
              "دخول"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
