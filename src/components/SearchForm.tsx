import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Shirt } from "lucide-react";

interface SearchFormProps {
  defaultLocation?: string;
  defaultClothingType?: string;
  defaultUrgency?: string;
}

const clothingTypes = [
  { value: "all", label: "Todos os tipos" },
  { value: "agasalhos", label: "Agasalhos" },
  { value: "cobertores", label: "Cobertores" },
  { value: "roupas_infantis", label: "Roupas Infantis" },
  { value: "roupas_masculinas", label: "Roupas Masculinas" },
  { value: "roupas_femininas", label: "Roupas Femininas" },
  { value: "calcados", label: "Calçados" },
  { value: "acessorios", label: "Acessórios (gorros, luvas, meias)" },
];

const urgencyLevels = [
  { value: "all", label: "Todas as urgências" },
  { value: "alta", label: "🔴 Alta" },
  { value: "media", label: "🟡 Média" },
  { value: "baixa", label: "🟢 Baixa" },
];

export const SearchForm = ({
  defaultLocation = "",
  defaultClothingType = "all",
  defaultUrgency = "all",
}: SearchFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || defaultLocation);
  const [clothingType, setClothingType] = useState(searchParams.get("clothingType") || defaultClothingType);
  const [urgency, setUrgency] = useState(searchParams.get("urgency") || defaultUrgency);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.append("location", location.trim());
    }
    if (clothingType && clothingType !== "all") {
      params.append("clothingType", clothingType);
    }
    if (urgency && urgency !== "all") {
      params.append("urgency", urgency);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <Card className="bg-background/95 backdrop-blur-sm shadow-card-hover border-0">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Localização */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Localização</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cidade ou bairro..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 border-border bg-background"
              />
            </div>
          </div>

          {/* Tipo de Roupa */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de Roupa</label>
            <Select value={clothingType} onValueChange={setClothingType}>
              <SelectTrigger>
                <Shirt className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {clothingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgência */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Urgência</label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão de busca */}
          <div className="flex items-end">
            <Button variant="hero" className="w-full" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Buscar ONGs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
