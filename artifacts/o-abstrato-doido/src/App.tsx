import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Galeria from "@/pages/Galeria";
import Agenda from "@/pages/Agenda";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Sobre from "@/pages/Sobre";
import Cursos from "@/pages/Cursos";
import Login from "@/pages/admin/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import ObrasAdmin from "@/pages/admin/ObrasAdmin";
import EventosAdmin from "@/pages/admin/EventosAdmin";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import CursosAdmin from "@/pages/admin/CursosAdmin";
import OrdemAdmin from "@/pages/admin/OrdemAdmin";
import DescontosAdmin from "@/pages/admin/DescontosAdmin";
import MetricsAdmin from "@/pages/admin/MetricsAdmin";
import { LanguageProvider } from "@/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

function PublicPage({ children }: { children: ReactNode }) {
  return <div className="public-site">{children}</div>;
}

function LegacyAdminRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);

  return null;
}

function PublicAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    if (location.startsWith("/kwendje") || location.startsWith("/odoido")) return;

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.split("?")[0] || "/" }),
      keepalive: true,
    }).catch(() => undefined);
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicPage><Home /></PublicPage>} />
      <Route path="/galeria" component={() => <PublicPage><Galeria /></PublicPage>} />
      <Route path="/agenda" component={() => <PublicPage><Agenda /></PublicPage>} />
      <Route path="/blog" component={() => <PublicPage><Blog /></PublicPage>} />
      <Route path="/blog/:id" component={() => <PublicPage><BlogPost /></PublicPage>} />
      <Route path="/sobre" component={() => <PublicPage><Sobre /></PublicPage>} />
      <Route path="/cursos" component={() => <PublicPage><Cursos /></PublicPage>} />
      <Route path="/odoido/login" component={() => <LegacyAdminRedirect to="/kwendje/login" />} />
      <Route path="/odoido" component={() => <LegacyAdminRedirect to="/kwendje" />} />
      <Route path="/odoido/obras" component={() => <LegacyAdminRedirect to="/kwendje/obras" />} />
      <Route path="/odoido/eventos" component={() => <LegacyAdminRedirect to="/kwendje/eventos" />} />
      <Route path="/odoido/blog" component={() => <LegacyAdminRedirect to="/kwendje/blog" />} />
      <Route path="/odoido/cursos" component={() => <LegacyAdminRedirect to="/kwendje/cursos" />} />
      <Route path="/odoido/ordem" component={() => <LegacyAdminRedirect to="/kwendje/ordem" />} />
      <Route path="/odoido/descontos" component={() => <LegacyAdminRedirect to="/kwendje/descontos" />} />
      <Route path="/odoido/metricas" component={() => <LegacyAdminRedirect to="/kwendje/metricas" />} />
      <Route path="/kwendje/login" component={Login} />
      <Route path="/kwendje" component={() => <AdminLayout><ObrasAdmin /></AdminLayout>} />
      <Route path="/kwendje/obras" component={() => <AdminLayout><ObrasAdmin /></AdminLayout>} />
      <Route path="/kwendje/eventos" component={() => <AdminLayout><EventosAdmin /></AdminLayout>} />
      <Route path="/kwendje/blog" component={() => <AdminLayout><BlogAdmin /></AdminLayout>} />
      <Route path="/kwendje/cursos" component={() => <AdminLayout><CursosAdmin /></AdminLayout>} />
      <Route path="/kwendje/ordem" component={() => <AdminLayout><OrdemAdmin /></AdminLayout>} />
      <Route path="/kwendje/descontos" component={() => <AdminLayout><DescontosAdmin /></AdminLayout>} />
      <Route path="/kwendje/metricas" component={() => <AdminLayout><MetricsAdmin /></AdminLayout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <PublicAnalytics />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
