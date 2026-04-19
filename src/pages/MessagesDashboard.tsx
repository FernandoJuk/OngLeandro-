import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Undo2 } from 'lucide-react'; 
import { Link } from 'react-router-dom';

interface Conversation {
    id: string;
    created_at: string;
    host_id: string;
    guest_id: string;
    property_title: string | null;
    recipient_profile: {
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
    } | null;
}

const fetchConversations = async (userId: string): Promise<Conversation[]> => {
    const { data, error } = await supabase
        .from('conversations')
        .select(`
      id,
      created_at,
      host_id,
      guest_id,
      property_id,
      properties(title)
    `)
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`);

    if (error) {
        throw new Error('Erro ao buscar suas conversas: ' + error.message);
    }

    // Busca os perfis dos usuários envolvidos nas conversas
    const conversationsWithProfiles = await Promise.all(
        data.map(async (conv: any) => {
            const isHost = conv.host_id === userId;
            const recipientId = isHost ? conv.guest_id : conv.host_id;

            // Busca o perfil do outro usuário
            const { data: recipientProfile } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', recipientId)
                .maybeSingle();

            return {
                id: conv.id,
                created_at: conv.created_at,
                host_id: conv.host_id,
                guest_id: conv.guest_id,
                property_title: conv.properties?.title || 'Conversa sobre propriedade',
                recipient_profile: recipientProfile,
            };
        })
    );

    return conversationsWithProfiles;
};

const MessagesDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const { data: conversations, isLoading, error } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: () => fetchConversations(user!.id),
        enabled: !!user && !authLoading,
    });

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div>Redirecionando...</div>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                    <p>Carregando mensagens...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Erro ao carregar conversas
                    </h1>
                    <p className="text-muted-foreground mb-8">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <Link
                to="/"
                className="absolute top-20 left-5 text-gray-300 hover:text-gray-400 z-10"
            >
                <Undo2 size={24} />
            </Link>

            {/* Container principal da página */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative">
                <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative">
                    <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <MessageCircle className="h-8 w-8 text-primary" />
                        Conversas
                    </h1>
                    <div className="space-y-4">
                        {conversations?.length === 0 && (
                            <p className="text-center text-muted-foreground">Você não tem conversas ainda</p>
                        )}
                        {conversations?.map((conv) => (
                            <Card
                                key={conv.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => navigate(`/chat/${conv.id}`)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">
                                            Conversa com&nbsp;
                                            <span className="text-primary">
                                                {conv.recipient_profile?.first_name} {conv.recipient_profile?.last_name || ''}
                                            </span>
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Sobre {conv.property_title}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            </div>
            );
};

            export default MessagesDashboard;