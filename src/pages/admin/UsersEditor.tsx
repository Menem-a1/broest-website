// =====================================================
// ملف: UsersEditor.tsx
// الغرض: إدارة حسابات لوحة التحكم — من هنا تقدر تضيف
// صاحب مطعم جديد بصلاحيات محدودة (يشوف الطلبات بس)،
// أو تضيف developer تاني بكل الصلاحيات
// ملحوظة: الشخص لازم يكون عنده حساب مسجل بالفعل في
// Supabase Authentication قبل ما تقدر تحدد دوره من هنا
// =====================================================
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, UserPlus, Trash2, ShieldCheck, User } from "lucide-react";

type AdminUser = {
  user_id: string;
  email: string;
  role: "developer" | "owner";
  created_at: string;
};

export function UsersEditor() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"owner" | "developer">("owner");
  const [formError, setFormError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_admin_users");
    if (!error) {
      setUsers(data || []);
    } else {
      console.error("خطأ في تحميل المستخدمين:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function addUser() {
    setFormError(null);
    if (!newEmail.trim()) {
      setFormError("لازم تكتب الإيميل");
      return;
    }
    setAdding(true);
    const { error } = await supabase.rpc("set_admin_role_by_email", {
      target_email: newEmail.trim(),
      target_role: newRole,
    });
    setAdding(false);
    if (!error) {
      setNewEmail("");
      loadUsers();
    } else {
      console.error("خطأ في إضافة المستخدم:", error);
      setFormError(error.message);
    }
  }

  async function removeUser(user: AdminUser) {
    if (!confirm(`متأكد إنك عايز تشيل صلاحيات "${user.email}"؟ هيبقى مش عنده أي دخول للوحة التحكم.`))
      return;
    const { error } = await supabase.rpc("remove_admin_role", { target_user_id: user.user_id });
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
    } else {
      console.error("خطأ في حذف صلاحيات المستخدم:", error);
      alert(`حصلت مشكلة:\n${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-deep">المستخدمين والصلاحيات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          "المطوّر" (إنت) عنده كل الصلاحيات. "صاحب المطعم" بيشوف صفحة الطلبات بس،
          وباقي الصفحات مش ظاهرة عنده خالص.
        </p>
      </div>

      {/* إضافة مستخدم جديد */}
      <div className="mb-6 rounded-xl border border-forest/10 bg-white p-5">
        <h2 className="mb-3 font-display text-sm font-bold text-forest-deep">إضافة صلاحية لحساب موجود</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          مهم: الشخص لازم يكون عنده حساب متسجل بالفعل من Supabase Dashboard ← Authentication ← Add user
          (بإيميل وباسورد)، قبل ما تقدر تحدد دوره من هنا. لو الإيميل مش موجود هيوريك رسالة توضح كده.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              الإيميل
            </label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="owner@example.com"
              dir="ltr"
              className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">الدور</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "owner" | "developer")}
              className="w-full rounded-lg border border-forest/15 px-3 py-2 text-sm sm:w-40"
            >
              <option value="owner">صاحب مطعم (محدود)</option>
              <option value="developer">مطوّر (كل الصلاحيات)</option>
            </select>
          </div>
          <button
            onClick={addUser}
            disabled={adding}
            className="flex items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            إضافة
          </button>
        </div>
        {formError && <p className="mt-2 text-xs font-semibold text-chili">{formError}</p>}
      </div>

      {/* قايمة المستخدمين الحاليين */}
      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between rounded-xl border border-forest/10 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  user.role === "developer" ? "bg-fire/15 text-fire" : "bg-forest/10 text-forest"
                }`}
              >
                {user.role === "developer" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div>
                <p dir="ltr" className="text-right text-sm font-semibold text-forest-deep">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.role === "developer" ? "مطوّر — كل الصلاحيات" : "صاحب مطعم — الطلبات بس"}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeUser(user)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-chili/30 text-chili hover:bg-chili/10"
              title="حذف الصلاحية"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">مفيش مستخدمين مضافين لسه</p>
        )}
      </div>
    </div>
  );
}
