import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Shield, User, Users as UsersIcon, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const PERMISSIONS = [
  { key: "pos.access", group: "pos" },
  { key: "pos.discount", group: "pos" },
  { key: "pos.cancel", group: "pos" },
  { key: "inventory.view", group: "inventory" },
  { key: "inventory.create", group: "inventory" },
  { key: "inventory.edit", group: "inventory" },
  { key: "inventory.delete", group: "inventory" },
  { key: "inventory.stock", group: "inventory" },
  { key: "invoices.view", group: "invoices" },
  { key: "invoices.cancel", group: "invoices" },
  { key: "returns.create", group: "returns" },
  { key: "customers.view", group: "customers" },
  { key: "customers.create", group: "customers" },
  { key: "customers.edit", group: "customers" },
  { key: "reports.view", group: "reports" },
  { key: "users.manage", group: "users" },
  { key: "settings.manage", group: "settings" },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  admin: PERMISSIONS.map(p => p.key),
  manager: ["pos.access", "pos.discount", "pos.cancel", "inventory.view", "inventory.create", "inventory.edit", "inventory.stock", "invoices.view", "invoices.cancel", "returns.create", "customers.view", "customers.create", "customers.edit", "reports.view"],
  cashier: ["pos.access", "invoices.view", "customers.view", "customers.create"],
};

