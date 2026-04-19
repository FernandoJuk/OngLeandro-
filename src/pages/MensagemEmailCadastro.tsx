import { useNavigate } from "react-router-dom"; // Importe useNavigate
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button"; // Importe o componente Button

const Confirmacao = () => {
  const navigate = useNavigate(); // Inicialize useNavigate

  const handleGoToAuth = () => {
    navigate("/auth"); // Redireciona para a página de autenticação
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-lg text-center">
        <div className="flex justify-center mb-6">
          <MailCheck size={64} className="text-[#D62B3C]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quase lá!</h1>
        <p className="text-gray-600 mb-4">
          Um e-mail de confirmação foi enviado para o seu endereço.
        </p>
        <p className="text-gray-600 mb-2">
          Por favor, verifique sua caixa de entrada para ativar sua conta.
        </p>
        <p className="text-sm font-semibold text-red-600 mb-6">
          ⚠️ Não esqueça de verificar a pasta de SPAM ou Lixo Eletrônico!
        </p>
        <div className="mt-8 pt-4  border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Não encontrou? Verifique se o e-mail está correto e tente novamente, ou entre em contato com o suporte.
          </p>
          <Button onClick={handleGoToAuth} className="w-full">
            Ir para Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmacao;
