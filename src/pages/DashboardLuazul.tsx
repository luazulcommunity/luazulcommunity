import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, Star, Users, FileText } from "lucide-react";
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
  applications_count?: number;
}

interface Application {
  id: string;
  mission_id: string;
  influencer_id: string;
  message: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  missions: {
    title: string;
  } | null;
}

interface Completion {
  id: string;
  mission_id: string;
  influencer_id: string;
  rating: number | null;
  feedback: string | null;
  completed_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  missions: {
    title: string;
  } | null;
}

const DashboardLuazul = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    requirements: "",
    compensation: "",
    compensation_type: "fixed",
    deadline: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchMissions(),
      fetchApplications(),
      fetchCompletions(),
    ]);
    setLoading(false);
  };

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select(`
          *,
          mission_applications(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar missões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("mission_applications")
        .select(`
          *,
          missions(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar informações dos perfis separadamente
      if (data) {
        const userIds = [...new Set(data.map(app => app.influencer_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const applicationsWithProfiles = data.map(app => ({
          ...app,
          profiles: profilesMap.get(app.influencer_id) || null,
        }));

        setApplications(applicationsWithProfiles);
      } else {
        setApplications([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar candidaturas:", error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const { data: completionsData, error: completionsError } = await supabase
        .from("mission_completions")
        .select(`
          *,
          missions(title)
        `)
        .order("completed_at", { ascending: false });

      if (completionsError) throw completionsError;

      // Buscar informações dos perfis separadamente
      if (completionsData && completionsData.length > 0) {
        const userIds = [...new Set(completionsData.map(completion => completion.influencer_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, { full_name: p.full_name }]) || []);

        const completionsWithProfiles = completionsData.map(completion => ({
          ...completion,
          profiles: profilesMap.get(completion.influencer_id) || null,
        }));

        setCompletions(completionsWithProfiles);
      } else {
        setCompletions([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar conclusões:", error);
      toast({
        title: "Erro ao carregar conclusões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const missionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        requirements: formData.requirements || null,
        compensation: formData.compensation ? parseFloat(formData.compensation) : null,
        compensation_type: formData.compensation_type,
        deadline: formData.deadline || null,
        status: "open",
        created_by: user.id,
      };

      if (selectedMission) {
        const { error } = await supabase
          .from("missions")
          .update(missionData)
          .eq("id", selectedMission.id);

        if (error) throw error;
        toast({
          title: "Missão atualizada",
          description: "A missão foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("missions")
          .insert([missionData]);

        if (error) throw error;
        toast({
          title: "Missão criada",
          description: "A missão foi criada com sucesso",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar missão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptApplication = async (applicationId: string, missionId: string, influencerId: string) => {
    try {
      // Atualizar status da candidatura
      await supabase
        .from("mission_applications")
        .update({ status: "accepted" })
        .eq("id", applicationId);

      // Rejeitar outras candidaturas da mesma missão
      await supabase
        .from("mission_applications")
        .update({ status: "rejected" })
        .eq("mission_id", missionId)
        .neq("id", applicationId);

      // Fechar a missão
      await supabase
        .from("missions")
        .update({ status: "closed" })
        .eq("id", missionId);

      toast({
        title: "Candidatura aceita",
        description: "O influenciador foi selecionado para a missão",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteMission = async (applicationId: string, missionId: string, influencerId: string) => {
    try {
      const rating = prompt("Digite a nota (1-5):");
      const feedback = prompt("Digite o feedback:");

      if (!rating) return;

      await supabase
        .from("mission_completions")
        .insert([{
          mission_id: missionId,
          influencer_id: influencerId,
          application_id: applicationId,
          rating: parseInt(rating),
          feedback: feedback || null,
        }]);

      await supabase
        .from("missions")
        .update({ status: "completed" })
        .eq("id", missionId);

      toast({
        title: "Missão concluída",
        description: "A nota e feedback foram registrados",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      requirements: "",
      compensation: "",
      compensation_type: "fixed",
      deadline: "",
    });
    setSelectedMission(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Luazul</h2>
          <p className="text-muted-foreground">
            Gerencie missões, candidaturas e associados
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMission ? "Editar Missão" : "Nova Missão"}</DialogTitle>
              <DialogDescription>
                {selectedMission ? "Atualize as informações da missão" : "Crie uma nova missão para influenciadores"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compensation">Compensação</Label>
                  <Input
                    id="compensation"
                    type="number"
                    step="0.01"
                    value={formData.compensation}
                    onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compensation_type">Tipo</Label>
                  <select
                    id="compensation_type"
                    value={formData.compensation_type}
                    onChange={(e) => setFormData({ ...formData, compensation_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="fixed">Fixo</option>
                    <option value="hourly">Por hora</option>
                    <option value="per_post">Por post</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {selectedMission ? "Atualizar" : "Criar Missão"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList>
          <TabsTrigger value="missions">
            <FileText className="h-4 w-4 mr-2" />
            Missões
          </TabsTrigger>
          <TabsTrigger value="applications">
            <Users className="h-4 w-4 mr-2" />
            Candidaturas
          </TabsTrigger>
          <TabsTrigger value="completions">
            <CheckCircle className="h-4 w-4 mr-2" />
            Concluídas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missões Criadas</CardTitle>
              <CardDescription>Todas as missões disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidaturas</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma missão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    missions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium">{mission.title}</TableCell>
                        <TableCell>
                          <Badge variant={
                            mission.status === "open" ? "default" :
                            mission.status === "closed" ? "secondary" :
                            mission.status === "completed" ? "default" : "destructive"
                          }>
                            {mission.status === "open" ? "Aberta" :
                             mission.status === "closed" ? "Fechada" :
                             mission.status === "completed" ? "Concluída" : mission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mission.applications_count || 0}
                        </TableCell>
                        <TableCell>
                          {mission.deadline ? new Date(mission.deadline).toLocaleDateString("pt-BR") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMission(mission);
                              setFormData({
                                title: mission.title,
                                description: mission.description,
                                location: mission.location || "",
                                requirements: mission.requirements || "",
                                compensation: mission.compensation?.toString() || "",
                                compensation_type: mission.compensation_type,
                                deadline: mission.deadline || "",
                              });
                              setDialogOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidaturas</CardTitle>
              <CardDescription>Candidaturas de influenciadores para missões</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Missão</TableHead>
                    <TableHead>Influenciador</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma candidatura encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.missions?.title || "-"}</TableCell>
                        <TableCell>
                          {app.profiles?.full_name || app.profiles?.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            app.status === "pending" ? "secondary" :
                            app.status === "accepted" ? "default" : "destructive"
                          }>
                            {app.status === "pending" ? "Pendente" :
                             app.status === "accepted" ? "Aceita" : "Rejeitada"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(app.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          {app.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAcceptApplication(app.id, app.mission_id, app.influencer_id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceitar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  await supabase
                                    .from("mission_applications")
                                    .update({ status: "rejected" })
                                    .eq("id", app.id);
                                  fetchData();
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                          {app.status === "accepted" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCompleteMission(app.id, app.mission_id, app.influencer_id)}
                            >
                              Concluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missões Concluídas</CardTitle>
              <CardDescription>Histórico de missões concluídas com avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Missão</TableHead>
                    <TableHead>Influenciador</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma missão concluída ainda
                      </TableCell>
                    </TableRow>
                  ) : (
                    completions.map((completion) => (
                      <TableRow key={completion.id}>
                        <TableCell className="font-medium">{completion.missions?.title || "-"}</TableCell>
                        <TableCell>{completion.profiles?.full_name || "-"}</TableCell>
                        <TableCell>
                          {completion.rating ? (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < completion.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1">({completion.rating})</span>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{completion.feedback || "-"}</TableCell>
                        <TableCell>
                          {new Date(completion.completed_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardLuazul;

