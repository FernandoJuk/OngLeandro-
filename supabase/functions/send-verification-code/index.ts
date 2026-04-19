import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action_type: string;
  action_data?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autorização necessária");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar usuário autenticado
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    const { action_type, action_data }: RequestBody = await req.json();

    // Verificar se o usuário está bloqueado
    const { data: existingCode } = await supabaseClient
      .from("verification_codes")
      .select("blocked_until, attempts")
      .eq("user_id", user.id)
      .eq("action_type", action_type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingCode?.blocked_until) {
      const blockedUntil = new Date(existingCode.blocked_until);
      if (blockedUntil > new Date()) {
        const hoursLeft = Math.ceil((blockedUntil.getTime() - Date.now()) / (1000 * 60 * 60));
        throw new Error(`Conta bloqueada. Tente novamente em ${hoursLeft} horas.`);
      }
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Salvar código no banco
    const { error: insertError } = await supabaseClient
      .from("verification_codes")
      .insert({
        user_id: user.id,
        email: user.email,
        code,
        action_type,
        action_data,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("Erro ao salvar código:", insertError);
      throw new Error("Erro ao gerar código de verificação");
    }

    // Definir assunto do e-mail baseado na ação
    let subject = "Código de Verificação";
    let actionText = "realizar esta ação";
    
    switch (action_type) {
      case "password_change":
        subject = "Código para Alteração de Senha";
        actionText = "alterar sua senha";
        break;
      case "payout_method":
        subject = "Código para Alteração de Método de Pagamento";
        actionText = "alterar seu método de pagamento";
        break;
      case "admin_password":
        subject = "Código para Alteração de Senha do Administrador";
        actionText = "alterar a senha do administrador";
        break;
      case "admin_fee":
        subject = "Código para Alteração da Taxa de Serviço";
        actionText = "alterar a taxa de serviço";
        break;
    }

    // Enviar e-mail
    const emailResponse = await resend.emails.send({
      from: "Locaitemporada <verificacao@locaitemporada.com.br>",
      to: [user.email!],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Código de Verificação</h2>
          <p>Você solicitou ${actionText}.</p>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">Este código expira em 15 minutos.</p>
          <p style="color: #666;">Se você não solicitou esta ação, ignore este e-mail.</p>
          <p style="color: #D62B3C; font-weight: bold; margin-top: 20px;">
            ⚠️ IMPORTANTE: Se não encontrou este e-mail na sua caixa de entrada, verifique a pasta de SPAM ou Lixo Eletrônico.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Após 6 tentativas incorretas, sua conta será bloqueada por 24 horas.
          </p>
        </div>
      `,
    });

    console.log("E-mail enviado:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Código enviado por e-mail" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar código:", error);
    
    let errorMessage = "Não foi possível enviar o código de verificação.";
    
    if (error.message?.includes("bloqueada")) {
      errorMessage = error.message;
    } else if (error.message?.includes("Autorização")) {
      errorMessage = "Sessão expirada. Faça login novamente.";
    } else if (error.message?.includes("autenticado")) {
      errorMessage = "Usuário não autenticado. Faça login novamente.";
    } else {
      errorMessage = "Erro ao enviar código. Tente novamente em alguns instantes.";
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});