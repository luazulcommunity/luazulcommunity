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
import { Plus, Upload, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Model {
  id: string;
  name: string;
  bio: string;
  age: number | null;
  height: number | null;
  measurements: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  profile_image_url: string | null;
  gallery_images: string[] | null;
  is_active: boolean;
  created_at: string;
}

const DashboardModelos = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    age: "",
    height: "",
    measurements: "",
    email: "",
    phone: "",
    instagram: "",
    profile_image_url: "",
    gallery_images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar modelos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "profile" | "gallery") => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      // Não precisa do prefixo "models/" pois o bucket já se chama "models"
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("models")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("models")
        .getPublicUrl(filePath);

      if (type === "profile") {
        setFormData({ ...formData, profile_image_url: data.publicUrl });
      } else {
        setFormData({
          ...formData,
          gallery_images: [...formData.gallery_images, data.publicUrl],
        });
      }

      toast({
        title: "Imagem enviada",
        description: "A imagem foi carregada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const modelData = {
        name: formData.name,
        bio: formData.bio,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseInt(formData.height) : null,
        measurements: formData.measurements || null,
        email: formData.email || null,
        phone: formData.phone || null,
        instagram: formData.instagram || null,
        profile_image_url: formData.profile_image_url || null,
        gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      };

      if (editingModel) {
        const { error } = await supabase
          .from("models")
          .update(modelData)
          .eq("id", editingModel.id);

        if (error) throw error;

        toast({
          title: "Modelo atualizado",
          description: "O modelo foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("models")
          .insert([modelData]);

        if (error) throw error;

        toast({
          title: "Modelo criado",
          description: "O modelo foi adicionado com sucesso",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchModels();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar modelo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este modelo?")) return;

    try {
      const { error } = await supabase
        .from("models")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Modelo excluído",
        description: "O modelo foi removido com sucesso",
      });

      fetchModels();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir modelo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      bio: model.bio || "",
      age: model.age?.toString() || "",
      height: model.height?.toString() || "",
      measurements: model.measurements || "",
      email: model.email || "",
      phone: model.phone || "",
      instagram: model.instagram || "",
      profile_image_url: model.profile_image_url || "",
      gallery_images: model.gallery_images || [],
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      age: "",
      height: "",
      measurements: "",
      email: "",
      phone: "",
      instagram: "",
      profile_image_url: "",
      gallery_images: [],
    });
    setEditingModel(null);
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
          <h2 className="text-3xl font-bold tracking-tight">Modelos</h2>
          <p className="text-muted-foreground">
            Gerencie os modelos do site com fotos e biografias
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModel ? "Editar Modelo" : "Novo Modelo"}</DialogTitle>
              <DialogDescription>
                {editingModel ? "Atualize as informações do modelo" : "Adicione um novo modelo ao site"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="measurements">Medidas</Label>
                  <Input
                    id="measurements"
                    value={formData.measurements}
                    onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
                    placeholder="90-60-90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  {formData.profile_image_url && (
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.profile_image_url} />
                      <AvatarFallback>Foto</AvatarFallback>
                    </Avatar>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "profile");
                    }}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Galeria de Fotos</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleImageUpload(file, "gallery"));
                  }}
                  disabled={uploading}
                />
                {formData.gallery_images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.gallery_images.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              gallery_images: formData.gallery_images.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Enviando..." : editingModel ? "Atualizar" : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Modelos</CardTitle>
          <CardDescription>Todos os modelos cadastrados no site</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Altura</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum modelo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={model.profile_image_url || undefined} />
                        <AvatarFallback>{model.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.age || "-"}</TableCell>
                    <TableCell>{model.height ? `${model.height}cm` : "-"}</TableCell>
                    <TableCell>{model.instagram || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={model.is_active ? "default" : "secondary"}>
                        {model.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
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
    </div>
  );
};

export default DashboardModelos;

