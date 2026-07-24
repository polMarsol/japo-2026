// Dades reals de contacte per a emergències. Verificades el 2026-07-24:
// telèfons de Japó (coneixement general), ambaixada via exteriores.gob.es,
// índex de retorn d'objectes perduts via BBC/dades policials (GaijinPot).
// De la pòlissa d'assegurança NOMÉS s'inclou el que cal per demanar ajuda
// (companyia, números, contactes) — mai noms, DNI ni dates de naixement
// dels assegurats, perquè aquest repositori és públic a GitHub.

export const JAPAN_EMERGENCY_NUMBERS = [
  { id: "police", number: "110" },
  { id: "ambulanceFire", number: "119" },
] as const;

export const EMBASSY = {
  address: "1-3-29 Roppongi, Minato-ku, Tokio 106-0032",
  mapsUrl: "https://www.google.com/maps/search/Embajada+de+España+en+Japón,+1-3-29+Roppongi,+Minato-ku,+Tokyo",
  phone: "+81335838531",
  phoneDisplay: "03-3583-8531",
  emergencyPhone: "+818043682817",
  emergencyPhoneDisplay: "080-4368-2817",
  email: "emb.tokio@maec.es",
} as const;

export const INSURANCE = {
  company: "IATI Estándar + anulación",
  policyNumber: "471227226",
  travelNumber: "001513688",
  phone: "+34934857735",
  phoneDisplay: "(+34) 93 485 77 35",
  email: "iatimedicos@arag.es",
  whatsapp: "+34673885576",
  whatsappUrl: "https://wa.me/34673885576",
  coverageIds: [
    "medicalJapan",
    "repatriation",
    "luggage",
    "dental",
    "cancellation",
  ],
} as const;

export const KOBAN_RETURN_RATE = 65;
