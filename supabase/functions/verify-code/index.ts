import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  code: string;
  action_type: string;
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
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    const { code, action_type }: RequestBody = await req.json();

    // Buscar código mais recente do usuário para esta ação
    const { data: verificationCode, error: fetchError } = await supabaseClient
      .from("verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("action_type", action_type)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !verificationCode) {
      throw new Error("Código não encontrado ou expirado");
    }

    // Verificar se está bloqueado
    if (verificationCode.blocked_until) {
      const blockedUntil = new Date(verificationCode.blocked_until);
      if (blockedUntil > new Date()) {
        const hoursLeft = Math.ceil((blockedUntil.getTime() - Date.now()) / (1000 * 60 * 60));
        throw new Error(`Conta bloqueada. Tente novamente em ${hoursLeft} horas.`);
      }
    }

    // Verificar se o código expirou
    const expiresAt = new Date(verificationCode.expires_at);
    if (expiresAt < new Date()) {
      throw new Error("Código expirado. Solicite um novo código.");
    }

    // Verificar se o código está correto
    if (verificationCode.code !== code) {
      const newAttempts = verificationCode.attempts + 1;
      
      // Se atingiu 6 tentativas, bloquear por 24 horas
      if (newAttempts >= 6) {
        const blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await supabaseClient
          .from("verification_codes")
          .update({ 
            attempts: newAttempts,
            blocked_until: blockedUntil.toISOString()
          })
          .eq("id", verificationCode.id);
        
        throw new Error("Muitas tentativas incorretas. Conta bloqueada por 24 horas.");
      }
      
      // Incrementar tentativas
      await supabaseClient
        .from("verification_codes")
        .update({ attempts: newAttempts })
        .eq("id", verificationCode.id);
      
      const remainingAttempts = 6 - newAttempts;
      throw new Error(`Código incorreto. ${remainingAttempts} tentativa(s) restante(s).`);
    }

    // Marcar código como usado
    await supabaseClient
      .from("verification_codes")
      .update({ used: true })
      .eq("id", verificationCode.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Código verificado com sucesso",
        action_data: verificationCode.action_data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});