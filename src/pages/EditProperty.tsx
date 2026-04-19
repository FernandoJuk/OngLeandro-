import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { MapPin, Package, Loader2 } from "lucide-react";
import { useViaCEP } from "@/hooks/useViaCEP";
import { geocodeAddress } from "@/lib/geocoding";

const CLOTHING_TYPES = [
  "Agasalhos", "Cobertores", "Casacos", "Calças", "Camisetas", "Meias",
  "Sapatos", "Roupas infantis", "Roupas de bebê", "Roupas íntimas (novas)",
  "Acessórios (gorros, luvas, cachecóis)",
];

const URGENCY_LEVELS = [
  { value: "alta", label: "🔴 Alta - Precisamos urgentemente" },
  { value: "media", label: "🟡 Média - Precisamos em breve" },
  { value: "baixa", label: "🟢 Baixa - Aceitamos quando possível" },
];

const EditProperty = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { fetchAddress, loading: cepLoading } = useViaCEP();

  const [formData, setFormData] = useState({
    title: "", description: "", address: "", city: "", state: "",
    country: "Brasil", zip_code: "", street_number: "",
    clothing_types: [] as string[], urgency: "media",
    images: [] as string[], is_active: true,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id || !user) return;
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (error) throw error;
        if (!data) { navigate("/dashboard"); return; }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "Brasil",
          zip_code: data.zip_code || "",
          street_number: data.street_number || "",
          clothing_types: data.clothing_types || [],
          urgency: data.urgency || data.type || "media",
          images: data.images || [],
          is_active: data.is_active ?? true,
        });
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
        navigate("/dashboard");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProperty();
  }, [id, user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClothingTypeChange = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      clothing_types: checked ? [...prev.clothing_types, type] : prev.clothing_types.filter((t) => t !== type),
    }));
  };

  const handleCEPBlur = async () => {
    if (formData.zip_code.replace(/\D/g, "").length === 8) {
      const address = await fetchAddress(formData.zip_code);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          address: address.street || prev.address,
          city: address.city || prev.city,
          state: address.state || prev.state,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setIsLoading(true);

    try {
      let coordinates = null;
      if (formData.address && formData.street_number && formData.city && formData.state) {
        coordinates = await geocodeAddress(formData.address, formData.street_number, formData.city, formData.state, formData.country);
      }

      const { error } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: formData.zip_code,
          street_number: formData.street_number,
          location: `${formData.city}, ${formData.state}`,
          type: formData.urgency,
          urgency: formData.urgency,
          clothing_types: formData.clothing_types,
          images: formData.images,
          is_active: formData.is_active,
          latitude: coordinates?.latitude || null,
          longitude: coordinates?.longitude || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Sucesso!", description: "Necessidade atualizada com sucesso." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Você precisa estar logado.</p>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Editar Necessidade</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Informações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Urgência</Label>
                <Select value={formData.urgency} onValueChange={(v) => handleInputChange("urgency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => handleInputChange("is_active", !!c)} />
                <label htmlFor="is_active" className="text-sm">Necessidade ativa (visível para doadores)</label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tipos de Roupas</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CLOTHING_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`edit-${type}`} checked={formData.clothing_types.includes(type)} onCheckedChange={(c) => handleClothingTypeChange(type, !!c)} />
                    <label htmlFor={`edit-${type}`} className="text-sm cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Endereço</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CEP</Label>
                <div className="relative">
                  <Input value={formData.zip_code} onChange={(e) => handleInputChange("zip_code", e.target.value)} onBlur={handleCEPBlur} />
                  {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label>Rua</Label>
                  <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={formData.street_number} onChange={(e) => handleInputChange("street_number", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Cidade</Label><Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} /></div>
                <div className="space-y-2"><Label>País</Label><Input value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fotos</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload images={formData.images} onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))} maxImages={10} />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Alterações"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
