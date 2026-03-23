import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, Phone, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  const plans = [
    {
      name: "BASIC",
      price: "2500",
      discountPrice: "2250",
      currency: "CHF",
      features: [
        "Calendrier Media",
        "2h mise à jour Site Web",
        "Programmation CW",
        "Support 3jours/7",
        "Production de Contenu Audiovisuel Primé (6H)",
        "retouche + Montage",
        "9 stories 3 publications",
        "+ 2 heures de Shooting le premier mois",
      ],
      excluded: ["Web design", "Analyse & suivi", "Influenceur", "photographe & studio"],
    },
    {
      name: "STANDART",
      price: "3200",
      discountPrice: "2700",
      currency: "CHF",
      features: [
        "Web Rapport",
        "2h mise à jour Site Web",
        "Programmation CW",
        "Support 4 jours/7",
        "Production de Contenu Audiovisuel Primé (12h)",
        "Retouche + Montage",
        "32 stories 6 posts",
        "Web design",
        "analyse & suivi",
        "15% de rabais 1er Mois",
      ],
      excluded: ["influenceur locaux", "photographe & Studio"],
    },
    {
      name: "PREMIUM",
      price: "4500",
      discountPrice: "4050",
      currency: "CHF",
      features: [
        "Stratégie + Planning",
        "2h mise à jour Site Web",
        "Programmation CW",
        "4 jours /7 support",
        "Production de Contenu Audiovisuel Primé",
        "Retouche + Montage",
        "32 stories 8 8 posts",
        "Web Design",
        "Analyse & Suivi",
        "influenceur locaux",
        "Photographe & Studio",
        "Exclusivité: présentielle 2 jours par semaine (3/4h par J)",
      ],
      excluded: [],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">{t("services.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            {t("services.title.1")} <span className="text-gradient-rainbow">{t("services.title.2")}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative overflow-hidden animate-fade-in hover-scale transition-all duration-500 ${
                index === 2 ? "border-2 border-primary shadow-2xl bg-gradient-to-b from-primary/5 to-transparent" : "hover:shadow-xl"
              }`}
            >
              {index === 2 && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg">
                  {t("services.popular")}
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-4 text-foreground">{plan.name}</h3>
                <div className="mb-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-2xl text-muted-foreground line-through">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.currency}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mt-1">
                    <span className="text-5xl font-bold text-primary">{plan.discountPrice}</span>
                    <span className="text-muted-foreground">{plan.currency}.-/mois</span>
                  </div>
                </div>
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mt-2">
                  {t("services.discount")} {index === 0 && "-10%"} 
                  {index === 1 && "-15%"} 
                  {index === 2 && "-10%"}
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-6">
                <p className="text-sm font-semibold text-muted-foreground mb-4">{t("services.included")}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.excluded.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground mb-4 mt-6">{t("services.notIncluded")}</p>
                    <ul className="space-y-3">
                      {plan.excluded.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3 opacity-60">
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground capitalize">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <Link to="/contact">
                <Button
                  className={`w-full group ${
                    index === 2 ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  variant={index === 2 ? "default" : "outline"}
                  size="lg"
                >
                  {index === 2 && <Mail className="mr-2 h-5 w-5 group-hover:animate-pulse" />}
                  {t("services.hire")}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/20 animate-fade-in">
            <h3 className="text-3xl font-bold mb-4 text-center">
              {t("services.subscription.title")} <span className="text-primary">{t("services.subscription.months")}</span>
            </h3>
            <p className="text-muted-foreground text-center mb-6 text-lg">
              {t("services.subscription.description")}
            </p>
            <div className="text-center">
              <Link to="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 hover-scale group">
                  <Mail className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  {t("services.subscription.cta")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Contact Info */}
          <div className="grid sm:grid-cols-2 gap-6 animate-fade-in">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                {t("services.contact.title")}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{t("services.contact.languages")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a href="tel:+41782323878" className="text-foreground hover:text-primary transition-colors">
                    +41 78 232 38 78
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:Luazul.info@gmail.com" className="text-foreground hover:text-primary transition-colors">
                    Luazul.info@gmail.com
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("services.hours.title")}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.hours.weekday")}</span>
                  <span className="font-semibold">{t("services.hours.appointment")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.hours.saturday")}</span>
                  <span className="font-semibold">{t("services.hours.appointment")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.hours.sunday")}</span>
                  <span className="font-semibold">{t("services.hours.appointment")}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
