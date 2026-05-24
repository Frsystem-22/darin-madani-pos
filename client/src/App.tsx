import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Returns from "./pages/Returns";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import InvoicePrint from "./pages/InvoicePrint";
import BarcodePrint from "./pages/BarcodePrint";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPage from "@/pages/PaymentPage";
import Reports from "@/pages/Reports";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C9A96E", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "#C9A96E" }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/pos" component={() => <ProtectedRoute component={POS} />} />
      <Route path="/inventory" component={() => <ProtectedRoute component={Inventory} />} />
      <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} />} />
      <Route path="/returns" component={() => <ProtectedRoute component={Returns} />} />
      <Route path="/customers" component={() => <ProtectedRoute component={Customers} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/invoice/:id" component={InvoicePrint} />
      <Route path="/barcode-print" component={() => <ProtectedRoute component={BarcodePrint} />} />
      <Route path="/warehouses" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/discounts" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/pay" component={PaymentPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
