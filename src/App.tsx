import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import PortfolioWeddings from "./pages/PortfolioWeddings";
import PortfolioEvents from "./pages/PortfolioEvents";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Experience from "./pages/Experience";
import ServicesPreview from "./pages/ServicesPreview";
import Preview from "./pages/Preview";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminUpload from "./pages/admin/AdminUpload";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminStories from "./pages/admin/AdminStories";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAltTemplates from "./pages/admin/AdminAltTemplates";
import AdminImport from "./pages/admin/AdminImport";
import AdminExperience from "./pages/admin/AdminExperience";
import AdminServices from "./pages/admin/AdminServices";
import AdminPreviews from "./pages/admin/AdminPreviews";
import AdminPreviewEdit from "./pages/admin/AdminPreviewEdit";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

const App = () => {
  // GA listener component: sends page_view on route change (requires gtag snippet in index.html)
  const GAListener: React.FC = () => {
    const location = useLocation();
    React.useEffect(() => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
        });
      }
    }, [location]);
    return null;
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
         <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <GAListener />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/weddings" element={<PortfolioWeddings />} />
                <Route path="/portfolio/events" element={<PortfolioEvents />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/experience" element={<Experience />} />
                {/* Same Day Preview — private unlisted link, noindex */}
                <Route path="/preview/:slug" element={<Preview />} />
                {/* Hidden preview of the redesigned Services page (noindex, unlinked) */}
                <Route path="/services-preview" element={<ServicesPreview />} />
                <Route path="/servicii-preview" element={<ServicesPreview />} />
                <Route path="/en/experience" element={<Experience />} />
                <Route path="/ro/experience" element={<Experience />} />
                {/* Permanent redirects from the old preview routes */}
                <Route path="/experience-preview" element={<Navigate to="/experience" replace />} />
                <Route path="/en/experience-preview" element={<Navigate to="/en/experience" replace />} />
                <Route path="/ro/experience-preview" element={<Navigate to="/ro/experience" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/upload" replace />} />
                  <Route path="upload" element={<AdminUpload />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="experience" element={<AdminExperience />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="previews" element={<AdminPreviews />} />
                  <Route path="previews/:id" element={<AdminPreviewEdit />} />
                  <Route path="stories" element={<AdminStories />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="alt-templates" element={<AdminAltTemplates />} />
                  <Route path="import" element={<AdminImport />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
         </AdminAuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
