import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptySearchState = () => {
  return (
    <div className="col-span-full text-center py-16">
      <HandHeart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-foreground mb-2">
        Nenhuma necessidade encontrada
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Tente buscar por outra localização ou ajuste os filtros. Novas necessidades são cadastradas pelas ONGs diariamente.
      </p>
      <Button onClick={() => window.location.href = '/search'}>
        Ver todas as necessidades
      </Button>
    </div>
  );
};
