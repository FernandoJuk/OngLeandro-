import React, { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useLocation, useNavigate } from "react-router-dom"; // Adicionei useLocation e useNavigate
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Undo2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Tipos
interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  created_at: string;
  host_id: string;
  guest_id: string;
  property_id: string | null;
  property_title: string | null;
  recipient_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Funções de Busca de Dados
const fetchConversation = async (conversationId: string, userId: string) => {
  const { data: conv, error } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      host_id,
      guest_id,
      property_id,
      properties(title)
    `)
    .eq("id", conversationId)
    .single();

  if (error) throw error;

  const otherUserId = conv.host_id === userId ? conv.guest_id : conv.host_id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", otherUserId)
    .single();

  return {
    ...conv,
    property_title: (conv.properties as any)?.title || null,
    recipient_profile: profile,
  };
};

const fetchMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Componente Principal
const ChatPage = () => {
  const { conversationId: conversationIdParam } = useParams<{ conversationId: string }>(); // ID da URL (pode ser 'new' ou o ID real)
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Recupera IDs Adicionais para Novas Conversas
  // Estes dados vêm do 'state' da navegação anterior (do handleStartChat)
  const { propertyId, hostId, guestId } = (location.state as any) || {};

  // Verificação de estado inicial
  const isNewConversation = conversationIdParam === "new";

  if (authLoading) {
    // ... (loading state)
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // A conversa real que será usada. Começa como o ID do parâmetro (real ou 'new')
  const [currentConversationId, setCurrentConversationId] = useState(conversationIdParam);

  // 2. Busca de Conversa: Habilitada SOMENTE se o ID for real (não 'new')
  const {
    data: conversation,
    isLoading: isConversationLoading,
    error: conversationError,
  } = useQuery({
    queryKey: ["conversation", currentConversationId],
    queryFn: () => fetchConversation(currentConversationId!, user.id),
    // Habilita a busca APENAS se tiver um ID real
    enabled: !!user && !isNewConversation && !!currentConversationId,
  });

  // Busca de Mensagens: Habilitada APENAS se tiver um ID real
  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", currentConversationId],
    queryFn: () => fetchMessages(currentConversationId!),
    // Habilita a busca APENAS se tiver um ID real
    enabled: !isNewConversation && !!currentConversationId,
  });

  // Funções auxiliares (mantidas)
  // ... (markMessagesAsRead e useEffects de scroll e Realtime permanecem)

  // A CORREÇÃO PRINCIPAL: Mutação que cria a conversa se necessário
  const createOrSendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let finalConversationId = currentConversationId;
      let isNewlyCreated = false;

      // 🚨 Passo 1: Lógica de Criação da Conversa
      if (isNewConversation) {
        if (!propertyId || !hostId || !user.id) {
          // Lança um erro se faltarem dados essenciais para criar a conversa
          throw new Error("Dados incompletos para iniciar a conversa.");
        }

        console.log("➕ Primeira mensagem! Criando nova conversa...");
        const { data: newConversationData, error: newConversationError } = await supabase
          .from("conversations")
          .insert({
            property_id: propertyId,
            host_id: hostId,
            guest_id: user.id,
          })
          .select("id")
          .single();

        if (newConversationError) {
          throw new Error("Erro ao criar conversa: " + newConversationError.message);
        }

        finalConversationId = newConversationData.id;
        isNewlyCreated = true;

        // NOTA: O setQueryData para a conversa NÃO é necessário aqui,
        // pois o redirecionamento (próximo passo) irá acionar a busca do useQuery.
      }

      // 🚨 Passo 2: Envio da Mensagem
      const { data: newMessageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: finalConversationId,
          sender_id: user.id,
          content: content,
        })
        .select()
        .single();

      if (messageError) {
        throw new Error("Erro ao enviar mensagem: " + messageError.message);
      }

      // Retorna a mensagem e o ID final para o onSuccess
      return { newMessageData, finalConversationId, isNewlyCreated };
    },
    onSuccess: ({ newMessageData, finalConversationId, isNewlyCreated }) => {
      // Atualização Otimista
      queryClient.setQueryData(["messages", finalConversationId], (oldMessages: Message[]) => {
        const oldMessagesArray = oldMessages || [];
        if (!oldMessagesArray.find((m) => m.id === newMessageData.id)) {
          return [...oldMessagesArray, newMessageData];
        }
        return oldMessagesArray;
      });

      setNewMessage("");

      // 🚨 Passo 3: Se foi uma nova conversa, atualiza o estado e a URL
      if (isNewlyCreated) {
        console.log("✅ Conversa criada e redirecionando...");
        // Atualiza o state local para usar o ID real
        setCurrentConversationId(finalConversationId);
        // Redireciona/Substitui a URL de '/chat/new' para '/chat/:id'
        navigate(`/chat/${finalConversationId}`, { replace: true, state: location.state });
      }
    },
    // Você pode querer lidar com o onError para dar feedback ao usuário
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Usa a nova mutação com a lógica condicional
    if (newMessage.trim() && !createOrSendMessageMutation.isPending) {
      createOrSendMessageMutation.mutate(newMessage.trim());
    }
  };

  // Tratamento de Loading e Erro
  // -----------------------------------------------------------
  // Se for 'new', não há loading de busca inicial, a menos que a mutação esteja pendente
  if ((!isNewConversation && (isConversationLoading || isMessagesLoading)) || createOrSendMessageMutation.isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center flex flex-col items-center justify-center h-[50vh]">
          {" "}
          {/* Ajustei o h-[50vh] para centralizar melhor */}
          {/* 👇 O NOVO SPINNER com animação do Tailwind */}
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            {createOrSendMessageMutation.isPending
              ? "Enviando primeira mensagem e iniciando conversa..."
              : "Carregando conversa..."}
          </p>
        </div>
      </div>
    );
  }

  if (conversationError || messagesError) {
    // ... (error state)
  }
  // -----------------------------------------------------------

  // Lógica para nome do destinatário (funciona mesmo em isNewConversation, usando fallback 'Nova Conversa')
  const otherUser = conversation?.recipient_profile;
  // Título 'Nova Conversa' se a busca não foi executada (caso isNewConversation = true)
  const fullName = isNewConversation
    ? "Nova Conversa"
    : `${otherUser?.first_name || "Conversa"} ${otherUser?.last_name || ""}`;

  // Se for uma nova conversa, o título do imóvel deve vir do state
  const propertyTitle = isNewConversation ? location.state?.propertyTitle : conversation?.property_title;

  // ... O seu JSX com a renderização da conversa
  // O restante do seu JSX permanece o mesmo.
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Link to="/messages" className="absolute top-20 left-5 text-gray-300 hover:text-gray-400 z-10">
        <Undo2 size={24} />
      </Link>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col relative">
        <div className="flex items-center gap-4 mb-6 p-4 bg-secondary rounded-lg">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Conversa com: {fullName}</h1>
          {propertyTitle && <span className="text-sm text-muted-foreground ml-auto">Sobre: {propertyTitle}</span>}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg bg-card border border-border flex flex-col">
          {/* Exibir mensagens, que será vazio se for 'new' */}
          {messages?.map((message) => (
            // ... (código de renderização de mensagem)
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block text-right">
                  {format(new Date(message.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </span>
                {message.sender_id === user?.id && message.read_at && (
                  <span className="text-xs opacity-75 mt-1 block text-right">Lido</span>
                )}
              </div>
            </div>
          ))}
          {/* Mensagem inicial para conversas novas */}
          {isNewConversation && !createOrSendMessageMutation.isPending && (
            <div className="text-center text-muted-foreground italic p-4 border border-dashed rounded-lg">
              Esta é uma nova conversa. Envie a primeira mensagem para iniciá-la!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={createOrSendMessageMutation.isPending}
          />
          <Button type="submit" disabled={!newMessage.trim() || createOrSendMessageMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
