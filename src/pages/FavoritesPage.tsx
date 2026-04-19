import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { supabase } from '@/integrations/supabase/client';
import { PropertyCard } from "@/components/PropertyCard";
import { Link } from "react-router-dom";
import { HandHeart } from "lucide-react";

const FavoritesPage = () => {
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveFavorite = (propertyId: string) => {
    setFavoriteProperties(prev => prev.filter((p) => p.id !== propertyId));
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Você precisa estar logado para ver seus favoritos.");
        setIsLoading(false);
        return;
      }

      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        setError("Falha ao buscar favoritos.");
        setIsLoading(false);
        return;
      }

      if (!favorites || favorites.length === 0) {
        setFavoriteProperties([]);
        setIsLoading(false);
        return;
      }

      const propertyIds = favorites.map((fav) => fav.property_id);

      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propertiesError) {
        setError("Falha ao buscar detalhes.");
      } else {
        setFavoriteProperties(properties || []);
      }

      setIsLoading(false);
    };

    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6 text-center mt-8">Meus Favoritos</h1>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p>Carregando favoritos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isLoading && !error && favoriteProperties.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <HandHeart className="h-12 w-12 mx-auto mb-4" />
            <p className="mb-4">Você ainda não tem necessidades favoritas.</p>
            <Link to="/" className="text-primary hover:underline">
              Explorar necessidades
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!isLoading && !error && favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              images={property.images}
              title={property.title}
              location={`${property.city ?? ""}${property.city && property.state ? ", " : ""}${property.state ?? ""}`}
              type={property.type ?? "media"}
              initialIsFavorite={true}
              onFavoriteChange={handleRemoveFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
