// =====================================================
// ملف: CustomerAuthContext.tsx
// الغرض: تسجيل دخول العميل (اللي بيطلب أكل) بجوجل — اختياري
// بالكامل، العميل يقدر يطلب كضيف من غيره.
// ده منفصل تمامًا عن AuthContext.tsx اللي بيتحكم في دخول
// الأدمن (المطور وصاحب المطعم)، عشان صلاحيات العميل
// متتلخبطش أبدًا مع صلاحيات لوحة التحكم.
// =====================================================
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type CustomerAuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // بعد تسجيل الدخول، نرجّع العميل لنفس الصفحة اللي كان فيها
        redirectTo: window.location.href,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <CustomerAuthContext.Provider value={{ session, loading, signInWithGoogle, signOut }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
