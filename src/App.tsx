import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { LockScreen } from "./components/LockScreen";
import { Home } from "./pages/Home";
import { Days } from "./pages/Days";
import { DayDetail } from "./pages/DayDetail";
import { Reserves } from "./pages/Reserves";
import { Expenses } from "./pages/Expenses";
import { Equipatge } from "./pages/Equipatge";
import { Translator } from "./pages/Translator";
import { Clima } from "./pages/Clima";
import { Etiqueta } from "./pages/Etiqueta";
import { Album } from "./pages/Album";
import { ChatBot } from "./components/ChatBot";
import { useAuth } from "./lib/auth";

// Leaflet es pesado (~140kB): se separa en su propio chunk para no
// alentar la carga inicial de las pantallas de uso más frecuente.
const Mapes = lazy(() =>
  import("./pages/Mapes").then((m) => ({ default: m.Mapes })),
);

export default function App() {
  const { unlocked } = useAuth();

  if (!unlocked) return <LockScreen />;

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-app-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dies" element={<Days />} />
          <Route path="/dies/:day" element={<DayDetail />} />
          <Route path="/reserves" element={<Reserves />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/equipatge" element={<Equipatge />} />
          <Route path="/traductor" element={<Translator />} />
          <Route path="/clima" element={<Clima />} />
          <Route path="/etiqueta" element={<Etiqueta />} />
          <Route path="/album" element={<Album />} />
          <Route
            path="/mapes"
            element={
              <Suspense
                fallback={<p className="p-4 text-sm text-muted">…</p>}
              >
                <Mapes />
              </Suspense>
            }
          />
        </Routes>
      </main>
      <ChatBot />
      <BottomNav />
    </>
  );
}
