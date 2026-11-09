import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { NoEmpresa, SoloRol } from "./components/Guardas";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Companies from "./pages/Companies";
import About from "./pages/About";
import PanelEmpresa from "./pages/PanelEmpresa";
import PanelCandidato from "./pages/PanelCandidato";

import "./App.css";

// Sube al inicio de la pagina cada vez que cambia la ruta
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="page">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<NoEmpresa><Home /></NoEmpresa>} />
          <Route path="/empleos" element={<NoEmpresa><Jobs /></NoEmpresa>} />
          <Route path="/empleos/:id" element={<NoEmpresa><JobDetail /></NoEmpresa>} />
          <Route path="/empresas" element={<NoEmpresa><Companies /></NoEmpresa>} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/panel-empresa" element={<SoloRol rol="empresa"><PanelEmpresa /></SoloRol>} />
          <Route path="/mis-postulaciones" element={<SoloRol rol="candidato"><PanelCandidato /></SoloRol>} />
          <Route path="/login" element={<Login modo="login" />} />
          <Route path="/registro" element={<Login modo="register" />} />
          <Route path="/registro-empresa" element={<Login modo="register" tipoInicial="empresa" />} />
          <Route path="*" element={<NoEmpresa><Home /></NoEmpresa>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
