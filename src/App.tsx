import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import WhatsAppButton from "./components/WhatsAppButton";
import Index from "./pages/Index";
import Testimonios from "./pages/Testimonios";
import Pdf from "./pages/Pdf";
import Pdf2 from "./pages/Pdf2";
import Equipo from "./pages/Equipo";
import Blog from "./pages/Blog";
import AntiinflamatorioHerniaDiscal from "./pages/AntiinflamatorioHerniaDiscal";
import HerniaDiscal from "./pages/HerniaDiscal";
import HerniaDiscalL5S1 from "./pages/HerniaDiscalL5S1";
import EstenosisLumbar from "./pages/EstenosisLumbar";
import HerniaCervicalC5C6 from "./pages/HerniaCervicalC5C6";
import HerniaDiscalReabsorber from "./pages/HerniaDiscalReabsorber";
import HerniaDiscalCurar from "./pages/HerniaDiscalCurar";
import HerniaDiscalEjerciciosEvitar from "./pages/HerniaDiscalEjerciciosEvitar";
import HerniaDiscalLumbar from "./pages/HerniaDiscalLumbar";
import EjerciciosQueNoDeboHacer from "./pages/EjerciciosQueNoDeboHacer";
import HerniaDiscalComoSeProduceYComoCurarla from "./pages/HerniaDiscalComoSeProduceYComoCurarla";
import EjercicioNatacionTerapeuticaHerniaDiscal from "./pages/EjercicioNatacionTerapeuticaHerniaDiscal";
import HerniasDiscalesPorQueNoMejoras from "./pages/HerniasDiscalesPorQueNoMejoras";
import EjerciciosRespiracionDolorEspalda from "./pages/EjerciciosRespiracionDolorEspalda";
import EstenosisLumbarQueEsEjerciciosseguros from "./pages/EstenosisLumbarQueEsEjerciciosseguros";
import EstiramientosHerniaDiscalCiaticaFuerza from "./pages/EstiramientosHerniaDiscalCiaticaFuerza";
import EntrenarConHerniaDiscalRiesgosBienHecho from "./pages/EntrenarConHerniaDiscalRiesgosBienHecho";
import EspaldaIndestructible from "./pages/EspaldaIndestructible";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import Programa from "./pages/Programa";
import Evento from "./pages/Evento";
import Eapuntate from "./pages/Eapuntate";
import Eventoads from "./pages/Eventoads";
import Verifymaileventos from "./pages/Verifymaileventos";
import Verifymailpdf from "./pages/Verifymailpdf";
import ThankYouEvento from "./pages/ThankYouEvento";
import ThankYouEapuntate from "./pages/ThankYouEapuntate";
import ThankYouEventoads from "./pages/ThankYouEventoads";
import ThankYouEi from "./pages/ThankYouEi";
import NotFound from "./pages/NotFound";
import AvisoLegal from "./pages/AvisoLegal";
import PoliticaCookies from "./pages/PoliticaCookies";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import DeclaracionAccesibilidad from "./pages/DeclaracionAccesibilidad";
import Contacto from "./pages/Contacto";
import PoliticaDevoluciones from "./pages/PoliticaDevoluciones";

const queryClient = new QueryClient();

const MetaPixelPageView = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname]);
  return null;
};

const TikTokPageView = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.page();
    }
  }, [pathname]);
  return null;
};

const ConditionalWhatsApp = () => {
  const { pathname } = useLocation();
  const showOnRoutes = ["/", "/programa", "/testimonios", "/equipo", "/contacto"];
  const show = showOnRoutes.includes(pathname) || pathname.startsWith("/blog");
  return show ? <WhatsAppButton /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ConditionalWhatsApp />
        <MetaPixelPageView />
        <TikTokPageView />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/testimonios" element={<Testimonios />} />
          <Route path="/pdf" element={<Pdf />} />
          <Route path="/pdf2" element={<Pdf2 />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/antiinflamatorio-hernia-discal" element={<AntiinflamatorioHerniaDiscal />} />
          <Route path="/blog/como-curar-hernia-discal-sin-cirugia" element={<HerniaDiscal />} />
          <Route path="/blog/hernia-discal-l5-s1" element={<HerniaDiscalL5S1 />} />
          <Route path="/blog/estenosis-lumbar" element={<EstenosisLumbar />} />
          <Route path="/blog/hernia-cervical-c5-c6" element={<HerniaCervicalC5C6 />} />
          <Route path="/blog/hernia-discal-se-puede-reabsorber-sola-sin-cirugia" element={<HerniaDiscalReabsorber />} />
          <Route path="/blog/curar-hernia-discal-sin-cirugia" element={<HerniaDiscalCurar />} />
          <Route path="/blog/ejercicios-que-no-debo-hacer-hernia-discal" element={<HerniaDiscalEjerciciosEvitar />} />
          <Route path="/blog/ejercicios-hernia-discal-lumbar" element={<HerniaDiscalLumbar />} />
          <Route path="/blog/ejercicios-que-no-debo-hacer-si-tengo-hernia-discal" element={<EjerciciosQueNoDeboHacer />} />
          <Route path="/blog/hernia-discal-como-se-produce-y-como-curarla-sin-cirugia" element={<HerniaDiscalComoSeProduceYComoCurarla />} />
          <Route path="/blog/ejercicio-natacion-terapeutica-hernia-discal" element={<EjercicioNatacionTerapeuticaHerniaDiscal />} />
          <Route path="/blog/hernias-discales-por-que-no-mejoras" element={<HerniasDiscalesPorQueNoMejoras />} />
          <Route path="/blog/ejercicios-respiracion-dolor-espalda" element={<EjerciciosRespiracionDolorEspalda />} />
          <Route path="/blog/estenosis-lumbar-que-es-ejercicios-seguros" element={<EstenosisLumbarQueEsEjerciciosseguros />} />
          <Route path="/blog/estiramientos-hernia-discal-ciatica-fuerza" element={<EstiramientosHerniaDiscalCiaticaFuerza />} />
          <Route path="/blog/entrenar-con-hernia-discal-riesgos-bien-hecho" element={<EntrenarConHerniaDiscalRiesgosBienHecho />} />
          <Route path="/tienda" element={<EspaldaIndestructible />} />
          <Route path="/tienda/:slug" element={<CheckoutPage />} />
          <Route path="/programa" element={<Programa />} />
          <Route path="/evento" element={<Evento />} />
          <Route path="/eapuntate" element={<Eapuntate />} />
          <Route path="/eventoads" element={<Eventoads />} />
          <Route path="/verifymaileventos" element={<Verifymaileventos />} />
          <Route path="/verifymailpdf" element={<Verifymailpdf />} />
          <Route path="/thankyou-evento" element={<ThankYouEvento />} />
          <Route path="/thankyou-eapuntate" element={<ThankYouEapuntate />} />
          <Route path="/thankyou-eventoads" element={<ThankYouEventoads />} />
          <Route path="/thankyou-ei" element={<ThankYouEi />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/politica-cookies" element={<PoliticaCookies />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/declaracion-accesibilidad" element={<DeclaracionAccesibilidad />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/politica-devoluciones" element={<PoliticaDevoluciones />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
