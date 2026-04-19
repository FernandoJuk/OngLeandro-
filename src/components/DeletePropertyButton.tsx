import { useState } from 'react';
import { cn } from '@/lib/utils'; // Certifique-se de ter essa utilidade
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Trash } from 'lucide-react'; // Ícone de lixeira

interface DeletePropertyButtonProps {
  propertyId: string;
  // Callback para ser chamado após a exclusão bem-sucedida,
  // útil para recarregar a lista de imóveis.
  onPropertyDeleted?: () => void;
  className?: string; 
}

export const DeletePropertyButton = ({ propertyId, onPropertyDeleted, className }: DeletePropertyButtonProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProperty = async () => {
    setIsDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw error;
      }

      toast({
        title: "Imóvel excluído!",
        description: "O imóvel foi removido com sucesso.",
        variant: "default",
      });

      // Se houver um callback, chame-o.
      // Isso é importante para que o Dashboard saiba que precisa atualizar a lista.
      if (onPropertyDeleted) {
        onPropertyDeleted();
      } else {
        // Fallback: se não houver callback, pode navegar para o dashboard (menos comum aqui)
        navigate('/dashboard'); 
      }
    } catch (error: any) {
      console.error('Erro ao excluir imóvel:', error);
      toast({
        title: "Erro ao excluir",
        description: `Não foi possível excluir o imóvel: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* O botão "Excluir Imóvel" que abre o diálogo */}
        <Button variant="outline" size="sm" disabled={isDeleting} className={cn("w-full", className)}>
          {isDeleting ? 'Excluindo...' : (
            <>
              <Trash className="mr-2 h-4 w-4" /> {/* Ícone da lixeira */}
              Excluir
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja realmente excluir esta necessidade?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A necessidade será removida permanentemente
            e os doadores não poderão mais encontrá-la.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteProperty} disabled={isDeleting}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};