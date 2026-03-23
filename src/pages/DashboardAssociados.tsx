import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, Clock, XCircle, Calendar, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  total_value: number | null;
  paid_value: number | null;
  progress_percentage: number;
  notes: string | null;
  created_at: string;
  contract_activities: ContractActivity[];
}

interface ContractActivity {
  id: string;
  activity_name: string;
  description: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
}

const DashboardAssociados = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          contract_activities(*)
        `)
        .eq("associado_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar contratos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativo", variant: "default" as const, icon: Clock },
      completed: { label: "Concluído", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
      on_hold: { label: "Em Pausa", variant: "secondary" as const, icon: Clock },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getActivityStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      in_progress: { label: "Em Andamento", variant: "default" as const },
      completed: { label: "Concluída", variant: "default" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => c.status === "active");
  const completedContracts = contracts.filter(c => c.status === "completed");
  const otherContracts = contracts.filter(c => !["active", "completed"].includes(c.status));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meus Contratos</h2>
        <p className="text-muted-foreground">
          Acompanhe o andamento dos seus contratos
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            <FileText className="h-4 w-4 mr-2" />
            Ativos ({activeContracts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Concluídos ({completedContracts.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({contracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeContracts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum contrato ativo no momento
              </CardContent>
            </Card>
          ) : (
            activeContracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{contract.title}</CardTitle>
                      <CardDescription>
                        Contrato #{contract.contract_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contract.description && (
                    <p className="text-sm text-muted-foreground">{contract.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Início</p>
                      <p className="font-medium">
                        {new Date(contract.start_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {contract.end_date && (
                      <div>
                        <p className="text-muted-foreground">Término</p>
                        <p className="font-medium">
                          {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                    {contract.total_value && (
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium">
                          {contract.total_value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "CHF",
                          })}
                        </p>
                      </div>
                    )}
                    {contract.paid_value !== null && (
                      <div>
                        <p className="text-muted-foreground">Pago</p>
                        <p className="font-medium">
                          {contract.paid_value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "CHF",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{contract.progress_percentage}%</span>
                    </div>
                    <Progress value={contract.progress_percentage} />
                  </div>

                  {contract.contract_activities && contract.contract_activities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Atividades:</p>
                      <div className="space-y-2">
                        {contract.contract_activities.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.activity_name}</p>
                              {activity.description && (
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                              )}
                            </div>
                            {getActivityStatusBadge(activity.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contract.notes && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm font-semibold mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">{contract.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedContracts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum contrato concluído ainda
              </CardContent>
            </Card>
          ) : (
            completedContracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{contract.title}</CardTitle>
                      <CardDescription>
                        Contrato #{contract.contract_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {contract.description && (
                    <p className="text-sm text-muted-foreground mb-4">{contract.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Período</p>
                      <p className="font-medium">
                        {new Date(contract.start_date).toLocaleDateString("pt-BR")} -{" "}
                        {contract.end_date
                          ? new Date(contract.end_date).toLocaleDateString("pt-BR")
                          : "Em andamento"}
                      </p>
                    </div>
                    {contract.total_value && (
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium">
                          {contract.total_value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "CHF",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum contrato encontrado
              </CardContent>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{contract.title}</CardTitle>
                      <CardDescription>
                        Contrato #{contract.contract_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">{contract.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progresso</p>
                      <p className="font-medium">{contract.progress_percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAssociados;

