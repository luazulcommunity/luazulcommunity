import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Lazy load das páginas principais
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Models = lazy(() => import("./pages/Models"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const PortalLogin = lazy(() => import("./pages/auth/PortalLogin"));

// Lazy load das páginas do dashboard
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const DashboardClientes = lazy(() => import("./pages/DashboardClientes"));
const DashboardModelos = lazy(() => import("./pages/DashboardModelos"));
const DashboardConfiguracao = lazy(() => import("./pages/DashboardConfiguracao"));
const DashboardLuazul = lazy(() => import("./pages/DashboardLuazul"));
const DashboardInfluencer = lazy(() => import("./pages/DashboardInfluencer"));
const DashboardAssociados = lazy(() => import("./pages/DashboardAssociados"));

// Lazy load das páginas antigas
const Admin = lazy(() => import("./pages/Admin"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componentes que são sempre necessários (não lazy)
import WhatsAppButton from "./components/WhatsAppButton";
import StarTrail from "./components/StarTrail";

// Componente de loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const restrictedPrefixes = ["/auth", "/portais", "/login", "/dashboard", "/admin", "/client-dashboard"];
  const hideWhatsApp = restrictedPrefixes.some(path => 
    location.pathname.startsWith(path)
  );
  
  // Verificar se é desktop (não mobile) antes de mostrar StarTrail
  const isDesktop = typeof window !== 'undefined' && 
    window.innerWidth > 768 && 
    !('ontouchstart' in window) && 
    navigator.maxTouchPoints === 0;
  
  const showStarTrail = isDesktop && !restrictedPrefixes.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <>
      {showStarTrail && <StarTrail />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Navigate to="/login/luazul" replace />} />
          <Route path="/login/luazul" element={<PortalLogin portal="luazul" />} />
          <Route path="/login/influencer" element={<PortalLogin portal="influencer" />} />
          <Route path="/login/associado" element={<PortalLogin portal="associado" />} />
          <Route path="/portais" element={<Auth />} />
          <Route path="/models" element={<Models />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          
          {/* Dashboard com sidebar */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="clientes" element={<DashboardClientes />} />
            <Route path="modelos" element={<DashboardModelos />} />
            <Route path="configuracao" element={<DashboardConfiguracao />} />
            <Route path="luazul" element={<DashboardLuazul />} />
            <Route path="influencer" element={<DashboardInfluencer />} />
            <Route path="associados" element={<DashboardAssociados />} />
          </Route>
          
          {/* Rotas antigas mantidas para compatibilidade */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideWhatsApp && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
