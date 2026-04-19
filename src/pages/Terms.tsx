import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">📜 Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">Para Quem Precisa — Plataforma de doação de roupas</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Sobre a Plataforma</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>1.1. Natureza:</strong> A "Para Quem Precisa" é uma plataforma sem fins de
                intermediação financeira, que conecta <strong>ONGs</strong> que precisam de roupas a
                <strong> Doadores</strong> dispostos a contribuir.
              </p>
              <p>
                <strong>1.2. O que NÃO fazemos:</strong> Não realizamos cobranças, não processamos
                pagamentos, não cobramos taxas, não intermediamos transporte e não armazenamos doações.
              </p>
              <p>
                <strong>1.3. Comunicação:</strong> Toda combinação sobre entrega, retirada e tipos de
                roupas é feita diretamente entre Doador e ONG por meio do nosso chat interno.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Responsabilidades das ONGs</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>2.1. Veracidade:</strong> A ONG é responsável por todas as informações
                cadastradas (endereço, CNPJ quando informado, fotos, necessidades).
              </p>
              <p>
                <strong>2.2. Atendimento:</strong> A ONG deve responder os doadores em tempo hábil e
                marcar a necessidade como atendida quando concluída.
              </p>
              <p>
                <strong>2.3. Destinação:</strong> As roupas recebidas devem ser destinadas
                exclusivamente à causa social declarada.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Responsabilidades dos Doadores</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>3.1. Qualidade:</strong> As roupas doadas devem estar limpas e em condições
                de uso.
              </p>
              <p>
                <strong>3.2. Combinação:</strong> Cabe ao Doador combinar entrega ou retirada
                diretamente com a ONG escolhida pelo chat.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Conteúdo e Conduta</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                É proibido publicar conteúdo falso, ofensivo ou que viole direitos de terceiros.
                Contas que descumprirem estas regras podem ser suspensas sem aviso prévio.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Limitação de Responsabilidade</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                A plataforma não se responsabiliza por divergências entre o que foi combinado e o que
                foi efetivamente entregue, nem pela utilização das roupas pela ONG receptora.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Alterações</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Estes termos podem ser atualizados a qualquer momento. Continuar usando a plataforma
                após as alterações representa concordância com a nova versão.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Terms;
