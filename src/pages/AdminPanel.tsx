import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserManagement } from '@/components/UserManagement';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { AdminPropertiesView } from '@/components/AdminPropertiesView';
import { VerificationCodeDialog } from '@/components/VerificationCodeDialog';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    actionType: string;
    actionData?: any;
    title: string;
    description: string;
  }>({
    open: false,
    actionType: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, []);

  const checkAdminRole = async () => {
    if (!user) { navigate('/auth'); return; }
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Acesso Negado', description: 'Você não tem permissão para acessar esta página.', variant: 'destructive' });
        navigate('/');
        return;
      }
      setIsAdmin(true);
      await loadSettings();
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['admin_extra_password']);

      settings?.forEach((setting) => {
        if (setting.setting_key === 'admin_extra_password') setAdminPassword(setting.setting_value || '');
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveAdminPassword = () => {
    setVerificationDialog({
      open: true,
      actionType: "admin_password",
      actionData: { adminPassword },
      title: "Verificação Necessária",
      description: "Por segurança, enviamos um código de verificação para seu e-mail.",
    });
  };

  const handleAdminPasswordVerified = async (actionData: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ setting_value: actionData.adminPassword, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq('setting_key', 'admin_extra_password');
      if (error) throw error;
      toast({ title: 'Sucesso!', description: 'Senha de administrador atualizada.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a senha.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminAuthGuard onAuthenticated={() => setAuthenticated(true)}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Painel de Administração</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="properties">Necessidades</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
            <TabsContent value="properties"><AdminPropertiesView /></TabsContent>
            <TabsContent value="users"><UserManagement /></TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Senha de Acesso ao Painel</CardTitle>
                  <CardDescription>Configure uma senha extra para proteger o acesso ao painel administrativo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Senha de Administrador</Label>
                    <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Digite uma senha forte" />
                  </div>
                  <Button onClick={handleSaveAdminPassword} disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar Senha'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <VerificationCodeDialog
        open={verificationDialog.open}
        onOpenChange={(open) => setVerificationDialog((prev) => ({ ...prev, open }))}
        actionType={verificationDialog.actionType}
        actionData={verificationDialog.actionData}
        onSuccess={(actionData) => {
          if (verificationDialog.actionType === "admin_password") handleAdminPasswordVerified(actionData);
        }}
        title={verificationDialog.title}
        description={verificationDialog.description}
      />
    </AdminAuthGuard>
  );
};

export default AdminPanel;
