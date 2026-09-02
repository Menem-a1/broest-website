// =====================================================
// ملف: AuthContext.tsx
// الغرض: يتابع هل صاحب المطعم مسجل دخول أو لأ،
// وبيوفر دوال تسجيل الدخول والخروج لأي صفحة في لوحة التحكم
// =====================================================
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AdminRole = "developer" | "owner" | null;

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  role: AdminRole;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AdminRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // بيجيب دور اليوزر (developer أو owner) من جدول admin_roles
  // بعد ما نتأكد إنه مسجل دخول
  async function loadRole(userId: string | undefined) {
    if (!userId) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const { data } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as AdminRole) ?? null);
    setRoleLoading(false);
  }

  useEffect(() => {
    // نتأكد لو المستخدم مسجل دخول بالفعل من قبل (الجلسة محفوظة في المتصفح)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      loadRole(data.session?.user?.id);
    });

    // نتابع أي تغيير في حالة تسجيل الدخول (دخول/خروج)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadRole(newSession?.user?.id);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // حماية من محاولات الدخول المتكررة: بعد 5 محاولات فاشلة، قفل 5 دقايق
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 5 * 60 * 1000;

  function getLockoutState() {
    const raw = localStorage.getItem("admin_login_attempts");
    if (!raw) return { count: 0, lockedUntil: 0 };
    try {
      return JSON.parse(raw);
    } catch {
      return { count: 0, lockedUntil: 0 };
    }
  }

  async function signIn(email: string, password: string) {
    const state = getLockoutState();
    if (state.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((state.lockedUntil - Date.now()) / 60000);
      return { error: `محاولات كتير غلط، جرب تاني بعد ${minutesLeft} دقيقة` };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const newCount = state.count + 1;
      const newState =
        newCount >= MAX_ATTEMPTS
          ? { count: 0, lockedUntil: Date.now() + LOCKOUT_MS }
          : { count: newCount, lockedUntil: 0 };
      localStorage.setItem("admin_login_attempts", JSON.stringify(newState));

      if (newCount >= MAX_ATTEMPTS) {
        return { error: "محاولات كتير غلط، الحساب مقفول 5 دقايق" };
      }
      if (error.message.includes("Invalid login credentials")) {
        return { error: "الإيميل أو الباسورد غلط" };
      }
      return { error: "حصلت مشكلة، حاول تاني" };
    }

    localStorage.removeItem("admin_login_attempts");
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // تسجيل خروج تلقائي بعد 20 دقيقة من غير أي حركة (كليك أو كتابة)
  // بيحمي لو حد نسي يعمل logout على جهاز عام (زي مقهى إنترنت)
  useEffect(() => {
    if (!session) return;
    const TIMEOUT_MS = 20 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        supabase.auth.signOut();
      }, TIMEOUT_MS);
    }

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, loading, role, roleLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
