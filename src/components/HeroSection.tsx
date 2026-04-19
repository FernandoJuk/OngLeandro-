import { MapPin, Search, HandHeart, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) {
      params.append("location", location.trim());
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleNearMe = () => {
    navigate(`/search?autoGps=1`);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <HandHeart className="h-16 w-16 text-white/90" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
          Doe para quem
          <br />
          <span className="text-accent">precisa</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto">
          Encontre ONGs próximas a você e doe roupas para quem mais precisa neste inverno
        </p>

        {/* CTA principal: busca por proximidade (KM) */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-3xl mx-auto">
          {/* <div className="flex items-center justify-center gap-2 mb-3 text-primary">
            <Navigation className="h-5 w-5" />
            <span className="text-sm md:text-base font-semibold">
              Encontre ONGs próximas de você
            </span>
          </div> */}

          <Button
            onClick={handleNearMe}
            className="w-full h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Navigation className="h-5 w-5 mr-2" />
            Localizar ONGs por proximidade (km)
          </Button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou busque por cidade</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cidade, bairro ou CEP..."
                className="pl-10 h-12 border-border"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="outline"
              className="w-full h-12"
            >
              <Search className="h-5 w-5 mr-2" />
              <span>Buscar</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center gap-8 md:gap-16 text-white/80">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
            <div className="text-sm">ONGs cadastradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">5.000+</div>
            <div className="text-sm">Roupas doadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
            <div className="text-sm">Cidades atendidas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;