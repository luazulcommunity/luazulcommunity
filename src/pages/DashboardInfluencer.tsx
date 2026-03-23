import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Star, MapPin, DollarSign, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Mission {
  id: string;
  title: string;
  description: string;
  location: string | null;
  requirements: string | null;
  compensation: number | null;
  compensation_type: string;
  deadline: string | null;
  status: string;
  created_at: string;
  has_applied?: boolean;
}

interface Application {
  id: string;
  mission_id: string;
  status: string;
  created_at: string;
  missions: Mission | null;
}

interface Completion {
  id: string;
  mission_id: string;
  rating: number | null;
  feedback: string | null;
  completed_at: string;
  missions: {
    title: string;
  } | null;
}

const DashboardInfluencer = () => {
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myCompletions, setMyCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchAvailableMissions(),
      fetchMyApplications(),
      fetchMyCompletions(),
    ]);
    setLoading(false);
  };

  const fetchAvailableMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar missões abertas
      const { data: missions, error } = await supabase
        .from("missions")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Verificar quais missões já têm candidatura
      const { data: applications } = await supabase
        .from("mission_applications")
        .select("mission_id")
        .eq("influencer_id", user.id);

      const appliedMissionIds = new Set(applications?.map(a => a.mission_id) || []);

      const missionsWithStatus = missions?.map(mission => ({
        ...mission,
        has_applied: appliedMissionIds.has(mission.id),
      })) || [];

      setAvailableMissions(missionsWithStatus);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar missões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchMyApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mission_applications")
        .select(`
          *,
          missions(*)
        `)
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyApplications(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar candidaturas:", error);
    }
  };

  const fetchMyCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mission_completions")
        .select(`
          *,
          missions(title)
        `)
        .eq("influencer_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      setMyCompletions(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar conclusões:", error);
    }
  };

  const handleApply = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedMission) return;

      const { error } = await supabase
        .from("mission_applications")
        .insert([{
          mission_id: selectedMission.id,
          influencer_id: user.id,
          message: applicationMessage,
          status: "pending",
        }]);

      if (error) throw error;

      toast({
        title: "Candidatura enviada",
        description: "Sua candidatura foi enviada com sucesso!",
      });

      setApplicationDialogOpen(false);
      setApplicationMessage("");
      setSelectedMission(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mural de Missões</h2>
        <p className="text-muted-foreground">
          Veja as missões disponíveis e candidate-se
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList>
          <TabsTrigger value="available">Missões Disponíveis</TabsTrigger>
          <TabsTrigger value="applications">Minhas Candidaturas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableMissions.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Nenhuma missão disponível no momento
              </div>
            ) : (
              availableMissions.map((mission) => (
                <Card key={mission.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {mission.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {mission.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {mission.location}
                        </div>
                      )}
                      {mission.deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Prazo: {new Date(mission.deadline).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      {mission.compensation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {mission.compensation.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "CHF",
                          })}
                        </div>
                      )}
                    </div>
                    {mission.requirements && (
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Requisitos:</p>
                        <p className="text-muted-foreground">{mission.requirements}</p>
                      </div>
                    )}
                    <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          variant={mission.has_applied ? "secondary" : "default"}
                          disabled={mission.has_applied}
                          onClick={() => setSelectedMission(mission)}
                        >
                          {mission.has_applied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Já Candidatado
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Candidatar-se
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Candidatar-se à Missão</DialogTitle>
                          <DialogDescription>
                            Envie uma mensagem explicando por que você é a pessoa certa para esta missão
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Mensagem (opcional)</Label>
                            <Textarea
                              value={applicationMessage}
                              onChange={(e) => setApplicationMessage(e.target.value)}
                              placeholder="Conte-nos por que você é ideal para esta missão..."
                              rows={4}
                            />
                          </div>
                          <Button onClick={handleApply} className="w-full">
                            Enviar Candidatura
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Candidaturas</CardTitle>
              <CardDescription>Status das suas candidaturas</CardDescription>
            </CardHeader>
            <CardContent>
              {myApplications.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Você ainda não se candidatou a nenhuma missão
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {app.missions?.title || "Missão"}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {app.missions?.description}
                          </p>
                          <div className="mt-2">
                            <Badge variant={
                              app.status === "pending" ? "secondary" :
                              app.status === "accepted" ? "default" : "destructive"
                            }>
                              {app.status === "pending" ? "Pendente" :
                               app.status === "accepted" ? "Aceita" : "Rejeitada"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missões Concluídas</CardTitle>
              <CardDescription>Suas missões concluídas e avaliações recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {myCompletions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma missão concluída ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {myCompletions.map((completion) => (
                    <div key={completion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {completion.missions?.title || "Missão"}
                          </h3>
                          {completion.rating && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium">Avaliação:</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < completion.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-1">({completion.rating}/5)</span>
                              </div>
                            </div>
                          )}
                          {completion.feedback && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Feedback:</strong> {completion.feedback}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(completion.completed_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardInfluencer;

