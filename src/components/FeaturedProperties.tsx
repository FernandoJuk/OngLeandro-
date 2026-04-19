import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "./PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { HandHeart } from "lucide-react";

interface FeaturedPropertyRow {
  id: string;
  images: string[] | null;
  title: string;
  city: string | null;
  state: string | null;
  type: string;
  urgency: string | null;
  clothing_types: string[] | null;
}

const fetchFeaturedProperties = async (): Promise<FeaturedPropertyRow[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select("id, images, title, city, state, type, urgency, clothing_types")
    .eq("is_active", true)
    .eq("is_fulfilled", false)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Erro ao buscar necessidades:", error);
    throw error;
  }
  return data ?? [];
};

const FeaturedProperties = () => {
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: fetchFeaturedProperties,
  });

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">Erro ao carregar necessidades: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HandHeart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ONGs que precisam de doações</h2>
          <p className="text-lg text-muted-foreground">
            Veja as necessidades mais recentes e ajude quem precisa
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties && properties.length > 0 ? (
              properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  id={p.id}
                  images={p.images}
                  title={p.title}
                  location={`${p.city ?? ""}${p.city && p.state ? ", " : ""}${p.state ?? ""}`}
                  type={p.type ?? "media"}
                  initialIsFavorite={false}
                  onFavoriteChange={() => {}}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Nenhuma necessidade cadastrada ainda</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Se você é uma ONG, cadastre-se e publique suas necessidades!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
