import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Target, Eye, Heart, Sparkles } from "lucide-react";
import founderImage from "@/assets/vicky-founder.avif";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const About = () => {
  const { t } = useLanguage();
  const headerReveal = useScrollReveal(0.2);
  const founderReveal = useScrollReveal(0.2);
  
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div 
          ref={headerReveal.elementRef}
          className={`text-center mb-8 md:mb-16 transition-all duration-1000 ${headerReveal.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            {t("about.title.1")} <span className="text-gradient-animated">{t("about.title.2")}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Founder Section */}
        <div 
          ref={founderReveal.elementRef}
          className={`max-w-6xl mx-auto mb-12 md:mb-24 transition-all duration-1000 ${founderReveal.isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
        >
          <Card className="overflow-hidden hover-lift shadow-2xl border-2 border-primary/10">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-[400px] sm:h-[500px] md:h-auto overflow-hidden group bg-gradient-to-br from-primary/20 to-accent/20">
                <img 
                  src={founderImage} 
                  alt="Vicky - Fundadora da Luazul" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    objectPosition: "center 30%"
                  }}
                />
                {/* Gradiente sutil para melhor contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-background/30" />
                
                {/* Efeito de brilho sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Borda decorativa */}
                <div className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary/20 transition-all duration-500" />
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit animate-pulse-glow">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">{t("about.founder.badge")}</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("about.founder.title")} <span className="text-gradient-animated">{t("about.founder.name")}</span>, {t("about.founder.alias")} {t("about.founder.award")} <span className="text-primary">"{t("about.founder.awardName")}"</span>
                </h2>
                
                <p className="text-lg font-semibold text-foreground mb-4">
                  {t("about.founder.subtitle")}
                </p>
                
                <p className="text-lg font-semibold text-primary mb-4">
                  {t("about.founder.ecosystem")} <strong>"{t("about.founder.awardName")}"</strong> {t("about.founder.ecosystemCategory")}
                </p>
                
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    {t("about.founder.bio1")}
                  </p>
                  
                  <p>
                    {t("about.founder.bio2")}
                  </p>
                  
                  <p>
                    {t("about.founder.bio3")}
                  </p>
                  
                  <p>
                    {t("about.founder.bio4")} <span className="font-semibold text-primary">{t("about.founder.bio4Company")}</span>{t("about.founder.bio4End")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
          <Card className="p-8 text-center animate-fade-in hover-scale hover:shadow-xl transition-all duration-500 group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 mx-auto group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <Target className="h-10 w-10 text-primary group-hover:animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t("about.mission.title")}</h3>
            <p className="text-muted-foreground">
              {t("about.mission.description")}
            </p>
          </Card>

          <Card className="p-8 text-center animate-fade-in hover-scale hover:shadow-xl transition-all duration-500 group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 mx-auto group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <Eye className="h-10 w-10 text-primary group-hover:animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t("about.vision.title")}</h3>
            <p className="text-muted-foreground">
              {t("about.vision.description")}
            </p>
          </Card>

          <Card className="p-8 text-center animate-fade-in hover-scale hover:shadow-xl transition-all duration-500 group">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 mx-auto group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <Heart className="h-10 w-10 text-primary group-hover:animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t("about.values.title")}</h3>
            <p className="text-muted-foreground">
              {t("about.values.description")}
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-8 md:mt-16 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            {t("about.stats.title")} <span className="text-gradient-rainbow">{t("about.stats.titleHighlight")}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="group hover-scale">
              <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">100+</div>
              <p className="text-muted-foreground">{t("about.stats.models")}</p>
            </div>
            <div className="group hover-scale">
              <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">200+</div>
              <p className="text-muted-foreground">{t("about.stats.projects")}</p>
            </div>
            <div className="group hover-scale">
              <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">50+</div>
              <p className="text-muted-foreground">{t("about.stats.clients")}</p>
            </div>
            <div className="group hover-scale">
              <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">5+</div>
              <p className="text-muted-foreground">{t("about.stats.experience")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
