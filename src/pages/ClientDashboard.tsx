import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Calendar, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: string;
  package_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Activity {
  id: string;
  activity_name: string;
  description: string;
  status: string;
  due_date: string;
  completed_date: string;
  order_index: number;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  status: string;
  description: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    checkClientAccess();
  }, []);

  const checkClientAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login/luazul");
      return;
    }

    setClientEmail(session.user.email || "");

    // Verificar se o email existe na tabela clients
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!client) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchClientData(client.id);
  };

  const fetchClientData = async (clientId: string) => {
    try {
      // Buscar pacotes
      const { data: packagesData, error: packagesError } = await supabase
        .from("client_packages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (packagesError) throw packagesError;
      setPackages(packagesData || []);

      // Buscar atividades para cada pacote
      if (packagesData && packagesData.length > 0) {
        const activitiesData: Record<string, Activity[]> = {};
        
        for (const pkg of packagesData) {
          const { data: pkgActivities } = await supabase
            .from("package_activities")
            .select("*")
            .eq("package_id", pkg.id)
            .order("order_index", { ascending: true });
          
          activitiesData[pkg.id] = pkgActivities || [];
        }
        
        setActivities(activitiesData);
      }

      // Buscar pagamentos
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("client_id", clientId)
        .order("payment_date", { ascending: false });

      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (pkgActivities: Activity[]) => {
    if (pkgActivities.length === 0) return 0;
    const completed = pkgActivities.filter(a => a.status === "completed").length;
    return (completed / pkgActivities.length) * 100;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard do Cliente</h1>
            <p className="text-sm md:text-base text-muted-foreground truncate">{clientEmail}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full sm:w-auto">Sair</Button>
        </div>

        {/* Pacotes e Atividades */}
        <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
          {packages.map((pkg) => {
            const pkgActivities = activities[pkg.id] || [];
            const progress = getProgressPercentage(pkgActivities);

            return (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg md:text-xl">{pkg.package_name}</CardTitle>
                      <CardDescription className="text-sm">{pkg.description}</CardDescription>
                    </div>
                    <Badge variant={pkg.status === "active" ? "default" : "secondary"} className="self-start sm:self-auto">
                      {pkg.status}
                    </Badge>
                  </div>
                  {pkg.start_date && pkg.end_date && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{new Date(pkg.start_date).toLocaleDateString()} - {new Date(pkg.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base">Atividades</h4>
                      {pkgActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50">
                          {activity.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm md:text-base">{activity.activity_name}</p>
                            {activity.description && (
                              <p className="text-xs md:text-sm text-muted-foreground">{activity.description}</p>
                            )}
                            {activity.due_date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Prazo: {new Date(activity.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                            {activity.status === "completed" ? "Concluído" : 
                             activity.status === "in_progress" ? "Em andamento" : "Pendente"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Histórico de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.length === 0 ? (
                <p className="text-sm md:text-base text-muted-foreground">Nenhum pagamento registrado.</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-2 md:p-3 rounded-lg bg-muted/50 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">{payment.description}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm md:text-base">€{payment.amount.toFixed(2)}</p>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"} className="text-xs">
                        {payment.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
