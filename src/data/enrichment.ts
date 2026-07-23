// Contingut curat a mà (llegendes, curiositats, tips) per als llocs
// destacats de cada dia, en els 4 idiomes de la app. Independent de
// db.json (que es regenera des de l'Excel) perquè un re-run de
// extract_excel.py no ho esborri.
// "place" es manté igual en tots els idiomes (és un topònim) i s'usa
// també com a clau per a les fotos (src/data/photos.json).
// Sense fotos inventades: les reals venen de Wikimedia Commons
// (scripts/fetch_photos.py) amb atribució; per a la resta deixem espai
// perquè hi afegeixis les teves.

export interface Highlight {
  place: string;
  legend?: string;
  curiosity?: string;
  tips?: string[];
}

type EnrichmentByDay = Record<string, Highlight[]>;

export const enrichment: Record<"ca" | "en" | "es" | "ja", EnrichmentByDay> = {
  ca: {
    "1": [
      {
        place: "Sakurai Futamigaura (Meoto Iwa)",
        legend:
          "Les dues roques unides per una corda de palla (shimenawa) representen Izanagi i Izanami, la parella divina fundadora del Japó segons el Kojiki. La corda es renova diverses vegades l'any en una cerimònia sintoista.",
        tips: [
          "Millor llum a la tarda, sobretot a la posta de sol.",
          "Amb marea baixa es veu un petit torii blanc dins l'aigua, ideal per fotos.",
        ],
      },
    ],
    "2": [
      {
        place: "Tōchō-ji",
        curiosity:
          "Alberga el Fukuoka Daibutsu, un dels Budes de fusta més grans del Japó (més de 10 m). Al soterrani hi ha un passadís completament fosc (Gokuraku Meguri) que simbolitza el renaixement.",
        tips: ["Tanca a les 17h (última entrada 16.45h) — val la pena anar-hi a primera hora."],
      },
      {
        place: "Gorja de Takachiho",
        legend:
          "Segons la mitologia, Amaterasu, la deessa del sol, es va refugiar dins una cova (Amano Iwato) després d'una disputa amb el seu germà, deixant el món a les fosques fins que altres déus la van fer sortir amb música i danses.",
      },
    ],
    "3": [
      {
        place: "Amano Iwato Jinja",
        legend:
          "Es diu que la cova sagrada just darrere del santuari és la mateixa on es va amagar Amaterasu. No es pot entrar-hi, però des del santuari se'n veu l'entrada a l'altra banda del riu.",
        tips: [
          "El santuari Amano Yasukawara, riu amunt (15 min a peu), és ple de piles de pedres apilades pels visitants per demanar desitjos.",
        ],
      },
      {
        place: "Yokagura (dansa nocturna)",
        curiosity:
          "Takachiho és famós per la Yokagura, un cicle de 33 danses sagrades que representen el mite d'Amaterasu. Als hotels de la zona sovint s'ofereix una versió resumida per a visitants.",
      },
    ],
    "4": [
      {
        place: "Naha (Kokusai-dori)",
        curiosity:
          "Aquest carrer d'1,6 km es coneix com la «Milla Miraculosa» perquè es va reconstruir gairebé del no-res després de quedar completament arrasat a la Batalla d'Okinawa (1945), convertint-se en pocs anys en el cor comercial de Naha.",
        tips: [
          "Els carrerons laterals (Heiwa-dori, Ichiba Hon-dori) amaguen el mercat cobert i els bars més autèntics, allunyats de les botigues de souvenirs de l'avinguda principal.",
        ],
      },
    ],
    "5": [
      {
        place: "Kerama Shotō (illes Kerama)",
        curiosity:
          "El mar de Kerama sovint supera els 30 m de visibilitat, motiu pel qual la zona és Parc Nacional Marí des del 2014. Les tortugues verdes (Aoumigame) hi viuen tot l'any, no només de pas.",
        tips: ["Eviteu tocar tortugues o coralls: és zona protegida i sol estar prohibit pels operadors locals."],
      },
    ],
    "6": [
      {
        place: "Karate d'Okinawa",
        curiosity:
          "El karate modern va néixer a Okinawa (llavors regne de Ryūkyū) com a fusió d'arts marcials xineses amb tècniques locals, en un context on portar armes va estar restringit durant segles.",
        tips: ["El Karate Kaikan té un dojo obert al públic i una petita exposició sobre la història de l'art marcial."],
      },
      {
        place: "Castell de Shuri",
        legend:
          "Va ser la seu del Regne de Ryūkyū durant més de 400 anys, un regne independent que feia de pont comercial entre Xina, Japó i el sud-est asiàtic. Destruït diverses vegades — inclosa la Batalla d'Okinawa (1945) i un incendi el 2019 —, es va reconstruint seguint tècniques tradicionals.",
      },
    ],
    "7": [
      {
        place: "Kansai International Airport",
        curiosity:
          "Es va construir sobre una illa artificial a la badia d'Osaka i el va dissenyar l'arquitecte Renzo Piano. És famós tant per la seva terminal d'un sol edifici (llavors la més llarga del món) com pel fet que, des que va obrir el 1994, s'ha anat enfonsant lentament al mar.",
      },
    ],
    "8": [
      {
        place: "Parc Memorial de la Pau",
        curiosity:
          "La Cúpula de la Bomba Atòmica (Genbaku Dome) és l'únic edifici que va quedar dret prop de l'epicentre de l'explosió del 6 d'agost de 1945. Es manté intencionadament en ruïnes com a monument.",
        tips: ["El museu recomana 1,5-2 hores. És una visita emotiva; molts viatgers prefereixen fer-la a primera hora."],
      },
      {
        place: "Torii flotant de Miyajima (Itsukushima)",
        legend:
          "L'illa és considerada tan sagrada que, tradicionalment, ni naixements ni morts s'hi podien produir. El torii es va construir dins l'aigua perquè els vaixells hi poguessin passar per sota.",
        tips: ["Amb marea baixa es pot caminar fins al torii; consulteu la taula de marees abans d'anar-hi."],
      },
    ],
    "9": [
      {
        place: "Dōgo Onsen",
        legend:
          "Amb més de 3.000 anys d'història, és un dels banys termals més antics del Japó (esmentat al Nihon Shoki). L'edifici principal de fusta, de 1894, va inspirar l'estètica del bany dels esperits a 'El viatge de Chihiro' de Studio Ghibli.",
        tips: ["Si l'edifici principal té molta cua, l'annex Tsubaki-no-yu sol tenir menys gent i és igualment tradicional."],
      },
    ],
    "10": [
      {
        place: "Okayama",
        curiosity:
          "Okayama es coneix com la terra de Momotarō, el 'nen préssec', un dels contes populars més famosos del Japó. El seu símbol apareix per tota la ciutat, fins i tot a les tapes de claveguera.",
      },
    ],
    "11": [
      {
        place: "Kurashiki Bikan",
        curiosity:
          "El barri es va conservar gràcies al seu passat com a magatzem d'arròs (kura) durant el període Edo. Els graners blancs i negres amb teules característiques (namako-kabe) voregen el canal.",
      },
      {
        place: "Dōtonbori",
        tips: ["Els cartells lluminosos (inclòs el Glico Running Man) són més espectaculars després de la posta de sol."],
      },
    ],
    "12": [
      {
        place: "Kōyasan",
        legend:
          "Fundat el 816 pel monjo Kūkai (Kōbō Daishi) com a centre del budisme Shingon. Es diu que no va morir, sinó que es troba en meditació eterna (nyūjō) al mausoleu d'Okunoin, esperant l'arribada del futur Buda Miroku.",
        tips: [
          "Dormir en un shukubō inclou el sopar shōjin ryōri (cuina budista vegetariana) i, si voleu, assistir a la pregària matinal (sovint cap a les 6h).",
        ],
      },
    ],
    "13": [
      {
        place: "Cascada de Nachi i Kumano Kodo",
        curiosity:
          "Amb 133 m és la cascada de caiguda ininterrompuda més alta del Japó. El santuari Kumano Nachi Taisha i el temple Seiganto-ji formen part de la ruta de pelegrinatge Kumano Kodo, Patrimoni Mundial de la UNESCO.",
      },
      {
        place: "Toba i les ama",
        curiosity:
          "Toba és bressol de la perla cultivada, gràcies a Kōkichi Mikimoto (1893). Les ama són bussejadores tradicionals que encara pesquen marisc i ostres sense equip de submarinisme, tal com fa segles.",
      },
    ],
    "14": [
      {
        place: "Gion",
        tips: [
          "Des del 2019 hi ha carrers privats a Gion on fer fotos a les geishas (geiko) o maiko està prohibit i multat, per evitar l'assetjament turístic. Respecteu els cartells.",
        ],
      },
    ],
    "15": [
      {
        place: "Fushimi Inari Taisha",
        legend:
          "Els milers de toriis vermells ('Senbon Torii') són donacions d'empreses i particulars que demanen pròsperitat a Inari, la divinitat de l'arròs i els negocis. Cada torii porta gravat el nom del donant.",
        tips: [
          "El circuit complet fins al cim (Mt. Inari) són 2-3 hores; la majoria de gent només arriba als primers miradors, així que a mitja pujada ja hi ha molta menys gentada.",
        ],
      },
      {
        place: "Kiyomizu-dera",
        curiosity:
          "El seu escenari de fusta es va construir sense fer servir ni un sol clau, mitjançant una tècnica tradicional japonesa d'encaix de fusta.",
      },
    ],
    "16": [
      {
        place: "Bosc de bambú d'Arashiyama",
        tips: ["Millor de bon matí (abans de les 8h), tant per la llum com per evitar la gentada."],
      },
      {
        place: "Kinkaku-ji (Pavelló Daurat)",
        curiosity:
          "L'edifici actual és una reconstrucció de 1955: l'original va ser cremat el 1950 per un monjo novici, un fet que va inspirar la novel·la 'El Pavelló d'Or' de Yukio Mishima.",
      },
      {
        place: "Gozan no Okuribi (Daimonji)",
        curiosity:
          "El 16 d'agost s'encenen cinc grans fogueres a les muntanyes que envolten Kyoto, formant caràcters i figures (la més famosa és el kanji 大, 'gran'). Marca el comiat dels esperits dels avantpassats en acabar l'Obon.",
      },
    ],
    "17": [
      {
        place: "Sanmachi Suji",
        curiosity:
          "El barri antic conserva cases de fusta de mercaders del període Edo. Takayama també és coneguda pel sake: diversos cellers centenaris hi ofereixen tastets gratuïts o molt econòmics.",
      },
    ],
    "18": [
      {
        place: "Nakasendō: Magome–Tsumago",
        curiosity:
          "Aquest tram de 8 km formava part de la ruta Nakasendō, que unia Edo (Tòquio) amb Kyoto durant el període Edo. Tsumago va ser el primer poble del Japó a prohibir la venda o el lloguer d'edificis històrics per preservar-ne l'aspecte original, ja als anys 70.",
        tips: ["Hi ha un servei de transport de maletes entre els dos pobles perquè no calgui carregar-les caminant."],
      },
    ],
    "19": [
      {
        place: "Mont Takao",
        legend:
          "És una muntanya sagrada associada als tengu, esperits llegendaris amb nas llarg i poders sobrenaturals, protectors del temple Yakuō-in.",
        tips: ["El telefèric o el chairlift estalvien la primera part de la pujada si voleu arribar-hi més descansats."],
      },
    ],
    "20": [
      {
        place: "Senso-ji (Asakusa)",
        legend:
          "Segons la llegenda, el 628 dos germans pescadors van trobar una estàtua de Kannon al riu Sumida. Tot i retornar-la a l'aigua diverses vegades, sempre reapareixia, cosa que es va interpretar com un senyal per construir-hi un temple.",
      },
      {
        place: "Shibuya Crossing",
        curiosity:
          "És un dels encreuaments de vianants més transitats del món, amb pics de més de 3.000 persones creuant alhora. Els millors punts per veure'l des de dalt són el Starbucks de Tsutaya o el Shibuya Sky.",
      },
    ],
    "21": [
      {
        place: "Mercat de Toyosu",
        curiosity:
          "Va substituir l'antic mercat de Tsukiji el 2018. La famosa subhasta de tonyina de matinada es pot veure des d'una zona d'observació amb vidre (cal reserva prèvia, places molt limitades).",
      },
      {
        place: "teamLab Planets",
        tips: [
          "Cal caminar descalç i amb pantalons curts o arromangables: hi ha sales amb aigua fins als genolls. Porteu tovallola i muda.",
        ],
      },
    ],
  },

  en: {
    "1": [
      {
        place: "Sakurai Futamigaura (Meoto Iwa)",
        legend:
          "The two rocks joined by a sacred straw rope (shimenawa) represent Izanagi and Izanami, the divine couple said to have created Japan in the Kojiki. The rope is renewed several times a year in a Shinto ceremony.",
        tips: [
          "Best light in the afternoon, especially at sunset.",
          "At low tide a small white torii appears in the water — great for photos.",
        ],
      },
    ],
    "2": [
      {
        place: "Tōchō-ji",
        curiosity:
          "Home to the Fukuoka Daibutsu, one of Japan's largest wooden Buddha statues (over 10 m). In the basement there's a completely dark corridor (Gokuraku Meguri) symbolizing rebirth.",
        tips: ["Closes at 5pm (last entry 4:45pm) — worth going early."],
      },
      {
        place: "Takachiho Gorge",
        legend:
          "According to mythology, Amaterasu, the sun goddess, hid inside a cave (Amano Iwato) after a dispute with her brother, plunging the world into darkness until other gods lured her out with music and dance.",
      },
    ],
    "3": [
      {
        place: "Amano Iwato Jinja",
        legend:
          "The sacred cave right behind the shrine is said to be the very one where Amaterasu hid. You can't enter it, but the shrine offers a view of its entrance across the river.",
        tips: [
          "Amano Yasukawara shrine, a 15-minute walk upstream, is covered in stacked stone piles left by visitors making wishes.",
        ],
      },
      {
        place: "Yokagura (night dance)",
        curiosity:
          "Takachiho is famous for Yokagura, a cycle of 33 sacred dances retelling the myth of Amaterasu. Local inns often offer a shortened version for visitors.",
      },
    ],
    "4": [
      {
        place: "Naha (Kokusai-dori)",
        curiosity:
          "This 1.6 km street is nicknamed the 'Miracle Mile' because it was rebuilt almost from scratch after being completely flattened in the Battle of Okinawa (1945), becoming Naha's commercial heart within just a few years.",
        tips: [
          "The side alleys (Heiwa-dori, Ichiba Hon-dori) hide the covered market and the most authentic bars, away from the souvenir shops on the main avenue.",
        ],
      },
    ],
    "5": [
      {
        place: "Kerama Shotō (Kerama Islands)",
        curiosity:
          "The waters around Kerama often exceed 30 m of visibility, which is why the area became a National Marine Park in 2014. Green sea turtles (Aoumigame) live here year-round, not just passing through.",
        tips: ["Avoid touching turtles or coral: it's a protected area and usually banned by local operators."],
      },
    ],
    "6": [
      {
        place: "Okinawan karate",
        curiosity:
          "Modern karate was born in Okinawa (then the Ryūkyū Kingdom) as a fusion of Chinese martial arts with local techniques, in a context where carrying weapons was restricted for centuries.",
        tips: ["The Karate Kaikan has a dojo open to the public and a small exhibition on the martial art's history."],
      },
      {
        place: "Shuri Castle",
        legend:
          "It was the seat of the Ryūkyū Kingdom for over 400 years, an independent kingdom that acted as a trade bridge between China, Japan and Southeast Asia. Destroyed several times — including the Battle of Okinawa (1945) and a 2019 fire — it keeps being rebuilt using traditional techniques.",
      },
    ],
    "7": [
      {
        place: "Kansai International Airport",
        curiosity:
          "Built on an artificial island in Osaka Bay and designed by architect Renzo Piano, it's famous both for its single-building terminal (the longest in the world when it opened) and for the fact that it has been slowly sinking into the sea since it opened in 1994.",
      },
    ],
    "8": [
      {
        place: "Peace Memorial Park",
        curiosity:
          "The Atomic Bomb Dome (Genbaku Dome) is the only building left standing near the epicenter of the August 6, 1945 explosion. It's deliberately kept in ruins as a monument.",
        tips: ["The museum takes 1.5-2 hours. It's an emotional visit; many travelers prefer going early in the day."],
      },
      {
        place: "Miyajima floating torii (Itsukushima)",
        legend:
          "The island is considered so sacred that, traditionally, neither births nor deaths were allowed to take place on it. The torii was built in the water so boats could pass underneath.",
        tips: ["At low tide you can walk right up to the torii; check the tide tables before you go."],
      },
    ],
    "9": [
      {
        place: "Dōgo Onsen",
        legend:
          "With over 3,000 years of history, it's one of Japan's oldest hot springs (mentioned in the Nihon Shoki). The 1894 wooden main building inspired the bathhouse in Studio Ghibli's 'Spirited Away'.",
        tips: ["If the main building has a long queue, the Tsubaki-no-yu annex is usually less crowded and just as traditional."],
      },
    ],
    "10": [
      {
        place: "Okayama",
        curiosity:
          "Okayama is known as the home of Momotarō, the 'peach boy', one of Japan's most famous folk tales. His symbol turns up all over the city, even on manhole covers.",
      },
    ],
    "11": [
      {
        place: "Kurashiki Bikan",
        curiosity:
          "The district survived thanks to its past as a rice storehouse quarter (kura) during the Edo period. Black-and-white warehouses with distinctive namako-kabe tiling line the canal.",
      },
      {
        place: "Dōtonbori",
        tips: ["The neon signs (Glico Running Man included) are far more spectacular after sunset."],
      },
    ],
    "12": [
      {
        place: "Kōyasan",
        legend:
          "Founded in 816 by the monk Kūkai (Kōbō Daishi) as the center of Shingon Buddhism. Legend says he never died, but remains in eternal meditation (nyūjō) at the Okunoin mausoleum, awaiting the future Buddha Miroku.",
        tips: [
          "Staying at a shukubō includes shōjin ryōri (vegetarian Buddhist cuisine) dinner and, if you like, the morning prayer (often around 6am).",
        ],
      },
    ],
    "13": [
      {
        place: "Nachi Falls and the Kumano Kodo",
        curiosity:
          "At 133 m, it's Japan's tallest single-drop waterfall. Kumano Nachi Taisha shrine and Seiganto-ji temple are part of the Kumano Kodo pilgrimage route, a UNESCO World Heritage site.",
      },
      {
        place: "Toba and the ama divers",
        curiosity:
          "Toba is the birthplace of the cultured pearl, thanks to Kōkichi Mikimoto (1893). The ama are traditional free-divers who still fish for shellfish and oysters without scuba gear, just as they have for centuries.",
      },
    ],
    "14": [
      {
        place: "Gion",
        tips: [
          "Since 2019, some private streets in Gion ban and fine photographing geisha (geiko) or maiko, to curb tourist harassment. Please respect the signs.",
        ],
      },
    ],
    "15": [
      {
        place: "Fushimi Inari Taisha",
        legend:
          "The thousands of red torii ('Senbon Torii') are donations from companies and individuals asking Inari, the deity of rice and business, for prosperity. Each torii bears the donor's name.",
        tips: [
          "The full loop to the summit (Mt. Inari) takes 2-3 hours; most people only reach the first viewpoints, so it gets much quieter halfway up.",
        ],
      },
      {
        place: "Kiyomizu-dera",
        curiosity:
          "Its wooden stage was built without using a single nail, using a traditional Japanese wood-joining technique.",
      },
    ],
    "16": [
      {
        place: "Arashiyama Bamboo Grove",
        tips: ["Best early morning (before 8am), both for the light and to avoid the crowds."],
      },
      {
        place: "Kinkaku-ji (Golden Pavilion)",
        curiosity:
          "The current building is a 1955 reconstruction: the original was burned down in 1950 by a novice monk, an event that inspired Yukio Mishima's novel 'The Temple of the Golden Pavilion'.",
      },
      {
        place: "Gozan no Okuribi (Daimonji)",
        curiosity:
          "On August 16, five huge bonfires are lit on the mountains around Kyoto, forming characters and shapes (the most famous is the kanji 大, 'big'). It marks the farewell to ancestors' spirits at the end of Obon.",
      },
    ],
    "17": [
      {
        place: "Sanmachi Suji",
        curiosity:
          "The old quarter preserves Edo-period merchant wooden houses. Takayama is also known for sake: several century-old breweries in the district offer free or very cheap tastings.",
      },
    ],
    "18": [
      {
        place: "Nakasendō: Magome–Tsumago",
        curiosity:
          "This 8 km stretch was part of the Nakasendō route, which linked Edo (Tokyo) with Kyoto during the Edo period. Tsumago was the first town in Japan to ban selling or renting out historic buildings in order to preserve its original look, back in the 1970s.",
        tips: ["A luggage-forwarding service runs between the two villages so you don't have to carry your bags while walking."],
      },
    ],
    "19": [
      {
        place: "Mount Takao",
        legend:
          "A sacred mountain associated with tengu, legendary long-nosed spirits with supernatural powers who protect Yakuō-in temple.",
        tips: ["The cable car or chairlift skip the first stretch of the climb if you'd rather arrive with more energy."],
      },
    ],
    "20": [
      {
        place: "Senso-ji (Asakusa)",
        legend:
          "Legend says that in 628 two fishermen brothers found a statue of Kannon in the Sumida River. Even after returning it to the water several times, it kept reappearing, which was taken as a sign to build a temple there.",
      },
      {
        place: "Shibuya Crossing",
        curiosity:
          "One of the busiest pedestrian crossings in the world, with peaks of over 3,000 people crossing at once. The best spots to see it from above are the Tsutaya Starbucks or Shibuya Sky.",
      },
    ],
    "21": [
      {
        place: "Toyosu Market",
        curiosity:
          "It replaced the old Tsukiji Market in 2018. The famous early-morning tuna auction can be watched from a glassed-in observation deck (advance booking required, very limited spots).",
      },
      {
        place: "teamLab Planets",
        tips: [
          "You'll walk barefoot in shorts or roll-up trousers: some rooms have water up to your knees. Bring a towel and a change of clothes.",
        ],
      },
    ],
  },

  es: {
    "1": [
      {
        place: "Sakurai Futamigaura (Meoto Iwa)",
        legend:
          "Las dos rocas unidas por una cuerda de paja sagrada (shimenawa) representan a Izanagi e Izanami, la pareja divina fundadora de Japón según el Kojiki. La cuerda se renueva varias veces al año en una ceremonia sintoísta.",
        tips: [
          "Mejor luz por la tarde, sobre todo al atardecer.",
          "Con marea baja aparece un pequeño torii blanco en el agua, ideal para fotos.",
        ],
      },
    ],
    "2": [
      {
        place: "Tōchō-ji",
        curiosity:
          "Alberga el Fukuoka Daibutsu, uno de los Budas de madera más grandes de Japón (más de 10 m). En el sótano hay un pasillo completamente oscuro (Gokuraku Meguri) que simboliza el renacimiento.",
        tips: ["Cierra a las 17h (última entrada 16:45h) — merece la pena ir a primera hora."],
      },
      {
        place: "Garganta de Takachiho",
        legend:
          "Según la mitología, Amaterasu, la diosa del sol, se refugió en una cueva (Amano Iwato) tras una disputa con su hermano, sumiendo al mundo en la oscuridad hasta que otros dioses la hicieron salir con música y danzas.",
      },
    ],
    "3": [
      {
        place: "Amano Iwato Jinja",
        legend:
          "Se dice que la cueva sagrada justo detrás del santuario es la misma donde se escondió Amaterasu. No se puede entrar, pero desde el santuario se ve la entrada al otro lado del río.",
        tips: [
          "El santuario Amano Yasukawara, río arriba (15 min a pie), está lleno de pilas de piedras apiladas por los visitantes para pedir deseos.",
        ],
      },
      {
        place: "Yokagura (danza nocturna)",
        curiosity:
          "Takachiho es famoso por la Yokagura, un ciclo de 33 danzas sagradas que representan el mito de Amaterasu. En los hoteles de la zona suele ofrecerse una versión resumida para visitantes.",
      },
    ],
    "4": [
      {
        place: "Naha (Kokusai-dori)",
        curiosity:
          "Esta calle de 1,6 km se conoce como la «Milla Milagrosa» porque se reconstruyó casi de la nada tras quedar completamente arrasada en la Batalla de Okinawa (1945), convirtiéndose en pocos años en el corazón comercial de Naha.",
        tips: [
          "Los callejones laterales (Heiwa-dori, Ichiba Hon-dori) esconden el mercado cubierto y los bares más auténticos, lejos de las tiendas de souvenirs de la avenida principal.",
        ],
      },
    ],
    "5": [
      {
        place: "Kerama Shotō (islas Kerama)",
        curiosity:
          "El mar de Kerama suele superar los 30 m de visibilidad, por lo que la zona es Parque Nacional Marino desde 2014. Las tortugas verdes (Aoumigame) viven aquí todo el año, no solo de paso.",
        tips: ["Evita tocar tortugas o corales: es zona protegida y suele estar prohibido por los operadores locales."],
      },
    ],
    "6": [
      {
        place: "Karate de Okinawa",
        curiosity:
          "El karate moderno nació en Okinawa (entonces reino de Ryūkyū) como fusión de artes marciales chinas con técnicas locales, en un contexto en el que portar armas estuvo restringido durante siglos.",
        tips: ["El Karate Kaikan tiene un dojo abierto al público y una pequeña exposición sobre la historia del arte marcial."],
      },
      {
        place: "Castillo de Shuri",
        legend:
          "Fue la sede del Reino de Ryūkyū durante más de 400 años, un reino independiente que hacía de puente comercial entre China, Japón y el sudeste asiático. Destruido varias veces —incluida la Batalla de Okinawa (1945) y un incendio en 2019—, se sigue reconstruyendo con técnicas tradicionales.",
      },
    ],
    "7": [
      {
        place: "Kansai International Airport",
        curiosity:
          "Se construyó sobre una isla artificial en la bahía de Osaka y lo diseñó el arquitecto Renzo Piano. Es famoso tanto por su terminal de un solo edificio (la más larga del mundo cuando abrió) como por el hecho de que, desde que abrió en 1994, se ha ido hundiendo lentamente en el mar.",
      },
    ],
    "8": [
      {
        place: "Parque Memorial de la Paz",
        curiosity:
          "La Cúpula de la Bomba Atómica (Genbaku Dome) es el único edificio que quedó en pie cerca del epicentro de la explosión del 6 de agosto de 1945. Se mantiene intencionadamente en ruinas como monumento.",
        tips: ["El museo requiere 1,5-2 horas. Es una visita emotiva; muchos viajeros prefieren hacerla a primera hora."],
      },
      {
        place: "Torii flotante de Miyajima (Itsukushima)",
        legend:
          "La isla se considera tan sagrada que, tradicionalmente, ni los nacimientos ni las muertes podían tener lugar en ella. El torii se construyó dentro del agua para que los barcos pudieran pasar por debajo.",
        tips: ["Con marea baja se puede caminar hasta el torii; consulta la tabla de mareas antes de ir."],
      },
    ],
    "9": [
      {
        place: "Dōgo Onsen",
        legend:
          "Con más de 3.000 años de historia, es uno de los baños termales más antiguos de Japón (mencionado en el Nihon Shoki). El edificio principal de madera, de 1894, inspiró la estética de la casa de baños de 'El viaje de Chihiro' de Studio Ghibli.",
        tips: ["Si el edificio principal tiene mucha cola, el anexo Tsubaki-no-yu suele tener menos gente y es igualmente tradicional."],
      },
    ],
    "10": [
      {
        place: "Okayama",
        curiosity:
          "Okayama es conocida como la tierra de Momotarō, el 'niño melocotón', uno de los cuentos populares más famosos de Japón. Su símbolo aparece por toda la ciudad, incluso en las tapas de alcantarilla.",
      },
    ],
    "11": [
      {
        place: "Kurashiki Bikan",
        curiosity:
          "El barrio se conservó gracias a su pasado como almacén de arroz (kura) durante el período Edo. Los graneros blancos y negros con el característico revestimiento namako-kabe bordean el canal.",
      },
      {
        place: "Dōtonbori",
        tips: ["Los carteles luminosos (incluido el Glico Running Man) son mucho más espectaculares después del atardecer."],
      },
    ],
    "12": [
      {
        place: "Kōyasan",
        legend:
          "Fundado en 816 por el monje Kūkai (Kōbō Daishi) como centro del budismo Shingon. Se dice que no murió, sino que permanece en meditación eterna (nyūjō) en el mausoleo de Okunoin, esperando la llegada del futuro Buda Miroku.",
        tips: [
          "Dormir en un shukubō incluye la cena shōjin ryōri (cocina budista vegetariana) y, si quieres, asistir a la oración matutina (a menudo hacia las 6h).",
        ],
      },
    ],
    "13": [
      {
        place: "Cascada de Nachi y el Kumano Kodo",
        curiosity:
          "Con 133 m es la cascada de caída ininterrumpida más alta de Japón. El santuario Kumano Nachi Taisha y el templo Seiganto-ji forman parte de la ruta de peregrinación Kumano Kodo, Patrimonio Mundial de la UNESCO.",
      },
      {
        place: "Toba y las ama",
        curiosity:
          "Toba es la cuna de la perla cultivada, gracias a Kōkichi Mikimoto (1893). Las ama son buceadoras tradicionales que todavía pescan marisco y ostras sin equipo de buceo, tal como se hace desde hace siglos.",
      },
    ],
    "14": [
      {
        place: "Gion",
        tips: [
          "Desde 2019 hay calles privadas en Gion donde fotografiar a las geishas (geiko) o maiko está prohibido y se multa, para evitar el acoso turístico. Respeta los carteles.",
        ],
      },
    ],
    "15": [
      {
        place: "Fushimi Inari Taisha",
        legend:
          "Los miles de torii rojos ('Senbon Torii') son donaciones de empresas y particulares que piden prosperidad a Inari, la divinidad del arroz y los negocios. Cada torii lleva grabado el nombre del donante.",
        tips: [
          "El circuito completo hasta la cima (Mt. Inari) son 2-3 horas; la mayoría solo llega a los primeros miradores, así que a media subida hay mucha menos gente.",
        ],
      },
      {
        place: "Kiyomizu-dera",
        curiosity:
          "Su escenario de madera se construyó sin usar ni un solo clavo, mediante una técnica tradicional japonesa de ensamblaje de madera.",
      },
    ],
    "16": [
      {
        place: "Bosque de bambú de Arashiyama",
        tips: ["Mejor a primera hora de la mañana (antes de las 8h), tanto por la luz como para evitar las aglomeraciones."],
      },
      {
        place: "Kinkaku-ji (Pabellón Dorado)",
        curiosity:
          "El edificio actual es una reconstrucción de 1955: el original fue incendiado en 1950 por un monje novicio, un hecho que inspiró la novela 'El pabellón de oro' de Yukio Mishima.",
      },
      {
        place: "Gozan no Okuribi (Daimonji)",
        curiosity:
          "El 16 de agosto se encienden cinco grandes hogueras en las montañas que rodean Kyoto, formando caracteres y figuras (la más famosa es el kanji 大, 'grande'). Marca la despedida de los espíritus de los antepasados al terminar el Obon.",
      },
    ],
    "17": [
      {
        place: "Sanmachi Suji",
        curiosity:
          "El barrio antiguo conserva casas de madera de mercaderes del período Edo. Takayama también es conocida por el sake: varias bodegas centenarias del barrio ofrecen catas gratuitas o muy económicas.",
      },
    ],
    "18": [
      {
        place: "Nakasendō: Magome–Tsumago",
        curiosity:
          "Este tramo de 8 km formaba parte de la ruta Nakasendō, que unía Edo (Tokio) con Kyoto durante el período Edo. Tsumago fue el primer pueblo de Japón en prohibir la venta o el alquiler de edificios históricos para preservar su aspecto original, ya en los años 70.",
        tips: ["Hay un servicio de transporte de maletas entre los dos pueblos para no tener que cargarlas caminando."],
      },
    ],
    "19": [
      {
        place: "Monte Takao",
        legend:
          "Es una montaña sagrada asociada a los tengu, espíritus legendarios de nariz larga y poderes sobrenaturales, protectores del templo Yakuō-in.",
        tips: ["El teleférico o el chairlift ahorran el primer tramo de la subida si prefieres llegar más descansado."],
      },
    ],
    "20": [
      {
        place: "Senso-ji (Asakusa)",
        legend:
          "Según la leyenda, en el año 628 dos hermanos pescadores encontraron una estatua de Kannon en el río Sumida. Aunque la devolvieron al agua varias veces, siempre reaparecía, lo que se interpretó como una señal para construir un templo allí.",
      },
      {
        place: "Cruce de Shibuya",
        curiosity:
          "Es uno de los cruces peatonales más transitados del mundo, con picos de más de 3.000 personas cruzando a la vez. Los mejores puntos para verlo desde arriba son el Starbucks de Tsutaya o el Shibuya Sky.",
      },
    ],
    "21": [
      {
        place: "Mercado de Toyosu",
        curiosity:
          "Sustituyó al antiguo mercado de Tsukiji en 2018. La famosa subasta de atún de madrugada se puede ver desde una zona de observación acristalada (requiere reserva previa, plazas muy limitadas).",
      },
      {
        place: "teamLab Planets",
        tips: [
          "Hay que caminar descalzo y con pantalón corto o remangable: algunas salas tienen agua hasta las rodillas. Lleva toalla y muda.",
        ],
      },
    ],
  },

  ja: {
    "1": [
      {
        place: "Sakurai Futamigaura (Meoto Iwa)",
        legend:
          "しめ縄で結ばれた2つの岩は、『古事記』で日本を生んだとされる男女の神、イザナギとイザナミを表しているとされる。しめ縄は年に数回、神事によって新しく結び直される。",
        tips: [
          "夕方、特に日没時の光が美しい。",
          "干潮時には水面に小さな白い鳥居が現れ、写真映えする。",
        ],
      },
    ],
    "2": [
      {
        place: "東長寺 (Tōchō-ji)",
        curiosity:
          "日本最大級の木造仏像のひとつ、福岡大仏（高さ10m以上）を安置する。地下には「地獄極楽めぐり」と呼ばれる真っ暗な回廊があり、生まれ変わりを象徴している。",
        tips: ["閉門は17時（最終入場16時45分）。午前中に訪れるのがおすすめ。"],
      },
      {
        place: "高千穂峡",
        legend:
          "神話によれば、太陽の女神アマテラスは弟との争いの後、天岩戸という洞窟に身を隠し、世界を暗闇に包んだ。他の神々が音楽と踊りで誘い出すまで、太陽は隠れたままだったという。",
      },
    ],
    "3": [
      {
        place: "天岩戸神社",
        legend:
          "神社のすぐ裏にある聖なる洞窟が、アマテラスが隠れた場所とされている。中には入れないが、神社から川の対岸にその入口を望むことができる。",
        tips: [
          "川上に15分ほど歩いた先にある天安河原には、参拝者が願いを込めて積んだ石の山が無数にある。",
        ],
      },
      {
        place: "夜神楽",
        curiosity:
          "高千穂はアマテラスの神話を描いた33番からなる夜神楽で知られる。周辺の宿では観光客向けに短縮版が上演されることが多い。",
      },
    ],
    "4": [
      {
        place: "Naha (Kokusai-dori)",
        curiosity:
          "全長1.6kmのこの通りは、1945年の沖縄戦でほぼ完全に破壊された後、驚くほど短期間で再建されたことから「奇跡の1マイル」と呼ばれ、数年のうちに那覇の商業の中心地となった。",
        tips: ["脇道（平和通り、市場本通り）には市場やより地元らしい飲食店があり、大通りの土産物店とは違う雰囲気が楽しめる。"],
      },
    ],
    "5": [
      {
        place: "慶良間諸島",
        curiosity:
          "慶良間の海は透明度30mを超えることも多く、2014年に国立公園の海域に指定された。アオウミガメは通りすがりではなく、一年を通してこの海に生息している。",
        tips: ["ウミガメやサンゴには触れないこと。保護区域であり、現地の業者もたいてい禁止している。"],
      },
    ],
    "6": [
      {
        place: "沖縄空手",
        curiosity:
          "現代の空手は、かつての琉球王国であった沖縄で、中国武術と地元の技術が融合して生まれた。武器の携行が長らく制限されていた時代背景も影響している。",
        tips: ["空手会館には一般公開の道場と、空手の歴史を紹介する小さな展示がある。"],
      },
      {
        place: "首里城",
        legend:
          "400年以上にわたり琉球王国の王城であり、中国・日本・東南アジアを結ぶ貿易の拠点だった独立王国の中心地。沖縄戦（1945年）や2019年の火災など何度も焼失しているが、そのたびに伝統的な技法で再建されてきた。",
      },
    ],
    "7": [
      {
        place: "Kansai International Airport",
        curiosity:
          "大阪湾の人工島に建設され、建築家レンゾ・ピアノが設計した。開港時は世界最長だった単一構造のターミナルビルで知られる一方、1994年の開港以来ゆっくりと海に沈み続けていることでも有名。",
      },
    ],
    "8": [
      {
        place: "平和記念公園",
        curiosity:
          "原爆ドームは、1945年8月6日の爆心地近くで唯一倒壊を免れた建物。あえて廃墟のまま保存され、記念碑となっている。",
        tips: ["資料館の見学には1.5〜2時間ほど。感情的にこたえる展示のため、午前中に訪れる旅行者が多い。"],
      },
      {
        place: "宮島の海に浮かぶ大鳥居（厳島神社）",
        legend:
          "厳島は非常に神聖な島とされ、伝統的に島内での出産や死は避けられてきた。鳥居は船がくぐれるよう、あえて海の中に建てられている。",
        tips: ["干潮時には鳥居のすぐそばまで歩いていける。事前に潮見表を確認するとよい。"],
      },
    ],
    "9": [
      {
        place: "道後温泉",
        legend:
          "3000年以上の歴史を持ち、『日本書紀』にも記される日本最古級の温泉のひとつ。1894年建築の木造本館は、スタジオジブリ『千と千尋の神隠し』の湯屋のモデルになったといわれる。",
        tips: ["本館の行列が長いときは、椿の湯（別館）のほうが空いていることが多く、同じく歴史ある雰囲気が楽しめる。"],
      },
    ],
    "10": [
      {
        place: "岡山",
        curiosity:
          "岡山は日本を代表する昔話「桃太郎」ゆかりの地として知られる。そのモチーフは街のいたるところ、マンホールの蓋にまで見られる。",
      },
    ],
    "11": [
      {
        place: "倉敷美観地区",
        curiosity:
          "江戸時代に米蔵（くら）が並んだ歴史のおかげでこの街並みが保存された。運河沿いには「なまこ壁」の白黒の土蔵が連なる。",
      },
      {
        place: "道頓堀",
        tips: ["ネオン看板（グリコの看板ランナーを含む）は日没後のほうがずっと迫力がある。"],
      },
    ],
    "12": [
      {
        place: "高野山",
        legend:
          "816年、僧・空海（弘法大師）が真言密教の拠点として開いた。空海は入定（にゅうじょう）し、奥之院で今も永遠の瞑想を続けながら、未来仏・弥勒菩薩の到来を待っているとされる。",
        tips: [
          "宿坊に泊まると精進料理の夕食がつき、希望すれば早朝（多くは6時頃）のお勤めにも参加できる。",
        ],
      },
    ],
    "13": [
      {
        place: "那智の滝と熊野古道",
        curiosity:
          "落差133mで、一段の滝としては日本一の高さを誇る。熊野那智大社と青岸渡寺は、ユネスコ世界遺産の熊野古道の一部をなす。",
      },
      {
        place: "鳥羽と海女",
        curiosity:
          "鳥羽は御木本幸吉（1893年）が真珠の養殖に成功した「真珠発祥の地」。海女は今も昔ながらに、酸素ボンベを使わず素潜りで貝や牡蠣を採る伝統的な漁師たちである。",
      },
    ],
    "14": [
      {
        place: "祇園",
        tips: [
          "2019年以降、観光客によるハラスメントを防ぐため、祇園の一部私道では芸妓・舞妓の撮影が禁止され違反すると罰金が科される。掲示には従うこと。",
        ],
      },
    ],
    "15": [
      {
        place: "伏見稲荷大社",
        legend:
          "数千本におよぶ朱色の鳥居「千本鳥居」は、商売繁盛の神である稲荷神に祈願する企業や個人からの奉納。それぞれの鳥居には奉納者の名前が刻まれている。",
        tips: [
          "山頂（稲荷山）までの一周は2〜3時間。多くの人は最初の展望スポットまでしか行かないため、中腹から先は一気に人が減る。",
        ],
      },
      {
        place: "清水寺",
        curiosity:
          "有名な木造の舞台は、釘を一本も使わない日本の伝統的な木組み技術によって建てられている。",
      },
    ],
    "16": [
      {
        place: "嵐山の竹林",
        tips: ["光の美しさと混雑回避の両方の理由から、午前8時前に訪れるのがベスト。"],
      },
      {
        place: "金閣寺（鹿苑寺）",
        curiosity:
          "現在の建物は1955年の再建。オリジナルは1950年に見習い僧の放火で焼失しており、この事件は三島由紀夫の小説『金閣寺』の題材となった。",
      },
      {
        place: "五山送り火（大文字）",
        curiosity:
          "8月16日、京都を囲む山々に5つの大きなかがり火が灯される。中でも有名なのが「大」の字（大文字）で、お盆に迎えた先祖の霊を送り出す行事である。",
      },
    ],
    "17": [
      {
        place: "三町筋",
        curiosity:
          "江戸時代の商家の木造建築が残る古い町並み。高山は日本酒でも知られ、地区内の老舗酒蔵の多くが無料または格安の試飲を提供している。",
      },
    ],
    "18": [
      {
        place: "中山道：馬籠宿〜妻籠宿",
        curiosity:
          "この8kmの区間は、江戸時代に江戸と京都を結んだ中山道の一部だった。妻籠宿は1970年代、街並みを保存するため歴史的建造物の売却・賃貸を日本で初めて禁止した宿場町である。",
        tips: ["両宿場間には荷物配送サービスがあり、歩きながら荷物を持ち運ぶ必要がない。"],
      },
    ],
    "19": [
      {
        place: "高尾山",
        legend:
          "薬王院を守護するとされる、鼻の長い伝説の霊力を持つ天狗と結びつけられた霊山。",
        tips: ["ケーブルカーやリフトを使えば、登りの最初の区間を省略して体力を温存できる。"],
      },
    ],
    "20": [
      {
        place: "浅草寺",
        legend:
          "伝承によれば628年、漁師の兄弟が隅田川で観音像を見つけた。何度も川に戻しても像はそのたびに現れたため、これを機にお堂が建てられたとされる。",
      },
      {
        place: "渋谷スクランブル交差点",
        curiosity:
          "世界有数の交通量を誇る交差点で、一度に3,000人以上が渡ることもある。上から眺めるベストスポットは、TSUTAYA内のスターバックスやSHIBUYA SKY。",
      },
    ],
    "21": [
      {
        place: "豊洲市場",
        curiosity:
          "2018年、旧築地市場に代わってオープン。早朝のマグロの競りは、ガラス越しの見学デッキから見学できる（事前予約制、枠は非常に限られる）。",
      },
      {
        place: "チームラボプラネッツ",
        tips: [
          "裸足になり、短パンまたは裾をまくれるズボンで参加すること。膝まで水に浸かる展示室もあるため、タオルと着替えを持参するとよい。",
        ],
      },
    ],
  },
};

export function getHighlights(
  lang: string,
  day: string,
): Highlight[] | undefined {
  const table = (enrichment as Record<string, EnrichmentByDay>)[lang];
  return table?.[day] ?? enrichment.ca[day];
}
