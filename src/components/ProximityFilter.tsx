import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import { useGeolocation, type Coordinates } from "@/hooks/useGeolocation";
import { geocodeByCep } from "@/lib/geocoding";
import { toast } from "@/hooks/use-toast";

interface ProximityFilterProps {
  origin: Coordinates | null;
  originLabel: string | null;
  radiusKm: number;
  onChange: (origin: Coordinates | null, label: string | null, radiusKm: number) => void;
}

export const ProximityFilter = ({
  origin,
  originLabel,
  radiusKm,
  onChange,
}: ProximityFilterProps) => {
  const { loading: gpsLoading, requestLocation } = useGeolocation();
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const handleUseGps = async () => {
    const coords = await requestLocation();
    if (coords) {
      onChange(coords, "Minha localização atual", radiusKm);
      toast({
        title: "Localização obtida",
        description: "Buscando ONGs próximas de você.",
      });
    } else {
      toast({
        title: "Não foi possível obter sua localização",
        description: "Permita o acesso no navegador ou informe seu CEP abaixo.",
        variant: "destructive",
      });
    }
  };

  const handleUseCep = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Informe um CEP com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }
    setCepLoading(true);
    const coords = await geocodeByCep(clean);
    setCepLoading(false);

    if (coords) {
      onChange(coords, `CEP ${clean.slice(0, 5)}-${clean.slice(5)}`, radiusKm);
      toast({
        title: "Localização definida",
        description: "Buscando ONGs próximas do CEP informado.",
      });
    } else {
      toast({
        title: "CEP não localizado",
        description: "Não conseguimos encontrar coordenadas para este CEP.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setCep("");
    onChange(null, null, radiusKm);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Buscar por proximidade</h3>
          </div>
          {origin && (
            <Badge variant="secondary" className="gap-1">
              {originLabel}
              <button
                onClick={handleClear}
                className="ml-1 hover:text-destructive"
                aria-label="Limpar localização"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        {!origin ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Para mostrar ONGs perto de você, precisamos saber onde você está. Escolha uma opção:
            </p>

            <Button
              onClick={handleUseGps}
              disabled={gpsLoading}
              variant="outline"
              className="w-full justify-start"
            >
              {gpsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Usar minha localização atual (GPS)
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proximity-cep" className="text-xs">
                Informe seu CEP
              </Label>
              <div className="flex gap-2">
                <Input
                  id="proximity-cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  maxLength={9}
                  onKeyDown={(e) => e.key === "Enter" && handleUseCep()}
                />
                <Button onClick={handleUseCep} disabled={cepLoading}>
                  {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Usar"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Raio de busca</Label>
              <span className="text-sm font-semibold text-primary">{radiusKm} km</span>
            </div>
            <Slider
              value={[radiusKm]}
              min={1}
              max={100}
              step={1}
              onValueChange={(v) => onChange(origin, originLabel, v[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
