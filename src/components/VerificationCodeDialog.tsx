import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VerificationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: string;
  actionData?: any;
  onSuccess: (actionData?: any) => void;
  title: string;
  description: string;
}

export const VerificationCodeDialog = ({
  open,
  onOpenChange,
  actionType,
  actionData,
  onSuccess,
  title,
  description,
}: VerificationCodeDialogProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const { toast } = useToast();
  const hasSentRef = useRef(false);
  const otpRef = useRef<any>(null);

  const sendCode = async () => {
    setSendingCode(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      const { data, error } = await supabase.functions.invoke("send-verification-code", {
        body: { action_type: actionType, action_data: actionData },
      });

      if (error) throw error;

      toast({
        title: "Código enviado",
        description: "Verifique seu e-mail para obter o código de verificação. Não esqueça de checar a caixa de spam ou lixo eletrônico.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar código:", error);
      const errorMessage = error.message?.includes('Edge Function') 
        ? "Não foi possível enviar o código de verificação. Tente novamente."
        : error.message || "Erro ao enviar código de verificação";
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (open && !sendingCode && !hasSentRef.current) {
      console.log("Dialog open state true (effect), sending verification code...");
      hasSentRef.current = true;
      sendCode().catch(err => {
        console.error("Failed to send code on open (effect):", err);
      });
    }
    if (!open) {
      hasSentRef.current = false;
      setCode("");
    }
  }, [open, sendingCode]);

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: { code, action_type: actionType },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Código verificado com sucesso",
      });

      onSuccess(data?.action_data);
      onOpenChange(false);
      setCode("");
    } catch (error: any) {
      console.error("Erro ao verificar código:", error);
      let errorMessage = "Código inválido. Verifique e tente novamente.";
      
      if (error.message?.includes('expired')) {
        errorMessage = "Código expirado. Solicite um novo código.";
      } else if (error.message?.includes('blocked')) {
        errorMessage = "Conta temporariamente bloqueada por múltiplas tentativas incorretas.";
      } else if (error.message?.includes('Edge Function')) {
        errorMessage = "Não foi possível verificar o código. Tente novamente.";
      }
      
      toast({
        title: "Erro na verificação",
        description: errorMessage,
        variant: "destructive",
      });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCode("");
      hasSentRef.current = false;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Digite o código de 6 dígitos enviado para seu e-mail.
            <br />
            <span className="text-xs">Verifique também a caixa de spam ou lixo eletrônico.</span>
          </p>
          
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            disabled={loading || sendingCode}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={sendCode}
              disabled={loading || sendingCode}
              className="flex-1"
            >
              {sendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Reenviar código"
              )}
            </Button>
            
            <Button
              onClick={verifyCode}
              disabled={loading || sendingCode || code.length !== 6}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};