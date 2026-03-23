import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Bell, Shield, Globe, Settings, Plus, Edit, Trash2, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  full_name: string;
  email: string;
}

interface Settings {
  notifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number | null;
  unit: string;
  is_active: boolean;
}

interface PortalUser {
  user_id: string;
  role: "influencer" | "associado";
  full_name: string | null;
  email: string | null;
}

const DashboardConfiguracao = () => {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
  });
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
  });
  const [services, setServices] = useState<Service[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    category: "",
    base_price: "",
    unit: "hour",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [portalUserForm, setPortalUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "influencer" as PortalUser["role"],
  });
  const [creatingPortalUser, setCreatingPortalUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchSettings();
    fetchServices();
    fetchPortalUsers();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || session.user.email || "",
        });
      } else {
        setProfile({
          full_name: "",
          email: session.user.email || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const fetchServices = async () => {
    // TODO: Criar tabela services no banco de dados
    // Temporariamente desabilitado até a tabela ser criada
    setServices([]);
  };

  const fetchPortalUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["influencer", "associado"]);

      if (error) throw error;

      const userIds = data?.map((item) => item.user_id) || [];

      if (userIds.length === 0) {
        setPortalUsers([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        profilesData?.map((profile) => [profile.id, profile]) ?? []
      );

      const mappedUsers: PortalUser[] = (data || []).map((item) => ({
        user_id: item.user_id,
        role: item.role as PortalUser["role"],
        full_name: profilesMap.get(item.user_id)?.full_name || null,
        email: profilesMap.get(item.user_id)?.email || null,
      }));

      setPortalUsers(mappedUsers);
    } catch (error: any) {
      console.error("Erro ao carregar credenciais:", error);
      toast({
        title: "Erro ao listar credenciais",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePortalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPortalUser(true);

    try {
      const response = await fetch("/api/create-portal-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: portalUserForm.email,
          password: portalUserForm.password,
          fullName: portalUserForm.fullName,
          role: portalUserForm.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível criar a credencial.");
      }

      toast({
        title: "Credencial criada",
        description: "Envie os dados ao influenciador com segurança.",
      });

      setPortalUserForm({
        fullName: "",
        email: "",
        password: "",
        role: portalUserForm.role,
      });
      fetchPortalUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao criar credencial",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingPortalUser(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          full_name: profile.full_name,
          email: profile.email,
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("user_settings", JSON.stringify(settings));
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram salvas",
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        name: serviceFormData.name,
        description: serviceFormData.description || null,
        category: serviceFormData.category || null,
        base_price: serviceFormData.base_price ? parseFloat(serviceFormData.base_price) : null,
        unit: serviceFormData.unit,
      };

      if (editingService) {
        // TODO: Criar tabela services no banco de dados
        throw new Error("Funcionalidade de serviços temporariamente desabilitada");

        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso",
        });
      } else {
        // TODO: Criar tabela services no banco de dados
        throw new Error("Funcionalidade de serviços temporariamente desabilitada");

        toast({
          title: "Serviço criado",
          description: "O serviço foi adicionado com sucesso",
        });
      }

      setServiceFormData({
        name: "",
        description: "",
        category: "",
        base_price: "",
        unit: "hour",
      });
      setEditingService(null);
      setServiceDialogOpen(false);
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      base_price: service.base_price?.toString() || "",
      unit: service.unit,
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      // TODO: Criar tabela services no banco de dados
      throw new Error("Funcionalidade de serviços temporariamente desabilitada");

      toast({
        title: "Serviço excluído",
        description: "O serviço foi removido com sucesso",
      });

      fetchServices();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleServiceStatus = async (service: Service) => {
    try {
      // TODO: Criar tabela services no banco de dados
      throw new Error("Funcionalidade de serviços temporariamente desabilitada");

      toast({
        title: "Status atualizado",
        description: `Serviço ${!service.is_active ? "ativado" : "desativado"}`,
      });

      fetchServices();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
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
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências, informações pessoais e serviços
        </p>
      </div>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    <CardTitle>Credenciais de Portais</CardTitle>
                  </div>
                  <CardDescription>
                    Gere e acompanhe acessos de influenciadores e associados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-dashed border-primary/40 p-4 bg-primary/5 text-sm text-muted-foreground">
                <p>
                  O usuário criado recebe acesso imediato ao portal escolhido. Compartilhe a senha de forma segura e solicite a troca após o primeiro login.
                </p>
              </div>
              <form onSubmit={handleCreatePortalUser} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input
                      value={portalUserForm.fullName}
                      onChange={(e) => setPortalUserForm({ ...portalUserForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={portalUserForm.email}
                      onChange={(e) => setPortalUserForm({ ...portalUserForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Senha temporária</Label>
                    <Input
                      type="text"
                      value={portalUserForm.password}
                      onChange={(e) => setPortalUserForm({ ...portalUserForm, password: e.target.value })}
                      placeholder="Min. 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Portal</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={portalUserForm.role}
                      onChange={(e) => setPortalUserForm({ ...portalUserForm, role: e.target.value as PortalUser["role"] })}
                    >
                      <option value="influencer">Influencer</option>
                      <option value="associado">Associado</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={creatingPortalUser} className="w-full md:w-auto">
                  {creatingPortalUser ? "Criando..." : "Criar credencial"}
                </Button>
              </form>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Acessos ativos</h4>
                  <span className="text-sm text-muted-foreground">
                    {portalUsers.length} usuários
                  </span>
                </div>
                <div className="border rounded-xl divide-y divide-border/60">
                  {portalUsers.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Nenhuma credencial criada ainda.
                    </div>
                  )}
                  {portalUsers.map((user) => (
                    <div key={user.user_id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-medium">{user.full_name || "Sem nome"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.role === "influencer" ? "default" : "secondary"}>
                        {user.role === "influencer" ? "Influencer" : "Associado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serviços */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <CardTitle>Serviços</CardTitle>
                  </div>
                  <CardDescription>
                    Gerencie os serviços que você oferece aos clientes
                  </CardDescription>
                </div>
                <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingService(null);
                      setServiceFormData({
                        name: "",
                        description: "",
                        category: "",
                        base_price: "",
                        unit: "hour",
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                      <DialogDescription>
                        {editingService ? "Atualize as informações do serviço" : "Adicione um novo serviço ao catálogo"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveService} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="service_name">Nome do Serviço *</Label>
                        <Input
                          id="service_name"
                          value={serviceFormData.name}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service_description">Descrição</Label>
                        <Input
                          id="service_description"
                          value={serviceFormData.description}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="service_category">Categoria</Label>
                          <Input
                            id="service_category"
                            value={serviceFormData.category}
                            onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                            placeholder="Ex: Produção, Marketing"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service_unit">Unidade</Label>
                          <select
                            id="service_unit"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={serviceFormData.unit}
                            onChange={(e) => setServiceFormData({ ...serviceFormData, unit: e.target.value })}
                          >
                            <option value="hour">Hora</option>
                            <option value="day">Dia</option>
                            <option value="session">Sessão</option>
                            <option value="project">Projeto</option>
                            <option value="month">Mês</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service_price">Preço Base (CHF)</Label>
                        <Input
                          id="service_price"
                          type="number"
                          step="0.01"
                          value={serviceFormData.base_price}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, base_price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        {editingService ? "Atualizar" : "Criar"} Serviço
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço Base</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum serviço cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category || "-"}</TableCell>
                        <TableCell>
                          {service.base_price ? `CHF ${service.base_price.toLocaleString("de-CH", { minimumFractionDigits: 2 })}` : "-"}
                        </TableCell>
                        <TableCell>{service.unit}</TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleServiceStatus(service)}
                            >
                              {service.is_active ? "Desativar" : "Ativar"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Perfil</CardTitle>
              </div>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações no Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre atividades importantes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Aparência</CardTitle>
              </div>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative o tema escuro do sistema
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Segurança</CardTitle>
              </div>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alterar Senha</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Para alterar sua senha, faça logout e use a opção "Esqueci minha senha" na página de login.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Sessões Ativas</Label>
                <p className="text-sm text-muted-foreground">
                  Você está logado em 1 dispositivo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardConfiguracao;
