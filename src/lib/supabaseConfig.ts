// Config de Supabase: la URL y la "anon key" son publicas por diseno (igual
// que la config de Firebase) - la seguridad real vive en las policies RLS
// de Postgres, no en ocultar esto. Sustituye por los valores de tu proyecto
// en https://supabase.com/dashboard -> tu proyecto -> Project Settings -> API.
export const supabaseConfig = {
  url: "https://njnsgdexwfcvklczydxf.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbnNnZGV4d2ZjdmtsY3p5ZHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTQ2MDUsImV4cCI6MjA5OTc5MDYwNX0.8crLV_Lvj8qAyJjm_0PRLaNi3VMsenDEWMVszjcX8u0",
};

export const supabaseConfigured = supabaseConfig.url !== "REPLACE_ME";