export default function Users() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ username: "", password: "", name: "", email: "", phone: "", role: "cashier" as "admin" | "manager" | "cashier" | "warehouse", permissions: ROLE_DEFAULTS.cashier, isActive: true });

  const { data: users, refetch } = trpc.users.list.useQuery();
  const createUser = trpc.users.create.useMutation({ onSuccess: () => { refetch(); setShowAddDialog(false); toast.success(isAr ? "تم إضافة المستخدم" : "User added"); } });
  const updateUser = trpc.users.update.useMutation({ onSuccess: () => { refetch(); setEditUser(null); toast.success(isAr ? "تم تحديث المستخدم" : "User updated"); } });
  const deleteUser = trpc.users.delete.useMutation({ onSuccess: () => { refetch(); toast.success(isAr ? "تم حذف المستخدم" : "User deleted"); } });

  const resetForm = () => setForm({ username: "", password: "", name: "", email: "", phone: "", role: "cashier", permissions: ROLE_DEFAULTS.cashier, isActive: true });

  const openEdit = (u: any) => {
    setForm({ username: u.username || "", password: "", name: u.name || "", email: u.email || "", phone: u.phone || "", role: u.role || "cashier", permissions: u.permissions || ROLE_DEFAULTS[u.role] || [], isActive: u.isActive !== false });
    setEditUser(u);
  };

  const handleRoleChange = (role: "admin" | "manager" | "cashier" | "warehouse") => {
    setForm(f => ({ ...f, role, permissions: ROLE_DEFAULTS[role] || [] }));
  };

  const togglePermission = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error(isAr ? "يرجى إدخال اسم المستخدم" : "Name required"); return; }
    const permObjects = form.permissions.map(p => {
      const parts = p.split(".");
      return { module: parts[0] || p, action: parts[1] || "access", allowed: true };
    });
    if (editUser) {
      await updateUser.mutateAsync({ id: editUser.id, name: form.name, email: form.email || undefined, phone: form.phone || undefined, role: form.role, isActive: form.isActive, password: form.password || undefined, permissions: permObjects });
    } else {
      if (!form.username) { toast.error(isAr ? "يرجى إدخال اسم المستخدم" : "Username required"); return; }
      if (!form.password) { toast.error(isAr ? "يرجى إدخال كلمة المرور" : "Password required"); return; }
      await createUser.mutateAsync({ username: form.username, password: form.password, name: form.name, email: form.email || undefined, phone: form.phone || undefined, role: form.role, isActive: form.isActive, permissions: permObjects });
    }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = { admin: isAr ? "مدير" : "Admin", manager: isAr ? "مشرف" : "Manager", cashier: isAr ? "كاشير" : "Cashier" };
    return map[role] || role;
  };

  const roleVariant = (role: string): "default" | "secondary" | "outline" => {
    const map: Record<string, "default" | "secondary" | "outline"> = { admin: "default", manager: "secondary", cashier: "outline" };
    return map[role] || "outline";
  };

  const permGroups = Array.from(new Set(PERMISSIONS.map(p => p.group)));

  const groupLabel = (g: string) => {
    const map: Record<string, string> = { pos: isAr ? "نقطة البيع" : "POS", inventory: isAr ? "المخزون" : "Inventory", invoices: isAr ? "الفواتير" : "Invoices", returns: isAr ? "المرتجعات" : "Returns", customers: isAr ? "العملاء" : "Customers", reports: isAr ? "التقارير" : "Reports", users: isAr ? "المستخدمون" : "Users", settings: isAr ? "الإعدادات" : "Settings" };
    return map[g] || g;
  };

  const permLabel = (key: string) => {
    const map: Record<string, string> = {
      "pos.access": isAr ? "الوصول لنقطة البيع" : "Access POS",
      "pos.discount": isAr ? "تطبيق الخصومات" : "Apply Discounts",
      "pos.cancel": isAr ? "إلغاء المبيعات" : "Cancel Sales",
      "inventory.view": isAr ? "عرض المخزون" : "View Inventory",
      "inventory.create": isAr ? "إضافة منتجات" : "Add Products",
      "inventory.edit": isAr ? "تعديل المنتجات" : "Edit Products",
      "inventory.delete": isAr ? "حذف المنتجات" : "Delete Products",
      "inventory.stock": isAr ? "إدارة المخزون" : "Manage Stock",
      "invoices.view": isAr ? "عرض الفواتير" : "View Invoices",
      "invoices.cancel": isAr ? "إلغاء الفواتير" : "Cancel Invoices",
      "returns.create": isAr ? "إنشاء مرتجعات" : "Create Returns",
      "customers.view": isAr ? "عرض العملاء" : "View Customers",
      "customers.create": isAr ? "إضافة عملاء" : "Add Customers",
      "customers.edit": isAr ? "تعديل العملاء" : "Edit Customers",
      "reports.view": isAr ? "عرض التقارير" : "View Reports",
      "users.manage": isAr ? "إدارة المستخدمين" : "Manage Users",
      "settings.manage": isAr ? "إدارة الإعدادات" : "Manage Settings",
    };
    return map[key] || key;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("users.title")}</h1>
        <Button className="gap-2" onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus size={16} />
          {t("users.add")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("users.name")}</TableHead>
                <TableHead>{t("customers.email")}</TableHead>
                <TableHead>{t("users.role")}</TableHead>
                <TableHead>{isAr ? "آخر دخول" : "Last Login"}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(u.role)}>{roleLabel(u.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastSignedIn ? format(new Date(u.lastSignedIn), "dd/MM/yyyy", { locale }) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive !== false ? "default" : "secondary"}>
                      {u.isActive !== false ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                        <Edit size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm(isAr ? "هل تريد حذف هذا المستخدم؟" : "Delete this user?")) deleteUser.mutate({ id: u.id }); }}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!users || users.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <UsersIcon size={32} className="mx-auto mb-2 opacity-30" />
              <p>{t("common.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editUser} onOpenChange={v => { if (!v) { setShowAddDialog(false); setEditUser(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editUser ? t("users.edit") : t("users.add")}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">{isAr ? "المعلومات" : "Info"}</TabsTrigger>
              <TabsTrigger value="permissions">{isAr ? "الصلاحيات" : "Permissions"}</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>{t("users.name")} *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                {!editUser && (
                  <div className="space-y-1">
                    <Label>{isAr ? "اسم المستخدم" : "Username"} *</Label>
                    <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} dir="ltr" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label>{isAr ? "كلمة المرور" : "Password"}{editUser ? (isAr ? " (اتركها فارغة للإبقاء على القديمة)" : " (leave blank to keep current)") : " *"}</Label>
                  <Input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} type="password" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{t("customers.email")}</Label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{t("customers.phone")}</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{t("users.role")}</Label>
                  <Select value={form.role} onValueChange={handleRoleChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{isAr ? "مدير" : "Admin"}</SelectItem>
                      <SelectItem value="manager">{isAr ? "مشرف" : "Manager"}</SelectItem>
                      <SelectItem value="cashier">{isAr ? "كاشير" : "Cashier"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                  <Label>{isAr ? "حساب نشط" : "Active Account"}</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="mt-3">
              <div className="space-y-4">
                {permGroups.map(group => (
                  <div key={group}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {groupLabel(group)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSIONS.filter(p => p.group === group).map(perm => (
                        <div key={perm.key} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer"
                          onClick={() => togglePermission(perm.key)}>
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${form.permissions.includes(perm.key) ? "bg-primary text-primary-foreground" : "border border-input"}`}>
                            {form.permissions.includes(perm.key) && <Check size={10} />}
                          </div>
                          <span className="text-xs">{permLabel(perm.key)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditUser(null); }}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
