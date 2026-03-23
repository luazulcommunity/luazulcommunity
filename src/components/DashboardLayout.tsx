import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  UserCircle,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const getMenuItems = (role: string | null) => {
  if (role === 'luazul' || role === 'admin') {
    return [
      {
        title: "Missões",
        icon: LayoutDashboard,
        path: "/dashboard/luazul",
      },
      {
        title: "Financeiro",
        icon: DollarSign,
        path: "/dashboard/financeiro",
      },
      {
        title: "Clientes",
        icon: Users,
        path: "/dashboard/clientes",
      },
      {
        title: "Modelos",
        icon: UserCircle,
        path: "/dashboard/modelos",
      },
      {
        title: "Configuração",
        icon: Settings,
        path: "/dashboard/configuracao",
      },
    ];
  } else if (role === 'influencer') {
    return [
      {
        title: "Mural de Missões",
        icon: LayoutDashboard,
        path: "/dashboard/influencer",
      },
    ];
  } else if (role === 'associado') {
    return [
      {
        title: "Meus Contratos",
        icon: LayoutDashboard,
        path: "/dashboard/associados",
      },
    ];
  }
  // Fallback para outros roles
  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ];
};

const DashboardLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
          if (!session) {
            navigate("/login/luazul");
            navigate("/login/luazul");
        return;
      }

      setUser(session.user);

      // Verificar role do usuário
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      // Se houver erro 406 ou 404, significa que a tabela não existe ou RLS está bloqueando
      if (roleError && roleError.code !== 'PGRST116') {
        console.warn('Erro ao verificar role (pode ser normal se scripts SQL não foram executados):', roleError);
      }

      if (roles && roles.length > 0) {
        const role = roles[0].role;
        setUserRole(role);
        setIsAdmin(role === 'admin' || role === 'luazul');

        // Redirecionar baseado no role se estiver na página inicial do dashboard
        if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
          if (role === 'luazul' || role === 'admin') {
            navigate("/dashboard/luazul", { replace: true });
          } else if (role === 'influencer') {
            navigate("/dashboard/influencer", { replace: true });
          } else if (role === 'associado') {
            navigate("/dashboard/associados", { replace: true });
          }
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao verificar autenticação",
        description: error.message,
        variant: "destructive",
      });
          navigate("/login/luazul");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      
      navigate("/login/luazul");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Menu className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Luazul Community</span>
                <span className="text-xs text-muted-foreground">Painel Administrativo</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getMenuItems(userRole).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link to={item.path}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="px-2 py-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user?.email || "Usuário"}
                  </span>
                  {userRole && (
                    <span className="text-xs text-muted-foreground">
                      {userRole === 'luazul' ? 'Luazul' :
                       userRole === 'influencer' ? 'Influencer' :
                       userRole === 'associado' ? 'Associado' :
                       userRole === 'admin' ? 'Administrador' : userRole}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {getMenuItems(userRole).find(item => item.path === location.pathname)?.title || "Dashboard"}
              </h1>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

