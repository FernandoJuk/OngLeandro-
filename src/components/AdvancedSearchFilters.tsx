import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shirt } from "lucide-react";

export interface AdvancedFilters {
  clothingType: string;
  urgency: string;
  sizes: string[];
}

interface AdvancedSearchFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onApply: () => void;
  resultCount: number;
}

const clothingTypes = [
  { id: "agasalhos", label: "Agasalhos" },
  { id: "cobertores", label: "Cobertores" },
  { id: "roupas_infantis", label: "Roupas Infantis" },
  { id: "roupas_masculinas", label: "Roupas Masculinas" },
  { id: "roupas_femininas", label: "Roupas Femininas" },
  { id: "calcados", label: "Calçados" },
  { id: "acessorios", label: "Acessórios" },
];

const sizes = [
  { id: "PP", label: "PP" },
  { id: "P", label: "P" },
  { id: "M", label: "M" },
  { id: "G", label: "G" },
  { id: "GG", label: "GG" },
  { id: "infantil", label: "Infantil" },
];

export const getAmenityDbValue = (id: string): string => id;

export const AdvancedSearchFilters = ({
  filters,
  onFiltersChange,
  onApply,
  resultCount,
}: AdvancedSearchFiltersProps) => {
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      clothingType: "all",
      urgency: "all",
      sizes: [],
    });
  };

  const toggleSize = (sizeId: string) => {
    const newSizes = filters.sizes.includes(sizeId)
      ? filters.sizes.filter((id) => id !== sizeId)
      : [...filters.sizes, sizeId];
    updateFilter("sizes", newSizes);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Tipo de Roupa */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Tipo de Roupa</h3>
          <div className="grid grid-cols-2 gap-2">
            {clothingTypes.map((type) => {
              const isSelected = filters.clothingType === type.id;
              return (
                <Button
                  key={type.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => updateFilter("clothingType", isSelected ? "all" : type.id)}
                  className="justify-start h-auto py-3"
                >
                  <Shirt className="h-4 w-4 mr-2" />
                  <span className="text-xs">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Urgência */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Urgência</h3>
          <ToggleGroup
            type="single"
            value={filters.urgency}
            onValueChange={(value) => value && updateFilter("urgency", value)}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="all" className="px-4">Qualquer</ToggleGroupItem>
            <ToggleGroupItem value="alta" className="px-4">🔴 Alta</ToggleGroupItem>
            <ToggleGroupItem value="media" className="px-4">🟡 Média</ToggleGroupItem>
            <ToggleGroupItem value="baixa" className="px-4">🟢 Baixa</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        {/* Tamanhos */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Tamanhos Necessários</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const isSelected = filters.sizes.includes(size.id);
              return (
                <Button
                  key={size.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleSize(size.id)}
                  className="h-auto py-3"
                >
                  <span className="text-sm">{size.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="h-24"></div>
      </div>

      {/* Rodapé Fixo */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg z-10">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={clearFilters} className="underline">
            Limpar Filtros
          </Button>
          <Button onClick={onApply} size="lg" className="flex-1 max-w-xs font-semibold">
            Mostrar ({resultCount}) Resultados
          </Button>
        </div>
      </div>
    </div>
  );
};
