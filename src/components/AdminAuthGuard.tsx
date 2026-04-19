import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  onAuthenticated: () => void;
}

export const AdminAuthGuard = ({ children, onAuthenticated }: AdminAuthGuardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkIfPasswordExists();
  }, []);

  const checkIfPasswordExists = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_extra_password')
        .single();

      if (error) throw error;
      
      const passwordExists = data?.setting_value && data.setting_value.length > 0;
      setHasPassword(passwordExists);
      
      // Se não houver senha configurada, deixa passar direto
      if (!passwordExists) {
        setIsOpen(false);
        onAuthenticated();
      }
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar as configurações de segurança.',
        variant: 'destructive',
      });
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_extra_password')
        .single();

      if (error) throw error;

      if (data.setting_value === password) {
        setIsOpen(false);
        onAuthenticated();
        toast({
          title: 'Acesso Autorizado',
          description: 'Bem-vindo ao painel administrativo.',
        });
      } else {
        toast({
          title: 'Senha Incorreta',
          description: 'A senha digitada está incorreta.',
          variant: 'destructive',
        });
        setPassword('');
      }
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar a senha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPassword) {
    return <>{children}</>;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <DialogTitle>Autenticação Adicional</DialogTitle>
            </div>
            <DialogDescription>
              Por segurança, digite a senha de acesso ao painel administrativo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha de Administrador</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                autoFocus
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acessar Painel'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {!isOpen && children}
    </>
  );
};
