import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useViaCEP } from "@/hooks/useViaCEP";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { User, Phone, Home, Loader2 } from "lucide-react";

// Schema de validação
const profileCompletionSchema = z.object({
  first_name: z.string().min(1, "Primeiro nome é obrigatório").max(80),
  last_name: z.string().min(1, "Sobrenome é obrigatório").max(80),
  cpf: z.string().min(11, "CPF é obrigatório"),
  phone: z.string().optional(),
  whatsapp: z.string().min(10, "Telefone/WhatsApp é obrigatório"),
  postal_code: z.string().min(8, "CEP é obrigatório"),
  address_line1: z.string().min(1, "Endereço é obrigatório"),
  street_number: z.string().min(1, "Número é obrigatório"),
  district: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
});

type ProfileCompletionForm = z.infer<typeof profileCompletionSchema>;

// Máscaras
const maskPhone = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})/, "($1) ");
  if (value.length > 10) {
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return value.substring(0, 15);
};

const maskCPF = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return value.substring(0, 14);
};

const maskCEP = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{5})(\d)/, "$1-$2");
  return value.substring(0, 9);
};

interface ProfileCompletionDialogProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  onOpenChange?: (open: boolean) => void;
}

export const ProfileCompletionDialog = ({
  open,
  onComplete,
  userId,
  onOpenChange,
}: ProfileCompletionDialogProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { fetchAddress, loading: cepLoading } = useViaCEP();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileCompletionForm>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      cpf: "",
      phone: "",
      whatsapp: "",
      postal_code: "",
      address_line1: "",
      street_number: "",
      district: "",
      city: "",
      state: "",
    },
  });

  const postalCode = watch("postal_code");

  const handleCEPBlur = async () => {
    if (postalCode && postalCode.replace(/\D/g, "").length === 8) {
      const address = await fetchAddress(postalCode);
      if (address) {
        setValue("address_line1", address.street || "");
        setValue("district", address.district || "");
        setValue("city", address.city || "");
        setValue("state", address.state || "");
      }
    }
  };

  const onSubmit = async (data: ProfileCompletionForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          cpf: data.cpf.replace(/\D/g, ""),
          phone: data.phone?.replace(/\D/g, ""),
          whatsapp: data.whatsapp.replace(/\D/g, ""),
          postal_code: data.postal_code.replace(/\D/g, ""),
          address_line1: data.address_line1,
          address_line2: data.street_number,
          district: data.district,
          city: data.city,
          state: data.state,
          country: "Brasil",
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Dados salvos!",
        description: "Seus dados foram cadastrados com sucesso.",
      });

      onComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 3) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-4">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Informações Pessoais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Primeiro nome *</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="Ex: João"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome *</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="Ex: Silva"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                {...register("cpf")}
                placeholder="000.000.000-00"
                onChange={(e) => {
                  const masked = maskCPF(e.target.value);
                  setValue("cpf", masked);
                }}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Phone className="h-5 w-5" />
              <h3 className="font-semibold">Contatos</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const masked = maskPhone(e.target.value);
                  setValue("whatsapp", masked);
                }}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Será usado para contato sobre doações
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone alternativo</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const masked = maskPhone(e.target.value);
                  setValue("phone", masked);
                }}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Home className="h-5 w-5" />
              <h3 className="font-semibold">Endereço Residencial</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">CEP *</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                placeholder="00000-000"
                onChange={(e) => {
                  const masked = maskCEP(e.target.value);
                  setValue("postal_code", masked);
                }}
                onBlur={handleCEPBlur}
              />
              {cepLoading && (
                <p className="text-sm text-muted-foreground">Buscando endereço...</p>
              )}
              {errors.postal_code && (
                <p className="text-sm text-destructive">{errors.postal_code.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="address_line1">Endereço (Rua) *</Label>
                <Input
                  id="address_line1"
                  {...register("address_line1")}
                  placeholder="Ex: Rua das Flores"
                />
                {errors.address_line1 && (
                  <p className="text-sm text-destructive">{errors.address_line1.message}</p>
                )}
              </div>
              <div className="md:col-span-1 space-y-2">
                <Label htmlFor="street_number">Número *</Label>
                <Input
                  id="street_number"
                  {...register("street_number")}
                  placeholder="Ex: 123"
                />
                {errors.street_number && (
                  <p className="text-sm text-destructive">{errors.street_number.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">Bairro *</Label>
                <Input id="district" {...register("district")} placeholder="Bairro" />
                {errors.district && (
                  <p className="text-sm text-destructive">{errors.district.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input id="city" {...register("city")} placeholder="Cidade" />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input id="state" {...register("state")} placeholder="UF" maxLength={2} />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete seu cadastro</DialogTitle>
          <DialogDescription>
            Para continuar, precisamos de algumas informações sobre você.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Etapa {step} de 3</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="flex gap-3 justify-end">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalizar Cadastro
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
