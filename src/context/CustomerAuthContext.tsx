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
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
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

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "الإيميل ده مسجل بالفعل، جرب تسجيل الدخول" };
      }
      return { error: "حصلت مشكلة في التسجيل، حاول تاني" };
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: "الإيميل أو الباسورد غلط" };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <CustomerAuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
