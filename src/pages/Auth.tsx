import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useViaCEP } from "@/hooks/useViaCEP";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Undo2, HandHeart, Heart, Building2 } from "lucide-react";

// ---------- Máscaras ----------
const maskCPF = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v.substring(0, 14);
};
const maskCNPJ = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v.substring(0, 18);
};
const maskPhone = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})/, "($1) ");
  if (v.length > 10) v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v.substring(0, 15);
};
const maskCEP = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  return v.substring(0, 9);
};

const Auth = () => {
  const { user, loading: globalLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  const { toast } = useToast();
  const { fetchAddress, loading: cepLoading } = useViaCEP();

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Doador
  const [donorFirstName, setDonorFirstName] = useState("");
  const [donorLastName, setDonorLastName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPassword, setDonorPassword] = useState("");
  const [donorWhatsapp, setDonorWhatsapp] = useState("");

  // ONG
  const [ongName, setOngName] = useState("");
  const [ongResponsibleName, setOngResponsibleName] = useState("");
  const [ongResponsibleLastName, setOngResponsibleLastName] = useState("");
  const [ongCnpj, setOngCnpj] = useState("");
  const [ongCpf, setOngCpf] = useState("");
  const [ongEmail, setOngEmail] = useState("");
  const [ongPassword, setOngPassword] = useState("");
  const [ongWhatsapp, setOngWhatsapp] = useState("");
  const [ongCep, setOngCep] = useState("");
  const [ongStreet, setOngStreet] = useState("");
  const [ongNumber, setOngNumber] = useState("");
  const [ongDistrict, setOngDistrict] = useState("");
  const [ongCity, setOngCity] = useState("");
  const [ongState, setOngState] = useState("");
  const [ongCause, setOngCause] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!globalLoading && user) navigate("/");
  }, [user, globalLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        toast({ title: "Erro no login", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Bem-vindo de volta!" });
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCEPBlur = async () => {
    if (ongCep.replace(/\D/g, "").length === 8) {
      const addr = await fetchAddress(ongCep);
      if (addr) {
        setOngStreet(addr.street || "");
        setOngDistrict(addr.district || "");
        setOngCity(addr.city || "");
        setOngState(addr.state || "");
      }
    }
  };

  const handleDonorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: donorEmail,
        password: donorPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: donorFirstName,
            last_name: donorLastName,
            user_type: "guest",
            whatsapp: donorWhatsapp.replace(/\D/g, ""),
          },
        },
      });
      if (error) {
        toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Confirme seu e-mail (verifique também a pasta de spam).",
        });
        navigate("/mensagem-email-cadastro");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOngSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação manual de campos obrigatórios da ONG
    if (!ongName.trim() || !ongResponsibleName.trim() || !ongCpf.trim() ||
        !ongWhatsapp.trim() || !ongCep.trim() || !ongStreet.trim() ||
        !ongNumber.trim() || !ongCity.trim() || !ongState.trim() || !ongCause.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos marcados com * para o cadastro de ONG.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: ongEmail,
        password: ongPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: ongName, // nome da ONG vai como first_name para exibição
            last_name: `${ongResponsibleName} ${ongResponsibleLastName}`.trim(),
            user_type: "host",
            cnpj: ongCnpj.replace(/\D/g, "") || null,
            cpf: ongCpf.replace(/\D/g, ""),
            whatsapp: ongWhatsapp.replace(/\D/g, ""),
            phone: ongWhatsapp.replace(/\D/g, ""),
            postal_code: ongCep.replace(/\D/g, ""),
            address_line1: ongStreet,
            address_line2: ongNumber,
            district: ongDistrict,
            city: ongCity,
            state: ongState,
            country: "Brasil",
            cause_description: ongCause,
          },
        },
      });
      if (error) {
        toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "ONG cadastrada!",
          description: "Confirme seu e-mail (verifique também a pasta de spam).",
        });
        navigate("/mensagem-email-cadastro");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (globalLoading || user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl relative">
        <Link
          to="/"
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        >
          <Undo2 size={24} />
        </Link>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <HandHeart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Para Quem Precisa</CardTitle>
          <CardDescription>
            Conectamos doadores e ONGs para transformar vidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="donor">
                <Heart className="h-4 w-4 mr-1" /> Sou Doador
              </TabsTrigger>
              <TabsTrigger value="ong">
                <Building2 className="h-4 w-4 mr-1" /> Sou ONG
              </TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
                <div className="text-center mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* DOADOR */}
            <TabsContent value="donor">
              <form onSubmit={handleDonorSignUp} className="space-y-4 mt-4">
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm text-foreground">
                  <Heart className="inline h-4 w-4 mr-1 text-accent" />
                  Cadastro rápido. Você poderá buscar ONGs e iniciar conversas.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="d-firstName">Nome *</Label>
                    <Input id="d-firstName" value={donorFirstName} onChange={(e) => setDonorFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d-lastName">Sobrenome *</Label>
                    <Input id="d-lastName" value={donorLastName} onChange={(e) => setDonorLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-email">Email *</Label>
                  <Input id="d-email" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-whatsapp">WhatsApp</Label>
                  <Input id="d-whatsapp" value={donorWhatsapp} onChange={(e) => setDonorWhatsapp(maskPhone(e.target.value))} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-password">Senha *</Label>
                  <Input id="d-password" type="password" value={donorPassword} onChange={(e) => setDonorPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar como Doador
                </Button>
              </form>
            </TabsContent>

            {/* ONG */}
            <TabsContent value="ong">
              <form onSubmit={handleOngSignUp} className="space-y-4 mt-4">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-foreground">
                  <Building2 className="inline h-4 w-4 mr-1 text-primary" />
                  Endereço completo é obrigatório para que doadores encontrem sua ONG no mapa.
                </div>

                {/* Identificação */}
                <div className="space-y-2">
                  <Label htmlFor="ong-name">Nome da ONG / Instituição *</Label>
                  <Input id="ong-name" value={ongName} onChange={(e) => setOngName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ong-resp-first">Nome do responsável *</Label>
                    <Input id="ong-resp-first" value={ongResponsibleName} onChange={(e) => setOngResponsibleName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ong-resp-last">Sobrenome do responsável</Label>
                    <Input id="ong-resp-last" value={ongResponsibleLastName} onChange={(e) => setOngResponsibleLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ong-cnpj">CNPJ (opcional)</Label>
                    <Input id="ong-cnpj" value={ongCnpj} onChange={(e) => setOngCnpj(maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ong-cpf">CPF do responsável *</Label>
                    <Input id="ong-cpf" value={ongCpf} onChange={(e) => setOngCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" required />
                  </div>
                </div>

                {/* Acesso */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ong-email">Email *</Label>
                    <Input id="ong-email" type="email" value={ongEmail} onChange={(e) => setOngEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ong-whatsapp">WhatsApp / Telefone *</Label>
                    <Input id="ong-whatsapp" value={ongWhatsapp} onChange={(e) => setOngWhatsapp(maskPhone(e.target.value))} placeholder="(11) 99999-9999" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ong-password">Senha *</Label>
                  <Input id="ong-password" type="password" value={ongPassword} onChange={(e) => setOngPassword(e.target.value)} required minLength={6} />
                </div>

                {/* Endereço */}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3">Endereço da ONG *</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ong-cep">CEP *</Label>
                      <div className="relative">
                        <Input id="ong-cep" value={ongCep} onChange={(e) => setOngCep(maskCEP(e.target.value))} onBlur={handleCEPBlur} placeholder="00000-000" required />
                        {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ong-number">Número *</Label>
                      <Input id="ong-number" value={ongNumber} onChange={(e) => setOngNumber(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="ong-street">Rua *</Label>
                    <Input id="ong-street" value={ongStreet} onChange={(e) => setOngStreet(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ong-district">Bairro</Label>
                      <Input id="ong-district" value={ongDistrict} onChange={(e) => setOngDistrict(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ong-city">Cidade *</Label>
                      <Input id="ong-city" value={ongCity} onChange={(e) => setOngCity(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ong-state">UF *</Label>
                      <Input id="ong-state" value={ongState} onChange={(e) => setOngState(e.target.value.toUpperCase())} maxLength={2} required />
                    </div>
                  </div>
                </div>

                {/* Causa */}
                <div className="space-y-2">
                  <Label htmlFor="ong-cause">Descreva a causa que sua ONG atende *</Label>
                  <Textarea
                    id="ong-cause"
                    value={ongCause}
                    onChange={(e) => setOngCause(e.target.value)}
                    placeholder="Ex: Atendemos famílias em situação de vulnerabilidade no bairro..."
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar minha ONG
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
