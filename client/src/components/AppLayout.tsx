import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, ShoppingCart, Package, FileText, RotateCcw,
  Users, Settings, ChevronLeft, ChevronRight, Menu, X, Globe,
  Moon, Sun, Warehouse, Tag, BarChart3, LogOut, User, Layers, Barcode
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const LOGO_DARK = "/logo-dark.webp";
const LOGO_LIGHT = "/logo-light.webp";

interface NavItem {
  key: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  badge?: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: stats } = trpc.users.dashboardStats.useQuery(undefined, { refetchInterval: 60000 });

  const navItems: NavItem[] = [
    { key: "dashboard", icon: <LayoutDashboard size={18} />, path: "/" },
    { key: "pos", icon: <ShoppingCart size={18} />, path: "/pos" },
    { key: "inventory", icon: <Package size={18} />, path: "/inventory" },
    { key: "barcode_print", icon: <Barcode size={18} />, path: "/barcode-print" },
    { key: "invoices", icon: <FileText size={18} />, path: "/invoices" },
    { key: "returns", icon: <RotateCcw size={18} />, path: "/returns" },
    { key: "customers", icon: <Users size={18} />, path: "/customers" },
    { key: "warehouses", icon: <Warehouse size={18} />, path: "/warehouses", roles: ["admin", "manager"] },
    { key: "discounts", icon: <Tag size={18} />, path: "/discounts", roles: ["admin", "manager"] },
    { key: "users", icon: <Layers size={18} />, path: "/users", roles: ["admin"] },
    { key: "settings", icon: <Settings size={18} />, path: "/settings", roles: ["admin"] },
  ];

  const visibleItems = navItems.filter(item =>
    !item.roles || !user || item.roles.includes(user.role || "cashier")
  );

  const toggleLang = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    setLanguage(newLang as "ar" | "en");
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const ChevronIcon = isRTL
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <div className={cn("flex h-screen bg-background overflow-hidden", isRTL ? "rtl" : "ltr")}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 h-full bg-sidebar flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className={cn("flex items-center h-16 px-3 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-3")}>
          {!collapsed && (
            <img src={LOGO_DARK} alt="Darin Madani" className="h-9 w-auto object-contain" />
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">DM</div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ms-auto text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              <ChevronIcon size={16} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center h-8 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mt-1"
          >
            <ChevronIcon size={16} />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleItems.map(item => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link
                key={item.key}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer no-underline",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? t(`nav.${item.key}`) : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate">{t(`nav.${item.key}`)}</span>
                )}
                {!collapsed && item.key === "inventory" && (stats?.lowStockCount ?? 0) > 0 && (
                  <Badge variant="destructive" className="ms-auto text-xs px-1.5 py-0 h-5">
                    {stats?.lowStockCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent/50">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{t(`users.${user?.role || "cashier"}`)}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          {/* Language toggle */}
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1.5 text-xs">
            <Globe size={15} />
            {i18n.language === "ar" ? "EN" : "عر"}
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
              <DropdownMenuItem>
                <User size={14} className="me-2" />
                {t("auth.logout")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut size={14} className="me-2" />
                {t("auth.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
