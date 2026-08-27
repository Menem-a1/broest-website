// =====================================================
// ملف: AuthContext.tsx
// الغرض: يتابع هل صاحب المطعم مسجل دخول أو لأ،
// وبيوفر دوال تسجيل الدخول والخروج لأي صفحة في لوحة التحكم
// =====================================================
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // نتأكد لو المستخدم مسجل دخول بالفعل من قبل (الجلسة محفوظة في المتصفح)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // نتابع أي تغيير في حالة تسجيل الدخول (دخول/خروج)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // بنترجم أشهر رسائل الخطأ للعربي عشان تكون واضحة
      if (error.message.includes("Invalid login credentials")) {
        return { error: "الإيميل أو الباسورد غلط" };
      }
      return { error: "حصلت مشكلة، حاول تاني" };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
