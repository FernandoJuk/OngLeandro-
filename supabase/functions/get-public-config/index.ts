// Deno Edge Function: get-public-config
// Returns publishable configuration values safe for the client

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Prefer TEST public key if provided (VITE_*), fallback to PROD
    const mpPublicKey = Deno.env.get("VITE_MERCADO_PAGO_PUBLIC_KEY") || Deno.env.get("MERCADO_PAGO_PUBLIC_KEY") || "";

    return new Response(
      JSON.stringify({ mercado_pago_public_key: mpPublicKey }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
