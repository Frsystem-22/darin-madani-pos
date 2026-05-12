import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Login() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message || (isAr ? "بيانات الدخول غير صحيحة" : "Invalid credentials"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error(isAr ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A96E, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A96E, transparent)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: "#C9A96E", background: "rgba(201,169,110,0.1)" }}>
              <span className="text-3xl font-bold" style={{ color: "#C9A96E" }}>DM</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest" style={{ color: "#C9A96E" }}>
                DARIN MADANI
              </h1>
              <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">Fashion House</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(201,169,110,0.2)" }}>
          <CardHeader className="pb-2 text-center">
            <h2 className="text-lg font-semibold text-white">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </h2>
            <p className="text-sm text-gray-400">
              {isAr ? "نظام إدارة المبيعات" : "Sales Management System"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">
                  {isAr ? "اسم المستخدم" : "Username"}
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                    style={{ [isAr ? "right" : "left"]: "12px" }} />
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={isAr ? "أدخل اسم المستخدم" : "Enter username"}
                    autoComplete="username"
                    dir="ltr"
                    className="border text-white placeholder:text-gray-600"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(201,169,110,0.3)",
                      paddingLeft: isAr ? "12px" : "40px",
                      paddingRight: isAr ? "40px" : "12px",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">
                  {isAr ? "كلمة المرور" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                    style={{ [isAr ? "right" : "left"]: "12px" }} />
                  <Input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isAr ? "أدخل كلمة المرور" : "Enter password"}
                    autoComplete="current-password"
                    dir="ltr"
                    className="border text-white placeholder:text-gray-600"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(201,169,110,0.3)",
                      paddingLeft: isAr ? "40px" : "40px",
                      paddingRight: isAr ? "40px" : "40px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    style={{ [isAr ? "left" : "right"]: "12px" }}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold text-sm h-11 mt-2"
                disabled={loginMutation.isPending}
                style={{ background: "linear-gradient(135deg, #C9A96E, #a8843a)", color: "#000", border: "none" }}
              >
                {loginMutation.isPending
                  ? (isAr ? "جاري الدخول..." : "Signing in...")
                  : (isAr ? "دخول" : "Sign In")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Language toggle */}
        <div className="text-center mt-4">
          <button
            onClick={() => i18n.changeLanguage(isAr ? "en" : "ar")}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isAr ? "English" : "العربية"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © 2024 Darin Madani Fashion House. All rights reserved.
        </p>
      </div>
    </div>
  );
}
