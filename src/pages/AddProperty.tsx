import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";

const CLOTHING_TYPES = [
  "Agasalhos",
  "Cobertores",
  "Casacos",
  "Calças",
  "Camisetas",
  "Meias",
  "Sapatos",
  "Roupas infantis",
  "Roupas de bebê",
  "Roupas íntimas (novas)",
  "Acessórios (gorros, luvas, cachecóis)",
];

const URGENCY_LEVELS = [
  { value: "alta", label: "🔴 Alta - Precisamos urgentemente" },
  { value: "media", label: "🟡 Média - Precisamos em breve" },
  { value: "baixa", label: "🟢 Baixa - Aceitamos quando possível" },
];

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchAddress, loading: cepLoading } = useViaCEP();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "Brasil",
    zip_code: "",
    street_number: "",
    cnpj: "",
    clothing_types: [] as string[],
    urgency: "media",
    images: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
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
        toast({ title: "Endereço encontrado", description: "Os campos foram preenchidos automaticamente" });
      }
    }
  };

  const proceedWithCreation = async () => {
    if (!user) return;
    setShowProfileDialog(false);
    setIsLoading(true);

    try {
      let coordinates = null;
      if (formData.address && formData.street_number && formData.city && formData.state) {
        coordinates = await geocodeAddress(formData.address, formData.street_number, formData.city, formData.state, formData.country);
      }

      const { error } = await supabase.from("properties").insert({
        user_id: user.id,
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
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
      });

      if (error) throw error;

      // Update profile to ONG type
      await supabase.from("profiles").update({ user_type: "host" }).eq("id", user.id);

      toast({ title: "Sucesso!", description: "Necessidade cadastrada com sucesso." });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast({ title: "Erro", description: "Não foi possível cadastrar a necessidade.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }

    if (formData.clothing_types.length === 0) {
      toast({ title: "Atenção", description: "Selecione pelo menos um tipo de roupa.", variant: "destructive" });
      return;
    }

    if (!formData.city || !formData.state || !formData.zip_code) {
      toast({ title: "Atenção", description: "O endereço da ONG é obrigatório para que doadores possam encontrá-la.", variant: "destructive" });
      return;
    }

    // Check profile completion
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, address_line1, city, state, postal_code, country")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return;

    const requiredFields = { first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone };
    const missingFields = Object.entries(requiredFields).filter(([_, value]) => !value);

    if (missingFields.length > 0) {
      setShowProfileDialog(true);
      return;
    }

    await proceedWithCreation();
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cadastrar Necessidade de Roupas</h1>
          <p className="text-muted-foreground">
            Descreva as roupas que sua ONG precisa receber para que doadores possam encontrá-las.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações da Necessidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Precisamos de agasalhos para o inverno"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição detalhada</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva a situação, quantas pessoas serão atendidas, tamanhos necessários..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Urgência</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Clothing Types */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Roupas Necessárias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CLOTHING_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.clothing_types.includes(type)}
                      onCheckedChange={(checked) => handleClothingTypeChange(type, !!checked)}
                    />
                    <label htmlFor={type} className="text-sm cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço da ONG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                ⚠️ O endereço é obrigatório para que doadores possam encontrar sua ONG.
              </p>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP *</Label>
                <div className="relative">
                  <Input id="zip_code" value={formData.zip_code} onChange={(e) => handleInputChange("zip_code", e.target.value)} onBlur={handleCEPBlur} placeholder="Ex: 01234-567" />
                  {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="address">Endereço (Rua)</Label>
                  <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Ex: Rua das Flores" />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor="street_number">Número</Label>
                  <Input id="street_number" value={formData.street_number} onChange={(e) => handleInputChange("street_number", e.target.value)} placeholder="Ex: 123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input id="cnpj" value={formData.cnpj} onChange={(e) => handleInputChange("cnpj", e.target.value)} placeholder="Ex: 00.000.000/0000-00" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input id="state" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos da ONG</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload images={formData.images} onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))} maxImages={10} />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...</> : "Cadastrar Necessidade"}
          </Button>
        </form>
      </div>

      <ProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onComplete={proceedWithCreation}
        userId={user.id}
      />
    </div>
  );
};

export default AddProperty;
