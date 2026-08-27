// =====================================================
// ملف: supabase.ts
// الغرض: نقطة الاتصال الوحيدة بقاعدة البيانات
// أي ملف تاني في الموقع محتاج يقرا أو يكتب بيانات
// بيستورد "supabase" من هنا بدل ما يتصل بنفسه
// =====================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // لو البيانات دي مش موجودة، الموقع هيفشل يتصل بالبيانات
  // ده بيحصل لو نسيت تحط ملف .env أو إعدادات Vercel
  console.error(
    "بيانات الاتصال بقاعدة البيانات مش موجودة. تأكد من ملف .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
