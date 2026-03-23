import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type PortalType = "luazul" | "influencer" | "associado";

interface PortalLoginProps {
  portal: PortalType;
}

const portalCopy: Record<PortalType, {
  title: string;
  subtitle: string;
  description: string;
  helper?: string;
  accent: string;
}> = {
  luazul: {
    title: "Portal Administrativo",
    subtitle: "Acesso exclusivo da equipe Luazul",
    description: "Gerencie missões, influenciadores, contratos e clientes.",
    helper: "Precisa criar credenciais para influenciadores? Use o menu Configurações > Credenciais.",
    accent: "from-primary/30 via-primary/20 to-primary/5"
  },
  influencer: {
    title: "Portal Influencer",
    subtitle: "Acesso para criadores aprovados",
    description: "Visualize missões disponíveis, envie candidaturas e acompanhe resultados.",
    helper: "As credenciais são fornecidas diretamente pela equipe Luazul.",
    accent: "from-purple-500/20 via-purple-400/10 to-background"
  },
  associado: {
    title: "Portal Associado",
    subtitle: "Acesso para clientes e estabelecimentos",
    description: "Consulte contratos, entregas realizadas, relatórios e desempenho.",
    helper: "Suas credenciais são entregues pela Luazul ao ativar o contrato.",
    accent: "from-emerald-500/20 via-emerald-400/10 to-background"
  }
};

const PortalLogin = ({ portal }: PortalLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingTest, setCreatingTest] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const portalData = useMemo(() => portalCopy[portal], [portal]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirectBasedOnRole(session.user.id);
      }
    });
  }, []);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (roles && roles.length > 0) {
        const role = roles[0].role;
        if (role === "luazul" || role === "admin") {
          navigate("/dashboard/luazul", { replace: true });
          return;
        }
        if (role === "influencer") {
          navigate("/dashboard/influencer", { replace: true });
          return;
        }
        if (role === "associado") {
          navigate("/dashboard/associados", { replace: true });
          return;
        }
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: t("auth.login.success"),
        description: t("auth.login.redirecting")
      });

      await redirectBasedOnRole(data.user.id);
    } catch (error: any) {
      toast({
        title: t("auth.login.error"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setCreatingTest(true);
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: "test@luazul.com",
        password: "test123456"
      });

      if (!loginError && loginData) {
        toast({
          title: "Login realizado!",
          description: "Usuário de teste já existe. Redirecionando..."
        });
        navigate("/dashboard/luazul");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: "test@luazul.com",
        password: "test123456",
        options: {
          data: {
            full_name: "Usuário Teste",
            user_type: "luazul"
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          const { data: retryLogin, error: retryError } = await supabase.auth.signInWithPassword({
            email: "test@luazul.com",
            password: "test123456"
          });

          if (!retryError && retryLogin) {
            toast({
              title: "Login realizado!",
              description: "Usuário de teste encontrado. Redirecionando..."
            });
            navigate("/dashboard/luazul");
            return;
          }
        }
        throw error;
      }

      if (data.user) {
        await supabase
          .from("user_roles")
          .insert([{ user_id: data.user.id, role: "luazul" }])
          .single();
      }

      if (data.session) {
        toast({
          title: "Usuário de teste criado!",
          description: "Redirecionando para o dashboard..."
        });
        navigate("/dashboard/luazul");
      } else {
        toast({
          title: "Usuário criado!",
          description: "Verifique o email de confirmação antes de acessar."
        });
        setEmail("test@luazul.com");
        setPassword("test123456");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário de teste.",
        variant: "destructive"
      });
    } finally {
      setCreatingTest(false);
    }
  };

  const otherPortals = (["luazul", "influencer", "associado"] as PortalType[])
    .filter((type) => type !== portal)
    .map((type) => ({
      type,
      label: type === "luazul" ? "Portal Luazul" : type === "influencer" ? "Portal Influencer" : "Portal Associado",
      path: `/login/${type}`
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070f] via-[#0a1120] to-[#101628] relative overflow-hidden">
      <div className="starry-background" />
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.35em] text-primary mb-2">
                {portal === "luazul" ? "Administrativo" : portal === "influencer" ? "Creators" : "Clientes"}
              </p>
              <CardTitle className="text-3xl text-white">{portalData.title}</CardTitle>
              <CardDescription className="text-base text-white/70">
                {portalData.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${portalData.accent} border border-white/5`}>
                <p className="text-sm text-white/80">{portalData.description}</p>
                {portalData.helper && (
                  <p className="text-xs text-white/60 mt-2">{portalData.helper}</p>
                )}
              </div>

              {portal === "luazul" && (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 space-y-3 text-sm text-primary-foreground">
                  <p className="font-semibold">Credenciais de Teste</p>
                  <div className="text-xs space-y-1 text-white/80">
                    <p><strong>Email:</strong> test@luazul.com</p>
                    <p><strong>Senha:</strong> test123456</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEmail("test@luazul.com");
                        setPassword("test123456");
                      }}
                    >
                      Preencher
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-primary"
                      onClick={createTestUser}
                      disabled={creatingTest}
                    >
                      {creatingTest ? "Criando..." : "Criar e entrar"}
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.login.loading") : "Connexion"}
                </Button>
              </form>

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">
                  Outros portais
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherPortals.map((item) => (
                    <Button key={item.type} variant="outline" className="flex-1" asChild>
                      <Link to={item.path}>
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;

