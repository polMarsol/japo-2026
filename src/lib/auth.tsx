import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// App estatica sin backend: esto es un candado de cortesia para que solo
// quien tenga el codigo entre, no una autenticacion real (el bundle es
// publico y cualquiera con devtools podria leer los hashes). Lo mismo
// aplica a las reglas de Firestore: no pueden exigir un secreto que el
// cliente no pueda guardar, asi que la escritura en la nube queda
// protegida solo por "no tener el codigo", igual que este candado.
const CODE_HASH = "176ae206095f105190d36eaf93f55954fb152fc4cbd8cfe02325c897f96d6552";
const ADMIN_CODE_HASH = "98fc9871109e589980810b5354ef2f3384502286a23310b2d5b6bac972bf2445";
const CODE_CONTEXT = "japo2026:";
const ADMIN_CODE_CONTEXT = "japo2026-admin:";

const STORAGE_KEY = "japo2026:auth";
const ADMIN_STORAGE_KEY = "japo2026:admin";

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface AuthApi {
  unlocked: boolean;
  isAdmin: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "1",
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => localStorage.getItem(ADMIN_STORAGE_KEY) === "1",
  );

  const unlock = async (code: string) => {
    const [hash, adminHash] = await Promise.all([
      sha256Hex(CODE_CONTEXT + code),
      sha256Hex(ADMIN_CODE_CONTEXT + code),
    ]);

    if (adminHash === ADMIN_CODE_HASH) {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(ADMIN_STORAGE_KEY, "1");
      setUnlocked(true);
      setIsAdmin(true);
      return true;
    }
    if (hash === CODE_HASH) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUnlocked(false);
    setIsAdmin(false);
  };

  const api: AuthApi = { unlocked, isAdmin, unlock, lock };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
