// Kami (divinitat xintoista) que es "desbloqueja" quan un viatger marca tots
// els ítems de la seva llista d'equipatge. Alguns coincideixen amb temples
// que visitem de veritat: Amaterasu (Amano Iwato, dia 3), Izanagi/Izanami
// (Meoto Iwa, dia 1), Inari (Fushimi Inari Taisha, dia 15). El significat
// (localitzat) viu a resources.ts sota packing.luckyWordMeanings.<person>.
export interface LuckyWord {
  kanji: string;
  romaji: string;
}

export const LUCKY_WORDS: Record<string, LuckyWord> = {
  Pol: { kanji: "天照大神", romaji: "Amaterasu" },
  Marc: { kanji: "須佐之男命", romaji: "Susanoo" },
  Pep: { kanji: "伊邪那岐", romaji: "Izanagi" },
  Nuri: { kanji: "伊邪那美", romaji: "Izanami" },
  Amaya: { kanji: "稲荷神", romaji: "Inari" },
  "Míriam": { kanji: "八幡神", romaji: "Hachiman" },
  Susana: { kanji: "弁財天", romaji: "Benzaiten" },
};
