import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AdvancedSearchFilters, AdvancedFilters } from "./AdvancedSearchFilters";
import { useState } from "react";

interface SearchResultsHeaderProps {
  resultCount: number;
  location?: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onApplyFilters: () => void;
}

export const SearchResultsHeader = ({
  resultCount,
  location,
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
  onApplyFilters,
}: SearchResultsHeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleApplyFilters = () => {
    onApplyFilters();
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {resultCount > 0 ? `${resultCount} necessidade${resultCount > 1 ? "s" : ""} encontrada${resultCount > 1 ? "s" : ""}` : "Nenhuma necessidade encontrada"}
        </h1>
        <p className="text-muted-foreground">
          {location ? `em ${location}` : "Busque por localização para encontrar ONGs próximas"}
        </p>
      </div>

      <div className="flex gap-3">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] sm:max-w-2xl sm:mx-auto">
            <DrawerHeader>
              <DrawerTitle>Filtros de Busca</DrawerTitle>
            </DrawerHeader>
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              onApply={handleApplyFilters}
              resultCount={resultCount}
            />
          </DrawerContent>
        </Drawer>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="urgency">Mais urgentes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
