import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">🔒 Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">Para Quem Precisa — Última atualização: 2026</p>

          <p className="text-foreground leading-relaxed mb-6">
            A "Para Quem Precisa" respeita sua privacidade e segue a Lei Geral de Proteção de Dados
            (LGPD). Esta política explica de forma simples quais dados coletamos e por quê.
          </p>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Dados que coletamos</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li><strong>Cadastro:</strong> nome, e-mail, telefone e tipo de usuário (ONG ou Doador).</li>
              <li><strong>ONGs:</strong> endereço completo (obrigatório para que doadores localizem) e CNPJ (opcional).</li>
              <li><strong>Necessidades:</strong> tipos de roupas, urgência, descrição e fotos publicadas.</li>
              <li><strong>Mensagens:</strong> conversas trocadas no chat interno entre Doador e ONG.</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Para que usamos</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Permitir que doadores encontrem ONGs próximas por busca e mapa.</li>
              <li>Permitir comunicação direta via chat para combinar a doação.</li>
              <li>Enviar e-mails essenciais (verificação de conta, recuperação de senha).</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. O que NÃO coletamos</h2>
            <p className="text-foreground">
              A "Para Quem Precisa" <strong>não cobra, não processa pagamentos e não solicita dados
              bancários, cartões ou chaves PIX</strong>. Toda a operação da plataforma é gratuita.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento</h2>
            <p className="text-foreground mb-2">Seus dados são compartilhados apenas:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Entre Doador e ONG quando uma conversa é iniciada (nome e contato).</li>
              <li>Com provedores de infraestrutura (hospedagem segura) e e-mail transacional.</li>
              <li>Com autoridades, mediante ordem judicial.</li>
            </ul>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Seus direitos (LGPD)</h2>
            <p className="text-foreground">
              Você pode, a qualquer momento, acessar, corrigir ou solicitar a exclusão dos seus
              dados entrando em contato pela Central de Ajuda.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
};

export default Privacy;
