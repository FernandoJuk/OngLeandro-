import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { FavoriteButton } from "@/components/Favorite-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { Camera, MessageSquare, MapPin, Users, Package } from "lucide-react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { geocodeAddress } from "@/lib/geocoding";

type PropertyWithProfile = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  type: string;
  images: string[] | null;
  is_active: boolean;
  host_id: string;
  latitude: number | null;
  longitude: number | null;
  clothing_types: string[] | null;
  urgency: string | null;
  sizes_needed: string[] | null;
  quantity_needed: number | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
};

const fetchProperty = async (id: string): Promise<PropertyWithProfile> => {
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) throw error;

  const hostId = (property as any).user_id;

  if (property && hostId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, bio")
      .eq("id", hostId)
      .maybeSingle();

    return {
      ...property,
      host_id: hostId ?? "",
      profiles: profile,
    };
  }

  return {
    ...property,
    host_id: hostId ?? "",
    profiles: null,
  };
};

const Property = () => {
  const { id } = useParams<{ id: string }>();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });

  useEffect(() => {
    const getCoordinates = async () => {
      if (property) {
        if (property.latitude && property.longitude) {
          setCoordinates({ latitude: property.latitude, longitude: property.longitude });
        } else if (property.address && property.city && property.state) {
          const coords = await geocodeAddress(property.address, "", property.city, property.state, property.country);
          if (coords) setCoordinates(coords);
        }
      }
    };
    getCoordinates();
  }, [property]);

  if (!id) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full mb-8 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Necessidade não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            A necessidade que você procura não existe ou foi removida.
          </p>
          <Button onClick={() => window.history.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  const handleStartChat = async () => {
    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    const hostId = property?.host_id;
    if (!hostId) return;

    const { data: conversationData } = await supabase
      .from("conversations")
      .select("id")
      .eq("host_id", hostId)
      .eq("guest_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle();

    let conversationId = conversationData?.id;

    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    } else {
      navigate(`/chat/new`, {
        state: { propertyId: property.id, hostId, guestId: user.id },
      });
    }
  };

  const mappedImages = property.images || ["/placeholder.svg"];
  const clothingTypes = property.clothing_types || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{property.city}, {property.state}, {property.country}</span>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="relative mb-8">
          <div className="grid grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
            <div className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
              <img src={mappedImages[0]} alt={property.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
            {mappedImages.slice(1, 5).map((image, index) => (
              <div key={index} className="col-span-2 md:col-span-1 relative cursor-pointer group overflow-hidden" onClick={() => setShowAllPhotos(true)}>
                <img src={image} alt={`${property.title} - ${index + 2}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                {index === 3 && mappedImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{mappedImages.length - 5} fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" className="absolute bottom-4 right-4 bg-background/95 hover:bg-background" onClick={() => setShowAllPhotos(true)}>
            <Camera className="mr-2 h-4 w-4" />
            Ver todas as fotos
          </Button>
          <div className="absolute top-4 right-4">
            <FavoriteButton propertyId={id} />
          </div>
        </div>

        <PropertyImageGallery images={mappedImages} propertyTitle={property.title} open={showAllPhotos} onOpenChange={setShowAllPhotos} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* ONG Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {property.profiles?.avatar_url ? (
                    <img src={property.profiles.avatar_url} alt="ONG" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    ONG: {property.profiles?.first_name} {property.profiles?.last_name}
                  </h3>
                  {property.profiles?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{property.profiles.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {property.description && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Sobre esta necessidade</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            <Separator />

            {clothingTypes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Tipos de roupas necessárias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {clothingTypes.map((detail) => (
                    <Badge key={detail} variant="outline" className="text-sm py-1 px-3">
                      {detail}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Map */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Localização da ONG</h2>
              {coordinates ? (
                <div className="rounded-lg overflow-hidden">
                  <InteractiveMap
                    properties={[{
                      id: property.id,
                      title: property.title,
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                      images: property.images || [],
                    }]}
                    selectedPropertyId={property.id}
                    className="h-[480px]"
                  />
                </div>
              ) : (
                <div className="h-[480px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando localização...</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="font-medium text-foreground">{property.city}, {property.state}, {property.country}</p>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Chat CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="border border-border rounded-xl p-6 space-y-4 bg-card shadow-sm">
                <h3 className="text-xl font-semibold text-foreground">Quer doar?</h3>
                <p className="text-muted-foreground text-sm">
                  Converse com a ONG pelo chat para combinar a entrega das roupas.
                </p>
                {user?.id !== property.host_id && (
                  <Button onClick={handleStartChat} className="w-full" size="lg">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chamar a ONG no Chat
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  A logística da doação é combinada diretamente entre doador e ONG
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Property;
