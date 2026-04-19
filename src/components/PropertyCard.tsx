import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PropertyCardProps {
  id: string;
  images?: string[] | null;
  image?: string;
  title: string;
  location: string;
  type: string;
  initialIsFavorite: boolean;
  onFavoriteChange: (propertyId: string, isFavorite: boolean) => void;
}

// Map urgency types to display
const urgencyMap: Record<string, { label: string; color: string }> = {
  alta: { label: "Urgente", color: "bg-red-100 text-red-800" },
  media: { label: "Moderada", color: "bg-yellow-100 text-yellow-800" },
  baixa: { label: "Baixa", color: "bg-green-100 text-green-800" },
};

export const PropertyCard = ({
  id,
  images,
  image,
  title,
  location,
  type,
  initialIsFavorite,
  onFavoriteChange,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("favorites" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("property_id", id)
          .limit(1);
        setIsFavorite(!!(data && data.length > 0));
      } else {
        setIsFavorite(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkFavoriteStatus();
    });
    checkFavoriteStatus();

    return () => { authListener?.subscription.unsubscribe(); };
  }, [id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    try {
      if (isFavorite) {
        await supabase.from("favorites" as any).delete().eq("user_id", user.id).eq("property_id", id);
        setIsFavorite(false);
        onFavoriteChange(id, false);
      } else {
        await supabase.from("favorites" as any).insert({ user_id: user.id, property_id: id });
        setIsFavorite(true);
        onFavoriteChange(id, true);
      }
    } catch (error) {
      console.error("Falha ao atualizar favorito:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const imagePath = images?.[0] || image || "/placeholder.svg";
  const urgency = urgencyMap[type] || { label: type, color: "bg-muted text-muted-foreground" };

  return (
    <Card className="group bg-gradient-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] border-0 overflow-hidden cursor-pointer">
      <div className="relative">
        <Link to={`/property/${id}`} className="block">
          <img src={imagePath} alt={title} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 hover:bg-background text-foreground rounded-full"
          onClick={handleFavoriteClick}
          disabled={isLoading}
        >
          <Heart className={`h-4 w-4 transition-colors duration-200 ${isFavorite ? "fill-red-500 text-red-500" : "fill-none text-foreground"}`} />
        </Button>
        <Badge className={`absolute top-3 left-3 ${urgency.color}`}>
          {urgency.label}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Precisa de doações</span>
        </div>
      </CardContent>
    </Card>
  );
};
