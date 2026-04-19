import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { Heart, Search, MessageSquare, UserPlus, Package, MapPin, HelpCircle } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">💡 Central de Ajuda</h1>
        <p className="text-muted-foreground mb-8">PARA QUEM PRECISA — Plataforma de Doação de Roupas</p>

        <section className="space-y-8">
          {/* Como Funciona */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Como Funciona a Plataforma</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                A plataforma <strong className="text-foreground">Para Quem Precisa</strong> conecta ONGs que necessitam de roupas
                com doadores dispostos a ajudar. O processo é simples:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>A ONG se cadastra e registra suas necessidades de roupas</li>
                <li>O doador busca ONGs próximas e visualiza o que é necessário</li>
                <li>O doador inicia uma conversa pelo chat para combinar a entrega</li>
                <li>A logística é combinada diretamente entre doador e ONG</li>
              </ol>
            </div>
          </div>

          <Separator />

          {/* Para ONGs */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Para ONGs</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cadastro da ONG</h3>
                <p className="mb-2">Para se cadastrar como ONG, você precisa:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Criar uma conta selecionando o tipo <strong>ONG</strong></li>
                  <li>Informar o endereço completo da ONG (obrigatório para que doadores encontrem você)</li>
                  <li>CNPJ é opcional, mas recomendado para maior credibilidade</li>
                  <li>Adicionar telefone/WhatsApp para contato</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cadastrando Necessidades</h3>
                <p className="mb-2">Após o cadastro, você pode registrar as roupas que precisa receber:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Acesse "Cadastrar Necessidade" no menu</li>
                  <li>Selecione os tipos de roupas necessárias (agasalhos, cobertores, calças, etc.)</li>
                  <li>Defina o nível de urgência (alta, média ou baixa)</li>
                  <li>Adicione uma descrição detalhada e fotos da ONG</li>
                  <li>Informe o endereço para que doadores possam encontrá-la</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Gerenciando Necessidades</h3>
                <p>
                  No seu painel, você pode editar, desativar ou marcar como atendida cada necessidade cadastrada.
                  Quando uma necessidade for totalmente atendida, desative-a para não receber mais contatos sobre ela.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Para Doadores */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Para Doadores</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Encontrando ONGs</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use a busca na página inicial para encontrar ONGs por localização</li>
                  <li>Filtre por tipo de roupa necessária e nível de urgência</li>
                  <li>Visualize no mapa as ONGs mais próximas de você</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fazendo uma Doação</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encontre uma ONG com necessidades que você pode atender</li>
                  <li>Clique em "Chamar a ONG no Chat" na página da necessidade</li>
                  <li>Combine diretamente com a ONG como e quando entregar as roupas</li>
                  <li>Não é necessário cadastro para navegar, mas é preciso fazer login para usar o chat</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Chat */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Chat entre Doador e ONG</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                O chat é a ferramenta principal para combinar a doação. Através dele, doador e ONG podem:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Confirmar quais roupas serão doadas</li>
                <li>Combinar local, data e horário de entrega ou retirada</li>
                <li>Tirar dúvidas sobre tamanhos, condições e quantidades</li>
              </ul>
              <p className="bg-primary/10 border border-primary/20 p-3 rounded-md text-foreground">
                <HelpCircle className="inline h-4 w-4 mr-2 text-primary" />
                O chat é iniciado pelo doador a partir da página de necessidade da ONG. Basta clicar no botão "Chamar a ONG no Chat".
              </p>
            </div>
          </div>

          <Separator />

          {/* Tipos de Roupas */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Tipos de Roupas Aceitas</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Atualmente a plataforma trabalha exclusivamente com doação de roupas:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                {["Agasalhos", "Cobertores", "Casacos", "Calças", "Camisetas", "Meias", "Sapatos", "Roupas infantis", "Roupas de bebê", "Roupas íntimas (novas)", "Acessórios (gorros, luvas, cachecóis)"].map((item) => (
                  <span key={item} className="text-sm bg-secondary/50 px-3 py-1.5 rounded-md">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Localização */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Busca por Localização</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                A localização é fundamental na plataforma. ONGs devem cadastrar seu endereço completo para que
                doadores possam encontrá-las facilmente. Os doadores podem buscar ONGs próximas e visualizar
                no mapa interativo a localização de cada uma.
              </p>
            </div>
          </div>

          <Separator />

          {/* Contato */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Precisa de Mais Ajuda?</h2>
            <p className="text-muted-foreground mb-4">
              Nossa equipe está pronta para ajudar você. Entre em contato conosco:
            </p>
            <div className="bg-secondary/50 p-6 rounded-lg space-y-2">
              <p className="text-foreground">
                📧 E-mail: <a href="mailto:contato@paraquemprecisa.com.br" className="text-primary hover:underline font-semibold">
                  contato@paraquemprecisa.com.br
                </a>
              </p>
              <p className="text-foreground">
                ⏰ Horário de atendimento: Segunda a Sexta, 9h às 18h
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpCenter;
