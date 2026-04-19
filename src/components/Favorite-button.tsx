import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  propertyId: string;
}

export const FavoriteButton = ({ propertyId }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('favorites' as any)
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .single();

        setIsFavorite(!!data);
      } else {
        setIsFavorite(false);
      }
      setIsLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkFavoriteStatus();
    });
    
    checkFavoriteStatus();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [propertyId]);

  const handleFavoriteClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("User not logged in. Please log in to favorite properties.");
      return;
    }
    
    setIsLoading(true);

    try {
      if (isFavorite) {
        await supabase
          .from('favorites' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites' as any)
          .insert({ user_id: user.id, property_id: propertyId });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="bg-background/80 hover:bg-background rounded-full"
      onClick={handleFavoriteClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-colors duration-200 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-foreground'
          }`}
        />
      )}
    </Button>
  );
};