import { useEffect, useState } from "react";

// Web Speech API: 100% client-side, no la xarxa. Un cop el dispositiu té
// instal·lada una veu japonesa (habitual a iOS/Android/desktop moderns), la
// síntesi de veu funciona sense connexió durant el viatge.
function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakJapanese(text: string) {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
  const jaVoice = loadVoices().find((v) => v.lang?.toLowerCase().startsWith("ja"));
  if (jaVoice) utterance.voice = jaVoice;
  window.speechSynthesis.speak(utterance);
}

export function useHasJapaneseVoice(): boolean {
  const [has, setHas] = useState(() => loadVoices().some((v) => v.lang?.toLowerCase().startsWith("ja")));

  useEffect(() => {
    if (!isSpeechSupported()) return;
    function update() {
      setHas(loadVoices().some((v) => v.lang?.toLowerCase().startsWith("ja")));
    }
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  return has;
}
