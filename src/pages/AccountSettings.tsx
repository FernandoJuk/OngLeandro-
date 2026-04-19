import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { VerificationCodeDialog } from "@/components/VerificationCodeDialog";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useViaCEP } from "@/hooks/useViaCEP";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import { Phone, Home, Shield, User, Loader2 } from "lucide-react";

// ---------- Schemas ----------
const profileSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório").max(80),
  last_name: z.string().optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Senha atual é obrigatória."),
    new_password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

// ---------- Masks ----------
const maskPhone = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})/, "($1) ");
  if (value.length > 10) value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value.substring(0, 15);
};

const maskStandardPhone = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})/, "($1) ");
  if (value.length > 9) value = value.replace(/(\d{4})(\d)/, "$1-$2");
  return value.substring(0, 14);
};

const maskCEP = (value: string) => {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{5})(\d)/, "$1-$2");
  return value.substring(0, 9);
};

const formatDBDateToBR = (dbDate: string) => {
  if (!dbDate || dbDate.length !== 10) return "";
  const [year, month, day] = dbDate.split("-");
  return `${day}/${month}/${year}`;
};

const maskCPFCNPJ = (value: string) => {
  value = value.replace(/\D/g, "");
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value.substring(0, 14);
  } else {
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    return value.substring(0, 18);
  }
};

const maskBirthDate = (value: string) => {
  value = value.replace(/\D/g, "");
  if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, "$1/$2");
  if (value.length > 5) value = value.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  return value.substring(0, 10);
};

