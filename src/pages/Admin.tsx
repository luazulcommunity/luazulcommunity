import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Trash2, Plus } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Models state
  const [modelName, setModelName] = useState("");
  const [modelBio, setModelBio] = useState("");
  const [modelAge, setModelAge] = useState("");
  const [modelHeight, setModelHeight] = useState("");
  const [modelMeasurements, setModelMeasurements] = useState("");
  const [modelInstagram, setModelInstagram] = useState("");
  const [models, setModels] = useState<any[]>([]);

  // Clients state
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientContactName, setClientContactName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clients, setClients] = useState<any[]>([]);

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Packages state
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedClientForPackage, setSelectedClientForPackage] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageStartDate, setPackageStartDate] = useState("");
  const [packageEndDate, setPackageEndDate] = useState("");

  // Activities state
  const [selectedPackageForActivity, setSelectedPackageForActivity] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityDueDate, setActivityDueDate] = useState("");
  const [activityStatus, setActivityStatus] = useState("pending");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login/luazul");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchAllData();
    setLoading(false);
  };

  const fetchAllData = async () => {
    fetchModels();
    fetchClients();
    fetchPayments();
    fetchPackages();
  };

  const fetchModels = async () => {
    const { data } = await supabase.from("models").select("*").order("created_at", { ascending: false });
    setModels(data || []);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  };

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });
    setPayments(data || []);
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from("client_packages")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });
    setPackages(data || []);
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("models").insert([{
      name: modelName,
      bio: modelBio,
      age: modelAge ? parseInt(modelAge) : null,
      height: modelHeight ? parseInt(modelHeight) : null,
      measurements: modelMeasurements,
      instagram: modelInstagram,
      is_active: true
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Modelo adicionado!" });
      setModelName(""); setModelBio(""); setModelAge(""); setModelHeight(""); setModelMeasurements(""); setModelInstagram("");
      fetchModels();
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("clients").insert([{
      company_name: clientCompanyName,
      contact_name: clientContactName,
      email: clientEmail,
      phone: clientPhone,
      is_active: true
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Cliente adicionado!" });
      setClientCompanyName(""); setClientContactName(""); setClientEmail(""); setClientPhone("");
      fetchClients();
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("payments").insert([{
      client_id: selectedClientForPayment,
      amount: parseFloat(paymentAmount),
      description: paymentDescription,
      status: paymentStatus
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Pagamento registrado!" });
      setSelectedClientForPayment(""); setPaymentAmount(""); setPaymentDescription(""); setPaymentStatus("pending");
      fetchPayments();
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("client_packages").insert([{
      client_id: selectedClientForPackage,
      package_name: packageName,
      description: packageDescription,
      start_date: packageStartDate,
      end_date: packageEndDate,
      status: "active"
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Pacote criado!" });
      setSelectedClientForPackage(""); setPackageName(""); setPackageDescription(""); setPackageStartDate(""); setPackageEndDate("");
      fetchPackages();
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("package_activities").insert([{
      package_id: selectedPackageForActivity,
      activity_name: activityName,
      description: activityDescription,
      due_date: activityDueDate,
      status: activityStatus
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Atividade adicionada!" });
      setSelectedPackageForActivity(""); setActivityName(""); setActivityDescription(""); setActivityDueDate(""); setActivityStatus("pending");
    }
  };

  const handleDeleteModel = async (id: string) => {
    const { error } = await supabase.from("models").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Modelo excluído!" });
      fetchModels();
    }
  };

  const handleDeleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Cliente excluído!" });
      fetchClients();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-foreground">Painel Administrativo</h1>

        <Tabs defaultValue="models" className="space-y-4 md:space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full gap-1">
            <TabsTrigger value="models" className="text-xs sm:text-sm">Modelos</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm">Clientes</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">Pagamentos</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs sm:text-sm">Pacotes</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs sm:text-sm col-span-2 sm:col-span-1">Atividades</TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Modelo</CardTitle>
                <CardDescription>Preencha os dados do modelo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddModel} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modelName">Nome *</Label>
                      <Input id="modelName" value={modelName} onChange={(e) => setModelName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="modelInstagram">Instagram</Label>
                      <Input id="modelInstagram" value={modelInstagram} onChange={(e) => setModelInstagram(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="modelAge">Idade</Label>
                      <Input id="modelAge" type="number" value={modelAge} onChange={(e) => setModelAge(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="modelHeight">Altura (cm)</Label>
                      <Input id="modelHeight" type="number" value={modelHeight} onChange={(e) => setModelHeight(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="modelMeasurements">Medidas</Label>
                      <Input id="modelMeasurements" value={modelMeasurements} onChange={(e) => setModelMeasurements(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="modelBio">Bio</Label>
                    <Textarea id="modelBio" value={modelBio} onChange={(e) => setModelBio(e.target.value)} rows={3} />
                  </div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Adicionar Modelo</Button>
                </form>

                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-sm md:text-base">Modelos Cadastrados</h3>
                  {models.map((model) => (
                    <div key={model.id} className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg gap-2">
                      <span className="text-sm md:text-base truncate">{model.name}</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteModel(model.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Cliente</CardTitle>
                <CardDescription>Preencha os dados do cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientCompanyName">Nome da Empresa *</Label>
                      <Input id="clientCompanyName" value={clientCompanyName} onChange={(e) => setClientCompanyName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="clientContactName">Nome do Contato *</Label>
                      <Input id="clientContactName" value={clientContactName} onChange={(e) => setClientContactName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Telefone</Label>
                      <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Adicionar Cliente</Button>
                </form>

                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-sm md:text-base">Clientes Cadastrados</h3>
                  {clients.map((client) => (
                    <div key={client.id} className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{client.company_name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{client.email}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)} className="flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Pagamento</CardTitle>
                <CardDescription>Adicione um novo pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Cliente *</Label>
                      <Select value={selectedClientForPayment} onValueChange={setSelectedClientForPayment} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentAmount">Valor (€) *</Label>
                      <Input id="paymentAmount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="paymentDescription">Descrição</Label>
                    <Textarea id="paymentDescription" value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} />
                  </div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Registrar Pagamento</Button>
                </form>

                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Pagamentos Registrados</h3>
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{payment.clients?.company_name}</p>
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">€{payment.amount}</p>
                          <p className="text-sm">{payment.status === "paid" ? "Pago" : "Pendente"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Criar Pacote</CardTitle>
                <CardDescription>Configure um pacote para um cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPackage} className="space-y-4">
                  <div>
                    <Label>Cliente *</Label>
                    <Select value={selectedClientForPackage} onValueChange={setSelectedClientForPackage} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packageName">Nome do Pacote *</Label>
                      <Input id="packageName" value={packageName} onChange={(e) => setPackageName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="packageStartDate">Data Início</Label>
                      <Input id="packageStartDate" type="date" value={packageStartDate} onChange={(e) => setPackageStartDate(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="packageEndDate">Data Fim</Label>
                      <Input id="packageEndDate" type="date" value={packageEndDate} onChange={(e) => setPackageEndDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="packageDescription">Descrição</Label>
                    <Textarea id="packageDescription" value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} />
                  </div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Criar Pacote</Button>
                </form>

                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Pacotes Criados</h3>
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{pkg.package_name}</p>
                      <p className="text-sm text-muted-foreground">{pkg.clients?.company_name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Atividade</CardTitle>
                <CardDescription>Adicione uma atividade a um pacote</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddActivity} className="space-y-4">
                  <div>
                    <Label>Pacote *</Label>
                    <Select value={selectedPackageForActivity} onValueChange={setSelectedPackageForActivity} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pacote" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.package_name} - {pkg.clients?.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activityName">Nome da Atividade *</Label>
                      <Input id="activityName" value={activityName} onChange={(e) => setActivityName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="activityDueDate">Data Limite</Label>
                      <Input id="activityDueDate" type="date" value={activityDueDate} onChange={(e) => setActivityDueDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={activityStatus} onValueChange={setActivityStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activityDescription">Descrição</Label>
                    <Textarea id="activityDescription" value={activityDescription} onChange={(e) => setActivityDescription(e.target.value)} />
                  </div>
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" />Adicionar Atividade</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
