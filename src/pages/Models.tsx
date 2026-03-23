import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Mail, Phone, Instagram } from "lucide-react";
import sofiaProfile from "@/assets/models/sofia-profile.jpg";
import sofia1 from "@/assets/models/sofia-1.jpg";
import sofia2 from "@/assets/models/sofia-2.jpg";
import sofia3 from "@/assets/models/sofia-3.jpg";
import sofia4 from "@/assets/models/sofia-4.jpg";
import sofia5 from "@/assets/models/sofia-5.jpg";

interface Model {
  id: string;
  name: string;
  bio: string | null;
  age: number | null;
  height: number | null;
  measurements: string | null;
  profile_image_url: string | null;
  instagram: string | null;
  email: string | null;
  phone: string | null;
  gallery_images: string[] | null;
}

// Map para fotos locais (temporário para demo)
const localImages: Record<string, string> = {
  "/src/assets/models/sofia-profile.jpg": sofiaProfile,
  "/src/assets/models/sofia-1.jpg": sofia1,
  "/src/assets/models/sofia-2.jpg": sofia2,
  "/src/assets/models/sofia-3.jpg": sofia3,
  "/src/assets/models/sofia-4.jpg": sofia4,
  "/src/assets/models/sofia-5.jpg": sofia5,
};

const Models = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    return localImages[url] || url;
  };

  useEffect(() => {
    fetchModels();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: t("models.loadError"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      setModels(data || []);
    }
  };

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: t("models.quotation.loginRequired"),
        description: t("models.quotation.loginMessage"),
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("quotation_requests").insert({
        user_id: user.id,
        model_id: selectedModel.id,
        project_description: projectDescription,
        event_date: eventDate || null,
        budget_range: budgetRange,
      });

      if (error) throw error;

      toast({
        title: t("models.quotation.success"),
        description: t("models.quotation.successMessage"),
      });

      setIsQuotationOpen(false);
      setProjectDescription("");
      setEventDate("");
      setBudgetRange("");
    } catch (error: any) {
      toast({
        title: t("models.quotation.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            {t("models.title.1")} <span className="text-gradient-animated">{t("models.title.2")}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t("models.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {models.map((model) => (
            <Card
              key={model.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => {
                setSelectedModel(model);
                setIsGalleryOpen(true);
              }}
            >
              {model.profile_image_url && (
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={getImageUrl(model.profile_image_url) || model.profile_image_url}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-primary-foreground text-sm font-medium">Ver Book Completo</p>
                  </div>
                </div>
              )}
              <CardContent className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{model.name}</h3>
                {model.age && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {model.age} {t("models.years")}
                  </p>
                )}
                {model.bio && (
                  <p className="text-muted-foreground line-clamp-3 mb-4 text-sm">
                    {model.bio}
                  </p>
                )}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModel(model);
                    setIsQuotationOpen(true);
                  }}
                  className="w-full"
                  size="sm"
                >
                  {t("models.requestQuote")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedModel?.name}</DialogTitle>
            <DialogDescription className="space-y-4">
              {/* Model Info */}
              <div className="grid sm:grid-cols-2 gap-4 mt-4 text-left">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Idade</p>
                  <p className="font-medium">{selectedModel?.age} anos</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Altura</p>
                  <p className="font-medium">{selectedModel?.height} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Medidas</p>
                  <p className="font-medium">{selectedModel?.measurements}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Instagram</p>
                  <p className="font-medium flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    {selectedModel?.instagram}
                  </p>
                </div>
              </div>

              {selectedModel?.bio && (
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm">{selectedModel.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-left">
                {selectedModel?.email && (
                  <a href={`mailto:${selectedModel.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    {selectedModel.email}
                  </a>
                )}
                {selectedModel?.phone && (
                  <a href={`tel:${selectedModel.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    {selectedModel.phone}
                  </a>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Gallery Grid */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">Book de Fotos</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Profile Photo */}
              {selectedModel?.profile_image_url && (
                <div 
                  className="relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => setSelectedGalleryImage(-1)}
                >
                  <img
                    src={getImageUrl(selectedModel.profile_image_url) || selectedModel.profile_image_url}
                    alt={`${selectedModel.name} - Principal`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              )}
              
              {/* Gallery Images */}
              {selectedModel?.gallery_images?.map((img, index) => (
                <div 
                  key={index}
                  className="relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => setSelectedGalleryImage(index)}
                >
                  <img
                    src={getImageUrl(img) || img}
                    alt={`${selectedModel.name} - ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                setIsGalleryOpen(false);
                setIsQuotationOpen(true);
              }}
            >
              Solicitar Orçamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={isQuotationOpen} onOpenChange={setIsQuotationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("models.quotation.title")}</DialogTitle>
            <DialogDescription>
              {t("models.quotation.description")} {selectedModel?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestQuote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t("models.quotation.projectDescription")}</Label>
              <Textarea
                id="description"
                placeholder={t("models.quotation.projectPlaceholder")}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t("models.quotation.eventDate")}</Label>
              <Input
                id="date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">{t("models.quotation.budgetRange")}</Label>
              <Input
                id="budget"
                placeholder={t("models.quotation.budgetPlaceholder")}
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("models.quotation.sending") : t("models.quotation.submit")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Models;
