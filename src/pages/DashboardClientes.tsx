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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
}

interface Package {
  id: string;
  client_id: string;
  package_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

const DashboardClientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    subscription_tier: "basic",
  });
  const [packageFormData, setPackageFormData] = useState({
    package_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    fetchPackages();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("client_packages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar pacotes:", error);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("clients")
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Cliente criado",
        description: "O cliente foi adicionado com sucesso",
      });

      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        subscription_tier: "basic",
      });
      setDialogOpen(false);
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("client_packages")
        .insert([{
          ...packageFormData,
          client_id: selectedClient.id,
        }]);

      if (error) throw error;

      toast({
        title: "Pacote criado",
        description: "O pacote foi adicionado com sucesso",
      });

      setPackageFormData({
        package_name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active",
      });
      setPackageDialogOpen(false);
      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Erro ao criar pacote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getClientPackages = (clientId: string) => {
    return packages.filter(pkg => pkg.client_id === clientId);
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
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie clientes e seus pacotes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Adicione um novo cliente ao sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nome do Contato</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_tier">Plano</Label>
                <select
                  id="subscription_tier"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.subscription_tier}
                  onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                >
                  <option value="basic">Básico</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="packages">Pacotes</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Todos os clientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.company_name}</TableCell>
                        <TableCell>{client.contact_name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.subscription_tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.is_active ? "default" : "secondary"}>
                            {client.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setPackageDialogOpen(true);
                            }}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Pacotes
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

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pacotes de Clientes</CardTitle>
              <CardDescription>Gerencie os pacotes de cada cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => {
                  const clientPackages = getClientPackages(client.id);
                  return (
                    <Card key={client.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{client.company_name}</CardTitle>
                        <CardDescription>{clientPackages.length} pacote(s)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {clientPackages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhum pacote cadastrado</p>
                        ) : (
                          <div className="space-y-2">
                            {clientPackages.map((pkg) => (
                              <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{pkg.package_name}</p>
                                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">{pkg.status}</Badge>
                                    {pkg.start_date && (
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(pkg.start_date), "dd/MM/yyyy", { locale: ptBR })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedClient(client);
                            setPackageDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Pacote
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pacote</DialogTitle>
            <DialogDescription>
              Adicione um pacote para {selectedClient?.company_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="package_name">Nome do Pacote</Label>
              <Input
                id="package_name"
                value={packageFormData.package_name}
                onChange={(e) => setPackageFormData({ ...packageFormData, package_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={packageFormData.description}
                onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={packageFormData.start_date}
                  onChange={(e) => setPackageFormData({ ...packageFormData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={packageFormData.end_date}
                  onChange={(e) => setPackageFormData({ ...packageFormData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={packageFormData.status}
                onChange={(e) => setPackageFormData({ ...packageFormData, status: e.target.value })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardClientes;

