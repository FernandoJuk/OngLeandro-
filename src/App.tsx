import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Confirmacao from "./pages/MensagemEmailCadastro";
import AccountSettings from "./pages/AccountSettings";
import AddProperty from "./pages/AddProperty";
import AdminPanel from "./pages/AdminPanel";
import Auth from "./pages/Auth";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";
import EditProperty from "./pages/EditProperty";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesDashboard from "./pages/MessagesDashboard";
import Property from "./pages/Property";
import SearchResults from "./pages/SearchResults";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import HelpCenter from "./pages/HelpCenter";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/mensagem-email-cadastro" element={<Confirmacao />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/chat/:conversationId" element={<ChatPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/edit-property/:id" element={<EditProperty />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/messages" element={<MessagesDashboard />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/property/:id" element={<Property />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;