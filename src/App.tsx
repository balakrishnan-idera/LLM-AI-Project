import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/NavBar";
import LandingPage from "./pages/LandingPage";
import ERObjectsPage from "./pages/ERObjectsPage";
import TermsPage from "./pages/TermsPage";
import ERObjectDetailPage from "./pages/ERObjectDetailPage";
import TermDetailPage from "./pages/TermDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <NavBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/erobjects" element={<ERObjectsPage />} />
            <Route path="/erobjects/:id" element={<ERObjectDetailPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms/:id" element={<TermDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
