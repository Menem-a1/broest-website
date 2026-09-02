// =====================================================
// ملف: Login.tsx
// الغرض: صفحة تسجيل الدخول للوحة التحكم — /admin/login
// =====================================================
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2, AlertCircle, Clock } from "lucide-react";

export function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // تتبع محاولات الدخول الفاشلة
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // جلب بيانات المحاولات من localStorage عند فتح الصفحة
  useEffect(() => {
    const stored = localStorage.getItem("loginAttempts");
    const storedLockout = localStorage.getItem("loginLockout");

    if (stored) setFailedAttempts(parseInt(stored));
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        // انتهت مدة الـ lockout
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("loginLockout");
        setFailedAttempts(0);
      }
    }
  }, []);

  // تحديث الوقت المتبقي كل ثانية
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setTimeRemaining(0);
        localStorage.removeItem("loginLockout");
        localStorage.removeItem("loginAttempts");
        setFailedAttempts(0);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // حساب عدد المحاولات المتبقية
  const attemptsRemaining = Math.max(0, 5 - failedAttempts);

  // حساب وقت الـ lockout بناءً على عدد المحاولات الفاشلة
  function calculateLockoutDuration(attempts: number): number {
    if (attempts < 5) return 0; // بلا lockout
    if (attempts === 5) return 1 * 60 * 1000; // 1 دقيقة
    if (attempts === 8) return 2 * 60 * 1000; // 2 دقيقة
    if (attempts === 11) return 5 * 60 * 1000; // 5 دقائق
    if (attempts === 14) return 10 * 60 * 1000; // 10 دقائق
    return 10 * 60 * 1000; // بعدها دايماً 10 دقائق
  }

  // لو أصلاً مسجل دخول، وديه على طول للوحة التحكم
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // فحص الـ lockout
    if (lockoutUntil && lockoutUntil > Date.now()) {
      const seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      const minutes = Math.ceil(seconds / 60);
      setError(
        `تم منع محاولات الدخول مؤقتاً. جرب بعد ${minutes} دقيقة (${seconds} ثانية)`
      );
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);

    if (signInError) {
      // محاولة فاشلة
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts.toString());

      // حساب الـ lockout الجديد
      const lockoutDuration = calculateLockoutDuration(newAttempts);

      if (lockoutDuration > 0) {
        const newLockoutUntil = Date.now() + lockoutDuration;
        setLockoutUntil(newLockoutUntil);
        localStorage.setItem("loginLockout", newLockoutUntil.toString());

        const minutes = Math.ceil(lockoutDuration / 60000);
        setError(
          `محاولات كثيرة! تم منع الدخول لـ ${minutes} دقيقة. جرب بعدين.`
        );
      } else {
        const newAttemptsRemaining = 5 - newAttempts;
        setError(
          `${signInError} — لديك ${newAttemptsRemaining} محاولات متبقية`
        );
      }
    } else {
      // نجح الدخول — امسح السجل
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("loginLockout");
      setFailedAttempts(0);
      setLockoutUntil(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4" dir="rtl">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fire text-forest-deep">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-forest-deep">
            لوحة تحكم بروست
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سجّل دخول عشان تعدّل على الموقع
          </p>
        </div>

        {/* رسالة الـ lockout الحمراء */}
        {lockoutUntil && lockoutUntil > Date.now() && (
          <div className="mb-4 flex gap-2 rounded-lg bg-chili/15 p-3 text-sm text-chili">
            <Clock className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">الدخول معطل مؤقتاً</p>
              <p className="text-xs mt-1">
                جاول بعد {Math.ceil(timeRemaining / 60)} دقائق
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              الإيميل
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-forest/20 bg-white px-3 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={lockoutUntil && lockoutUntil > Date.now()}
                className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
                placeholder="admin@broest.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-deep">
              الباسورد
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-forest/20 bg-white px-3 py-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockoutUntil && lockoutUntil > Date.now()}
                className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex gap-2 rounded-lg bg-chili/10 px-3 py-2 text-sm text-chili">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* عرض عدد المحاولات المتبقية (لو ما في lockout) */}
          {failedAttempts > 0 && failedAttempts < 5 && (
            <p className="text-xs text-muted-foreground text-center">
              {attemptsRemaining} محاولات متبقية
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              (lockoutUntil && lockoutUntil > Date.now())
            }
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-fire py-3 font-display text-sm font-bold text-forest-deep transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> بيدخل...
              </>
            ) : lockoutUntil && lockoutUntil > Date.now() ? (
              <>
                <Clock className="h-4 w-4" /> مقفول لـ {Math.ceil(timeRemaining / 60)} د
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