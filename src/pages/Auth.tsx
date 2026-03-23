import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const portalCards = [
  {
    type: "luazul",
    title: "Portal Luazul",
    description: "Acesso administrativo completo para gerenciar missões, contratos e equipes.",
    highlights: ["Dashboard completo", "Gestão de missões", "Criação de credenciais"],
    path: "/login/luazul",
    accent: "from-primary/30 via-primary/20 to-primary/5",
  },
  {
    type: "influencer",
    title: "Portal Influencer",
    description: "Mural de missões, candidaturas em tempo real e histórico de avaliações.",
    highlights: ["Missões disponíveis", "Candidaturas imediatas", "Histórico de notas"],
    path: "/login/influencer",
    accent: "from-purple-500/30 via-purple-400/10 to-purple-900/10",
  },
  {
    type: "associado",
    title: "Portal Associado",
    description: "Visão centralizada dos contratos, entregas, relatórios e métricas.",
    highlights: ["Contratos ativos", "Progresso e entregas", "Relatórios e métricas"],
    path: "/login/associado",
    accent: "from-emerald-500/30 via-emerald-400/10 to-emerald-900/10",
  },
] as const;

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirectBasedOnRole(session.user.id);
      }
    });
  }, [navigate]);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (roles && roles.length > 0) {
        const role = roles[0].role;
        if (role === "luazul" || role === "admin") {
          navigate("/dashboard/luazul");
        } else if (role === "influencer") {
          navigate("/dashboard/influencer");
        } else if (role === "associado") {
          navigate("/dashboard/associados");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] relative overflow-hidden">
      <div className="starry-background" />
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {portalCards.map((portal) => (
            <Card key={portal.type} className="bg-black/40 border-white/10 backdrop-blur">
              <CardHeader>
                <Badge variant="outline" className="w-fit uppercase tracking-[0.3em] text-xs">
                  {portal.type}
                </Badge>
                <CardTitle className="text-2xl text-white">{portal.title}</CardTitle>
                <CardDescription className="text-base text-white/70">
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-xl p-4 bg-gradient-to-r ${portal.accent} border border-white/5`}>
                  <ul className="space-y-2 text-sm text-white/80">
                    {portal.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full group" asChild>
                  <Link to={portal.path}>
                    Acessar portal
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
