// Supabase Edge Function: proxy hacia Groq para el chatbot-guia.
// La API key vive solo aqui (variable de entorno del proyecto Supabase),
// nunca en el bundle del cliente. Por defecto Supabase exige un JWT valido
// para invocar la funcion (el cliente ya tiene sesion anonima), asi que
// solo quien pasa por la app (con el codigo de acceso) puede llegar aqui.
//
// Groq en vez de Gemini: el tier gratuito de Gemini no esta disponible sin
// tarjeta desde la UE, Groq si es gratis sin tarjeta y sin esa restriccion.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Eres un guia turistico experto, cercano y entusiasta para una familia que viaja a Japon en agosto de 2026. Respondes preguntas sobre los lugares del viaje: historia, leyendas, curiosidades, costumbres, comida y consejos practicos. Tono calido y ameno, como un guia local de verdad. Respuestas breves (2-5 frases) salvo que te pidan mas detalle. Si no sabes algo con certeza, dilo en vez de inventarlo. Responde en el mismo idioma en que te escriban.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY no configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, context } = (await req.json()) as {
      messages: ChatMessage[];
      context?: string;
    };

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nContexto del dia actual del itinerario:\n${context}`
      : SYSTEM_PROMPT;

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemContent },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
