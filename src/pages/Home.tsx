import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/lua3.avif";
import lua1 from "@/assets/lua1.png";
import lua2 from "@/assets/lua2.avif";
import lua4 from "@/assets/lua4.png";
import lua5 from "@/assets/lua5.png";
import lua6 from "@/assets/lua6.png";
import lua7 from "@/assets/lua7.png";
import lua8 from "@/assets/lua8.png";
import { Sparkles, Users, TrendingUp, Camera, Zap } from "lucide-react";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Home = () => {
  const [scrollY, setScrollY] = React.useState(0);
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:h-[90vh] flex items-center justify-center overflow-x-hidden overflow-y-visible">
        <div
          className="absolute inset-0 z-0 animate-fade-in transition-transform duration-100 ease-out"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background/90" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 text-center animate-scale-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 animate-fade-in-up text-foreground leading-tight">
            {t("home.hero.title.1")} {t("home.hero.title.2")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-muted-foreground max-w-3xl mx-auto animate-fade-in px-4">
            {t("home.hero.subtitle")}
          </p>
          
          {/* Banner do Prêmio */}
          <div className="mt-6 md:mt-8 mb-8 animate-fade-in">
            <Card className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-2 border-primary/50 p-6 md:p-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-lg font-bold text-primary">{t("home.award.badge")}</span>
                </div>
                <p className="text-base md:text-lg text-foreground font-medium">
                  {t("home.award.description")}
                </p>
              </div>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/models">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground hover-scale group">
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                {t("home.hero.cta1")}
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="hover-scale">
                {t("home.hero.cta2")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Showcase Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              {t("home.gallery.title.1")} <span className="text-gradient-rainbow">{t("home.gallery.title.2")}</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t("home.gallery.subtitle")}
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl animate-fade-in hover-scale">
              <img 
                src={lua1} 
                alt={t("home.gallery.alt")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {[lua4, lua7, lua8, lua6].map((img, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl animate-fade-in hover-scale">
                <img 
                  src={img} 
                  alt={t("home.gallery.alt")}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                })
              ]}
              className="w-full"
            >
              <CarouselContent>
                {[lua1, lua4, lua7, lua8, lua6].map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="group relative overflow-hidden rounded-2xl h-96">
                      <img 
                        src={img} 
                        alt={t("home.gallery.alt")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-16 animate-fade-in">
            {t("home.services.title.1")} <span className="text-gradient-animated">{t("home.services.title.2")}</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in hover-scale group bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50">
              <div className="flex items-center mb-4">
                <Users className="h-10 w-10 text-primary mr-4 group-hover:animate-pulse" />
                <h3 className="text-2xl font-bold">{t("home.services.models.title")}</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                {t("home.services.models.description")}
              </p>
              <Link to="/models">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {t("home.services.models.cta")}
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in hover-scale group bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-10 w-10 text-primary mr-4 group-hover:animate-pulse" />
                <h3 className="text-2xl font-bold">{t("home.services.marketing.title")}</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                {t("home.services.marketing.description")}
              </p>
              <Link to="/services">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {t("home.services.marketing.cta")}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-24 relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-16 animate-fade-in">
            {t("home.why.title.1")} <span className="text-gradient-rainbow">{t("home.why.title.2")}</span>?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center group animate-fade-in hover-scale">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                <Sparkles className="h-10 w-10 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("home.why.professional.title")}</h3>
              <p className="text-muted-foreground">
                {t("home.why.professional.description")}
              </p>
            </div>

            <div className="text-center group animate-fade-in hover-scale">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                <Camera className="h-10 w-10 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("home.why.quality.title")}</h3>
              <p className="text-muted-foreground">
                {t("home.why.quality.description")}
              </p>
            </div>

            <div className="text-center group animate-fade-in hover-scale">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                <TrendingUp className="h-10 w-10 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("home.why.results.title")}</h3>
              <p className="text-muted-foreground">
                {t("home.why.results.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-12 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              {t("home.work.title.1")} <span className="text-gradient-animated">{t("home.work.title.2")}</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t("home.work.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <div className="group relative overflow-hidden rounded-2xl animate-fade-in hover-scale h-96">
              <img 
                src={lua2} 
                alt={t("home.work.fashion.title")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("home.work.fashion.title")}</h3>
                  <p className="text-muted-foreground">{t("home.work.fashion.description")}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl animate-fade-in hover-scale h-96">
              <img 
                src={lua5} 
                alt={t("home.work.events.title")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("home.work.events.title")}</h3>
                  <p className="text-muted-foreground">{t("home.work.events.description")}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl animate-fade-in hover-scale h-96">
              <img 
                src={lua8} 
                alt={t("home.work.digital.title")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("home.work.digital.title")}</h3>
                  <p className="text-muted-foreground">{t("home.work.digital.description")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t("home.cta.title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            {t("home.cta.subtitle")}
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary/90 hover-scale group">
              <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              {t("home.cta.button")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{t("home.footer.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.footer.description")}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">{t("home.footer.contact")}</h3>
              <p className="text-sm text-muted-foreground">+41 78 232 38 78</p>
              <p className="text-sm text-muted-foreground">Luazul.info@gmail.com</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">{t("home.footer.hours")}</h3>
              <p className="text-sm text-muted-foreground">{t("home.footer.hours.weekday")}</p>
              <p className="text-sm text-muted-foreground">{t("home.footer.hours.saturday")}</p>
              <p className="text-sm text-muted-foreground">{t("home.footer.hours.sunday")}</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>{t("home.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
