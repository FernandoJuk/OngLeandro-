import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { Plus, Home, Eye, Edit, MapPin, MessageSquare, Package } from "lucide-react";
import { DeletePropertyButton } from "@/components/DeletePropertyButton";

const fetchUserProperties = async (userId: string) => {
  const { data, error } = await (supabase as any)
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "needs");
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["user-properties", user?.id],
    queryFn: () => fetchUserProperties(user!.id),
    enabled: !!user && profile?.user_type === "host",
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["user-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const isONG = profile?.user_type === "host";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Olá, {profile?.first_name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            {isONG ? "Gerencie as necessidades da sua ONG" : "Suas doações e conversas"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isONG ? "grid-cols-3" : "grid-cols-2"}`}>
            {isONG && (
              <TabsTrigger value="needs">Minhas Necessidades</TabsTrigger>
            )}
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          {/* ONG: Needs Management */}
          {isONG && (
            <TabsContent value="needs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Necessidades Cadastradas</h2>
                <Button asChild>
                  <Link to="/add-property">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Necessidade
                  </Link>
                </Button>
              </div>

              {propertiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property: any) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={property.images?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 left-2" variant={property.is_active ? "default" : "secondary"}>
                          {property.is_active ? "Ativo" : "Atendido"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link to={`/property/${property.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link to={`/edit-property/${property.id}`}>
                              <Edit className="h-4 w-4 mr-1" /> Editar
                            </Link>
                          </Button>
                          <DeletePropertyButton
                            propertyId={property.id}
                            onPropertyDeleted={() => queryClient.invalidateQueries({ queryKey: ["user-properties", user?.id] })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma necessidade cadastrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Cadastre as necessidades de roupas da sua ONG para que doadores possam encontrá-las.
                  </p>
                  <Button asChild>
                    <Link to="/add-property">
                      <Plus className="h-4 w-4 mr-2" /> Cadastrar Necessidade
                    </Link>
                  </Button>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Conversations */}
          <TabsContent value="conversations" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Conversas</h2>
            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conv: any) => (
                  <Card key={conv.id} className="p-4">
                    <Link to={`/chat/${conv.id}`} className="flex items-center gap-3 hover:opacity-80">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Conversa sobre doação</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma conversa</h3>
                <p className="text-muted-foreground">
                  {isONG
                    ? "Quando doadores entrarem em contato, as conversas aparecerão aqui."
                    : "Encontre uma ONG e inicie uma conversa para doar."}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isONG && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Necessidades</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{properties.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {properties.filter((p: any) => p.is_active).length} ativas
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversas</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversations.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
