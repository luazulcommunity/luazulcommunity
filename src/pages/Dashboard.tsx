import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuotationRequest {
  id: string;
  project_description: string;
  event_date: string | null;
  budget_range: string;
  status: string;
  created_at: string;
  models: {
    name: string;
  };
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login/luazul");
        return;
      }
      setUser(session.user);
      fetchQuotations(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login/luazul");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchQuotations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotation_requests")
        .select(`
          *,
          models (
            name
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuotations(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cotações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      approved: { label: "Aprovado", variant: "default" as const },
      rejected: { label: "Rejeitado", variant: "destructive" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Bem-vindo, <span className="text-primary">{user?.email}</span>
          </h1>
          <p className="text-muted-foreground">Gerencie suas solicitações de cotação</p>
        </div>

        {quotations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Você ainda não fez nenhuma solicitação de cotação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">
                        Modelo: {quotation.models.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em:{" "}
                        {new Date(quotation.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {getStatusBadge(quotation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Descrição do Projeto:</p>
                      <p className="text-sm text-muted-foreground">
                        {quotation.project_description}
                      </p>
                    </div>

                    {quotation.event_date && (
                      <div>
                        <p className="text-sm font-medium mb-1">Data do Evento:</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quotation.event_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-1">Faixa de Orçamento:</p>
                      <p className="text-sm text-muted-foreground">
                        {quotation.budget_range}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
