import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyWithOwner {
  id: string;
  title: string;
  city: string;
  state: string;
  urgency: string | null;
  is_active: boolean;
  is_fulfilled: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const urgencyLabels: Record<string, string> = {
  alta: "🔴 Alta",
  media: "🟡 Média",
  baixa: "🟢 Baixa",
};

export const AdminPropertiesView = () => {
  const [properties, setProperties] = useState<PropertyWithOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, state, urgency, is_active, is_fulfilled, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ownerIds = data?.map((p: any) => p.user_id).filter(Boolean) || [];
      const { data: ownerProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .in('id', ownerIds);

      const ownerProfilesMap = new Map(ownerProfiles?.map((p) => [p.id, p]) || []);

      const propertiesWithProfiles = data?.map((property: any) => ({
        ...property,
        profiles: ownerProfilesMap.get(property.user_id) || { first_name: '', last_name: '', phone: '' },
      })) || [];

      setProperties(propertiesWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas as Necessidades da Plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>ONG</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Urgência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma necessidade cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.city}, {property.state}</TableCell>
                    <TableCell>
                      {property.profiles?.first_name} {property.profiles?.last_name}
                    </TableCell>
                    <TableCell>{property.profiles?.phone || '-'}</TableCell>
                    <TableCell>{urgencyLabels[property.urgency || 'media'] || 'Média'}</TableCell>
                    <TableCell>
                      {property.is_fulfilled ? (
                        <Badge variant="secondary">Atendida</Badge>
                      ) : (
                        <Badge variant={property.is_active ? 'default' : 'secondary'}>
                          {property.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(property.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
