import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../styles/fonts.css";
import { AuthProvider } from "./components/auth-provider";
import { SplashScreen } from "./components/splash-screen";
import { FloatingParticles } from "./components/floating-particles";
import { Nav } from "./components/nav";
import { HeroSection } from "./components/hero-section";
import { CharactersSection } from "./components/characters-section";
import { ElementsSection } from "./components/elements-section";
import { WorldSection } from "./components/world-section";
import { CtaSection } from "./components/cta-section";
import { Footer } from "./components/footer";
import { WorldMapPage } from "./components/world-map-page";
import { AdventurersPage } from "./components/adventurers-page";
import { PlayPage } from "./play-page";

// ─── Home page ────────────────────────────────────────────────────────────────
function HomePage() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <HeroSection />
      <CharactersSection />
      <ElementsSection />
      <WorldSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const [entered, setEntered] = useState(false);

  return (
    <div style={{ background: "#06080f", minHeight: "100vh", position: "relative" }}>
      <SplashScreen onEnter={() => setEntered(true)} />
      <FloatingParticles />
      <Nav autoPlay={entered} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<WorldMapPage />} />
        <Route path="/adventurers" element={<AdventurersPage />} />
        <Route path="/play" element={<PlayPage />} />
      </Routes>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}