// ---------- Component ----------
const AccountSettings = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    actionType: string;
    actionData?: any;
    title: string;
    description: string;
  }>({ open: false, actionType: "", title: "", description: "" });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "", last_name: "", cpf: "", birth_date: "",
      phone: "", whatsapp: "", emergency_contact_name: "", emergency_contact_phone: "",
      address_line1: "", address_line2: "", district: "",
      city: "", state: "", postal_code: "", country: "Brasil",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const { fetchAddress: fetchCEP, loading: cepLoading } = useViaCEP();

  // Load profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: p, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;
        profileForm.reset({
          first_name: p?.first_name ?? "", last_name: p?.last_name ?? "",
          cpf: p?.cpf ?? "", birth_date: p?.birth_date ? formatDBDateToBR(p.birth_date) : "",
          phone: p?.phone ?? "", whatsapp: p?.whatsapp ?? "",
          emergency_contact_name: p?.emergency_contact_name ?? "",
          emergency_contact_phone: p?.emergency_contact_phone ?? "",
          address_line1: p?.address_line1 ?? "", address_line2: p?.address_line2 ?? "",
          district: p?.district ?? "", city: p?.city ?? "", state: p?.state ?? "",
          postal_code: p?.postal_code ?? "", country: p?.country ?? "Brasil",
        });
      } catch (e: any) {
        console.error(e);
        toast.error("Erro ao carregar seus dados");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSaveProfile = async (values: ProfileForm) => {
    if (!user) return;
    try {
      const payload = { ...values } as any;
      if (payload.birth_date && payload.birth_date.length === 10) {
        const [day, month, year] = payload.birth_date.split("/");
        payload.birth_date = `${year}-${month}-${day}`;
      } else if (payload.birth_date === "") {
        payload.birth_date = null;
      }
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleCEPBlur = async () => {
    const cep = profileForm.getValues("postal_code");
    if (cep && cep.replace(/\D/g, "").length === 8) {
      const address = await fetchCEP(cep);
      if (address) {
        profileForm.setValue("address_line1", address.street || profileForm.getValues("address_line1"));
        profileForm.setValue("district", address.district || profileForm.getValues("district"));
        profileForm.setValue("city", address.city || profileForm.getValues("city"));
        profileForm.setValue("state", address.state || profileForm.getValues("state"));
        toast.success("Endereço encontrado e preenchido automaticamente");
      }
    }
  };

  const onChangePassword = async (values: PasswordForm) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "", password: values.current_password,
      });
      if (signInError) { toast.error("Senha atual incorreta."); return; }
      setVerificationDialog({
        open: true, actionType: "password_change",
        actionData: { new_password: values.new_password },
        title: "Verificação Necessária",
        description: "Por segurança, enviamos um código de verificação para seu e-mail.",
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao verificar senha atual");
    }
  };

  const handlePasswordVerified = async (actionData: any) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: actionData.new_password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso!");
      passwordForm.reset();
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao alterar senha");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground">Entre para gerenciar seus dados.</p>
          <Button asChild className="mt-6"><Link to="/auth">Fazer login</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-1">Configurações da Conta</h1>
        <p className="text-muted-foreground mb-6">Mantenha seus dados atualizados para facilitar doações e contatos.</p>

        <Tabs defaultValue="profile" className="flex flex-col space-y-6">
          <TabsList className="flex w-full overflow-x-auto justify-start md:justify-between py-6 md:py-0">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Perfil</TabsTrigger>
            <TabsTrigger value="contacts"><Phone className="h-4 w-4 mr-2" />Contatos</TabsTrigger>
            <TabsTrigger value="address"><Home className="h-4 w-4 mr-2" />Endereço</TabsTrigger>
            <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Alterar Senha</TabsTrigger>
          </TabsList>

          {/* PERFIL */}
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Nome</Label><Input {...profileForm.register("first_name")} placeholder="Seu nome" /></div>
                  <div><Label>Sobrenome</Label><Input {...profileForm.register("last_name")} placeholder="Seu sobrenome" /></div>
                  <div>
                    <Label>CPF</Label>
                    <Input {...profileForm.register("cpf", { onChange: (e) => profileForm.setValue("cpf", maskCPFCNPJ(e.target.value)) })} maxLength={18} />
                  </div>
                  <div>
                    <Label>Data de nascimento</Label>
                    <Input type="text" placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10}
                      {...profileForm.register("birth_date", { onChange: (e) => profileForm.setValue("birth_date", maskBirthDate(e.target.value), { shouldValidate: true }) })} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={profileForm.handleSubmit(onSaveProfile)} disabled={loading}>Salvar alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTATOS */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader><CardTitle>Contatos</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input {...profileForm.register("phone", { onChange: (e) => profileForm.setValue("phone", maskStandardPhone(e.target.value)) })} placeholder="(11) 9999-9999" maxLength={14} />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input {...profileForm.register("whatsapp", { onChange: (e) => profileForm.setValue("whatsapp", maskPhone(e.target.value)) })} placeholder="(11) 98888-8888" maxLength={15} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Contato de emergência</Label>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      <Input {...profileForm.register("emergency_contact_name")} placeholder="Nome" />
                      <Input {...profileForm.register("emergency_contact_phone", { onChange: (e) => profileForm.setValue("emergency_contact_phone", maskPhone(e.target.value)) })} placeholder="(11) 98888-8888" maxLength={15} />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end"><Button onClick={profileForm.handleSubmit(onSaveProfile)}>Salvar</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENDEREÇO */}
          <TabsContent value="address">
            <Card>
              <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><Label>Endereço (linha 1)</Label><Input {...profileForm.register("address_line1")} placeholder="Rua, número" /></div>
                  <div className="md:col-span-2"><Label>Complemento</Label><Input {...profileForm.register("address_line2")} placeholder="Apto, bloco (opcional)" /></div>
                  <div><Label>Bairro</Label><Input {...profileForm.register("district")} /></div>
                  <div><Label>Cidade</Label><Input {...profileForm.register("city")} /></div>
                  <div><Label>Estado</Label><Input {...profileForm.register("state")} placeholder="SP" /></div>
                  <div>
                    <Label>CEP</Label>
                    <div className="relative">
                      <Input {...profileForm.register("postal_code", { onChange: (e) => profileForm.setValue("postal_code", maskCEP(e.target.value)) })} onBlur={handleCEPBlur} placeholder="00000-000" maxLength={9} />
                      {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                  <div><Label>País</Label><Input {...profileForm.register("country")} /></div>
                </div>
                <Separator />
                <div className="flex justify-end"><Button onClick={profileForm.handleSubmit(onSaveProfile)}>Salvar</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEGURANÇA */}
          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle>Alterar senha</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Senha atual</Label>
                    <Input type="password" {...passwordForm.register("current_password")} />
                    {passwordForm.formState.errors.current_password && <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.current_password.message}</p>}
                  </div>
                  <div>
                    <Label>Nova senha</Label>
                    <Input type="password" {...passwordForm.register("new_password")} />
                    {passwordForm.formState.errors.new_password && <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.new_password.message}</p>}
                  </div>
                  <div>
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" {...passwordForm.register("confirm_password")} />
                    {passwordForm.formState.errors.confirm_password && <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.confirm_password.message}</p>}
                  </div>
                </div>
                <div className="flex justify-end"><Button onClick={passwordForm.handleSubmit(onChangePassword)}>Atualizar senha</Button></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <VerificationCodeDialog
        open={verificationDialog.open}
        onOpenChange={(open) => setVerificationDialog((prev) => ({ ...prev, open }))}
        actionType={verificationDialog.actionType}
        actionData={verificationDialog.actionData}
        onSuccess={(actionData) => {
          if (verificationDialog.actionType === "password_change") handlePasswordVerified(actionData);
        }}
        title={verificationDialog.title}
        description={verificationDialog.description}
      />
    </div>
  );
};

export default AccountSettings;
