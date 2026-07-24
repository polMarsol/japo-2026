// Frases fetes offline. El significat (traduït) viu a resources.ts sota
// translator.phrases.<id>; aquí només hi ha el japonès i la seva fonètica
// (romaji), que no depenen de l'idioma de la app.
export type PhraseCategory =
  | "english"
  | "emergency"
  | "police"
  | "health"
  | "hotel"
  | "restaurant"
  | "transport"
  | "shopping"
  | "sightseeing"
  | "courtesy"
  | "basics";

export interface EmergencyPhrase {
  id: string;
  category: PhraseCategory;
  ja: string;
  romaji: string;
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  "english",
  "emergency",
  "police",
  "health",
  "hotel",
  "restaurant",
  "transport",
  "shopping",
  "sightseeing",
  "courtesy",
  "basics",
];

export const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  // english — sempre demanar primer en japonès si podem parlar en anglès
  { id: "ask-english", category: "english", ja: "英語を話せますか？", romaji: "Eigo o hanasemasu ka?" },
  { id: "sorry-no-japanese", category: "english", ja: "すみません、日本語が話せません。", romaji: "Sumimasen, nihongo ga hanasemasen." },
  { id: "speak-slowly", category: "english", ja: "もう少しゆっくり話してもらえますか？", romaji: "Mou sukoshi yukkuri hanashite moraemasu ka?" },
  { id: "write-it-down", category: "english", ja: "紙に書いてもらえますか？", romaji: "Kami ni kaite moraemasu ka?" },
  { id: "can-you-help", category: "english", ja: "助けていただけますか？", romaji: "Tasukete itadakemasu ka?" },

  // emergency
  { id: "help", category: "emergency", ja: "助けて！", romaji: "Tasukete!" },
  { id: "call-ambulance", category: "emergency", ja: "救急車を呼んでください。", romaji: "Kyuukyuusha o yonde kudasai." },
  { id: "call-police", category: "emergency", ja: "警察を呼んでください。", romaji: "Keisatsu o yonde kudasai." },
  { id: "call-fire", category: "emergency", ja: "消防車を呼んでください。", romaji: "Shoubousha o yonde kudasai." },
  { id: "im-injured", category: "emergency", ja: "怪我をしています。", romaji: "Kega o shiteimasu." },
  { id: "someone-injured", category: "emergency", ja: "怪我人がいます。", romaji: "Keganin ga imasu." },
  { id: "its-an-emergency", category: "emergency", ja: "緊急です。", romaji: "Kinkyuu desu." },
  { id: "earthquake", category: "emergency", ja: "地震です！", romaji: "Jishin desu!" },
  { id: "where-is-exit", category: "emergency", ja: "非常口はどこですか？", romaji: "Hijouguchi wa doko desu ka?" },
  { id: "lost-child", category: "emergency", ja: "子供が迷子になりました。", romaji: "Kodomo ga maigo ni narimashita." },

  // police
  { id: "lost-passport", category: "police", ja: "パスポートをなくしました。", romaji: "Pasupooto o nakushimashita." },
  { id: "stolen-bag", category: "police", ja: "鞄を盗まれました。", romaji: "Kaban o nusumaremashita." },
  { id: "lost-item", category: "police", ja: "忘れ物をしました。", romaji: "Wasuremono o shimashita." },
  { id: "accident", category: "police", ja: "事故にあいました。", romaji: "Jiko ni aimashita." },
  { id: "where-police-station", category: "police", ja: "交番はどこですか？", romaji: "Kouban wa doko desu ka?" },
  { id: "need-report", category: "police", ja: "被害届を出したいです。", romaji: "Higaitodoke o dashitai desu." },
  { id: "lost-wallet", category: "police", ja: "財布をなくしました。", romaji: "Saifu o nakushimashita." },
  { id: "someone-following", category: "police", ja: "誰かに後をつけられています。", romaji: "Dareka ni ato o tsukerarete imasu." },
  { id: "i-need-embassy", category: "police", ja: "大使館に連絡したいです。", romaji: "Taishikan ni renraku shitai desu." },
  { id: "is-safe-here", category: "police", ja: "ここは安全ですか？", romaji: "Koko wa anzen desu ka?" },

  // health
  { id: "sick", category: "health", ja: "気分が悪いです。", romaji: "Kibun ga warui desu." },
  { id: "pharmacy-where", category: "health", ja: "薬局はどこですか？", romaji: "Yakkyoku wa doko desu ka?" },
  { id: "hospital-where", category: "health", ja: "病院はどこですか？", romaji: "Byouin wa doko desu ka?" },
  { id: "have-fever", category: "health", ja: "熱があります。", romaji: "Netsu ga arimasu." },
  { id: "stomach-hurts", category: "health", ja: "お腹が痛いです。", romaji: "Onaka ga itai desu." },
  { id: "headache", category: "health", ja: "頭が痛いです。", romaji: "Atama ga itai desu." },
  { id: "allergic", category: "health", ja: "アレルギーがあります。", romaji: "Arerugii ga arimasu." },
  { id: "need-doctor", category: "health", ja: "医者に診てもらいたいです。", romaji: "Isha ni mite moraitai desu." },
  { id: "need-doctor-english", category: "health", ja: "英語を話せる医者に診てもらいたいです。", romaji: "Eigo o hanaseru isha ni mite moraitai desu." },
  { id: "need-medicine", category: "health", ja: "薬が欲しいです。", romaji: "Kusuri ga hoshii desu." },
  { id: "seasick", category: "health", ja: "船酔いしました。", romaji: "Funayoi shimashita." },
  { id: "sunburn", category: "health", ja: "日焼けしました。", romaji: "Hiyake shimashita." },
  { id: "insurance-card", category: "health", ja: "これが私の保険証です。", romaji: "Kore ga watashi no hokenshou desu." },

  // hotel
  { id: "check-in", category: "hotel", ja: "チェックインをお願いします。", romaji: "Chekkuin o onegaishimasu." },
  { id: "check-out", category: "hotel", ja: "チェックアウトをお願いします。", romaji: "Chekkuauto o onegaishimasu." },
  { id: "reservation-name", category: "hotel", ja: "予約している名前です。", romaji: "Yoyaku shiteiru namae desu." },
  { id: "wifi-password", category: "hotel", ja: "Wi-Fiのパスワードを教えてください。", romaji: "Wi-Fi no pasuwaado o oshiete kudasai." },
  { id: "luggage-storage", category: "hotel", ja: "荷物を預かってもらえますか？", romaji: "Nimotsu o azukatte moraemasu ka?" },
  { id: "room-key", category: "hotel", ja: "部屋の鍵をお願いします。", romaji: "Heya no kagi o onegaishimasu." },
  { id: "is-broken", category: "hotel", ja: "これが壊れています。", romaji: "Kore ga kowarete imasu." },
  { id: "extra-towel", category: "hotel", ja: "タオルをもう一枚もらえますか？", romaji: "Taoru o mou ichimai moraemasu ka?" },
  { id: "what-time-breakfast", category: "hotel", ja: "朝食は何時からですか？", romaji: "Choushoku wa nanji kara desu ka?" },
  { id: "late-checkout", category: "hotel", ja: "レイトチェックアウトはできますか？", romaji: "Reito chekkuauto wa dekimasu ka?" },

  // restaurant
  { id: "table-for-n", category: "restaurant", ja: "〇人です、お願いします。", romaji: "~nin desu, onegaishimasu." },
  { id: "menu-please", category: "restaurant", ja: "メニューをください。", romaji: "Menyuu o kudasai." },
  { id: "recommend", category: "restaurant", ja: "おすすめは何ですか？", romaji: "Osusume wa nan desu ka?" },
  { id: "allergy-warning", category: "restaurant", ja: "アレルギーがあります。これが食べられません。", romaji: "Arerugii ga arimasu. Kore ga taberaremasen." },
  { id: "vegetarian", category: "restaurant", ja: "ベジタリアン料理はありますか？", romaji: "Bejitarian ryouri wa arimasu ka?" },
  { id: "no-meat", category: "restaurant", ja: "肉が食べられません。", romaji: "Niku ga taberaremasen." },
  { id: "water-please", category: "restaurant", ja: "お水をください。", romaji: "Omizu o kudasai." },
  { id: "check-please", category: "restaurant", ja: "お会計をお願いします。", romaji: "Okaikei o onegaishimasu." },
  { id: "delicious", category: "restaurant", ja: "とても美味しかったです。", romaji: "Totemo oishikatta desu." },
  { id: "reservation", category: "restaurant", ja: "予約をしています。", romaji: "Yoyaku o shiteimasu." },
  { id: "no-reservation", category: "restaurant", ja: "予約していません。", romaji: "Yoyaku shiteimasen." },
  { id: "spicy-not", category: "restaurant", ja: "辛くしないでください。", romaji: "Karaku shinaide kudasai." },

  // transport
  { id: "where-station", category: "transport", ja: "駅はどこですか？", romaji: "Eki wa doko desu ka?" },
  { id: "ticket-to", category: "transport", ja: "ここまでの切符をください。", romaji: "Koko made no kippu o kudasai." },
  { id: "which-platform", category: "transport", ja: "何番線ですか？", romaji: "Nanbansen desu ka?" },
  { id: "does-this-go-to", category: "transport", ja: "これはここ行きですか？", romaji: "Kore wa koko yuki desu ka?" },
  { id: "taxi-to-here", category: "transport", ja: "ここまでお願いします。", romaji: "Koko made onegaishimasu." },
  { id: "how-long", category: "transport", ja: "どのくらい時間がかかりますか？", romaji: "Dono kurai jikan ga kakarimasu ka?" },
  { id: "last-train", category: "transport", ja: "最終電車は何時ですか？", romaji: "Saishuu densha wa nanji desu ka?" },
  { id: "is-this-seat-free", category: "transport", ja: "この席は空いていますか？", romaji: "Kono seki wa aiteimasu ka?" },
  { id: "bus-stop-where", category: "transport", ja: "バス停はどこですか？", romaji: "Basutei wa doko desu ka?" },
  { id: "i-missed-stop", category: "transport", ja: "降りる場所を間違えました。", romaji: "Oriru basho o machigaemashita." },
  { id: "rental-car-return", category: "transport", ja: "レンタカーを返却したいです。", romaji: "Rentakaa o henkyaku shitai desu." },
  { id: "is-this-way-to", category: "transport", ja: "この道で行けますか？", romaji: "Kono michi de ikemasu ka?" },

  // shopping
  { id: "how-much", category: "shopping", ja: "いくらですか？", romaji: "Ikura desu ka?" },
  { id: "can-i-try", category: "shopping", ja: "試着できますか？", romaji: "Shichaku dekimasu ka?" },
  { id: "tax-free", category: "shopping", ja: "免税できますか？", romaji: "Menzei dekimasu ka?" },
  { id: "card-ok", category: "shopping", ja: "カードは使えますか？", romaji: "Kaado wa tsukaemasu ka?" },
  { id: "cash-only-q", category: "shopping", ja: "現金のみですか？", romaji: "Genkin nomi desu ka?" },
  { id: "do-you-have-smaller", category: "shopping", ja: "もっと小さいサイズはありますか？", romaji: "Motto chiisai saizu wa arimasu ka?" },
  { id: "can-i-get-bag", category: "shopping", ja: "袋をもらえますか？", romaji: "Fukuro o moraemasu ka?" },
  { id: "just-looking", category: "shopping", ja: "見ているだけです。", romaji: "Miteiru dake desu." },
  { id: "gift-wrap", category: "shopping", ja: "ラッピングをお願いできますか？", romaji: "Rappingu o onegai dekimasu ka?" },
  { id: "receipt-please", category: "shopping", ja: "レシートをください。", romaji: "Reshiito o kudasai." },

  // sightseeing
  { id: "where-is-entrance", category: "sightseeing", ja: "入り口はどこですか？", romaji: "Iriguchi wa doko desu ka?" },
  { id: "one-ticket", category: "sightseeing", ja: "大人一枚お願いします。", romaji: "Otona ichimai onegaishimasu." },
  { id: "can-i-take-photo", category: "sightseeing", ja: "写真を撮ってもいいですか？", romaji: "Shashin o totte mo ii desu ka?" },
  { id: "can-you-take-photo", category: "sightseeing", ja: "写真を撮っていただけますか？", romaji: "Shashin o totte itadakemasu ka?" },
  { id: "what-time-close", category: "sightseeing", ja: "何時に閉まりますか？", romaji: "Nanji ni shimarimasu ka?" },
  { id: "where-restroom", category: "sightseeing", ja: "トイレはどこですか？", romaji: "Toire wa doko desu ka?" },
  { id: "is-there-guide", category: "sightseeing", ja: "英語のガイドはありますか？", romaji: "Eigo no gaido wa arimasu ka?" },
  { id: "how-to-get-there", category: "sightseeing", ja: "そこへの行き方を教えてください。", romaji: "Soko e no ikikata o oshiete kudasai." },
  { id: "beautiful", category: "sightseeing", ja: "とても綺麗ですね。", romaji: "Totemo kirei desu ne." },
  { id: "stamp-here", category: "sightseeing", ja: "ここにスタンプを押せますか？", romaji: "Koko ni sutanpu o osemasu ka?" },

  // courtesy
  { id: "thank-you", category: "courtesy", ja: "ありがとうございます。", romaji: "Arigatou gozaimasu." },
  { id: "thank-you-much", category: "courtesy", ja: "どうもありがとうございます。", romaji: "Doumo arigatou gozaimasu." },
  { id: "excuse-me", category: "courtesy", ja: "すみません。", romaji: "Sumimasen." },
  { id: "sorry", category: "courtesy", ja: "ごめんなさい。", romaji: "Gomen nasai." },
  { id: "please", category: "courtesy", ja: "お願いします。", romaji: "Onegaishimasu." },
  { id: "yes", category: "courtesy", ja: "はい。", romaji: "Hai." },
  { id: "no", category: "courtesy", ja: "いいえ。", romaji: "Iie." },
  { id: "nice-to-meet", category: "courtesy", ja: "はじめまして。", romaji: "Hajimemashite." },
  { id: "good-morning", category: "courtesy", ja: "おはようございます。", romaji: "Ohayou gozaimasu." },
  { id: "goodbye", category: "courtesy", ja: "失礼します。", romaji: "Shitsurei shimasu." },

  // basics
  { id: "where-is-x", category: "basics", ja: "これはどこですか？", romaji: "Kore wa doko desu ka?" },
  { id: "do-you-understand", category: "basics", ja: "わかりますか？", romaji: "Wakarimasu ka?" },
  { id: "i-dont-understand", category: "basics", ja: "わかりません。", romaji: "Wakarimasen." },
  { id: "can-you-repeat", category: "basics", ja: "もう一度言ってもらえますか？", romaji: "Mou ichido itte moraemasu ka?" },
  { id: "whats-this", category: "basics", ja: "これは何ですか？", romaji: "Kore wa nan desu ka?" },
  { id: "how-do-you-say", category: "basics", ja: "日本語で何と言いますか？", romaji: "Nihongo de nan to iimasu ka?" },
  { id: "is-it-far", category: "basics", ja: "ここから遠いですか？", romaji: "Koko kara tooi desu ka?" },
  { id: "can-i-use-phone", category: "basics", ja: "電話を貸してもらえますか？", romaji: "Denwa o kashite moraemasu ka?" },
  { id: "wifi-available", category: "basics", ja: "Wi-Fiは使えますか？", romaji: "Wi-Fi wa tsukaemasu ka?" },
  { id: "where-am-i", category: "basics", ja: "ここはどこですか？", romaji: "Koko wa doko desu ka?" },
];
