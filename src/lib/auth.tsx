import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// App estatica sin backend: esto es un candado de cortesia para que solo
// quien tenga el codigo entre, no una autenticacion real (el bundle es
// publico y cualquiera con devtools podria leer el hash).
const CODE_HASH = "176ae206095f105190d36eaf93f55954fb152fc4cbd8cfe02325c897f96d6552";
const CODE_CONTEXT = "japo2026:";

const STORAGE_KEY = "japo2026:auth";

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface AuthApi {
  unlocked: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "1",
  );

  const unlock = async (code: string) => {
    const hash = await sha256Hex(CODE_CONTEXT + code);
    if (hash !== CODE_HASH) return false;
    localStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    return true;
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  const api: AuthApi = { unlocked, unlock, lock };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
