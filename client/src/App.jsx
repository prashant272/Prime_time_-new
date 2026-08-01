import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingChatMenu from './components/common/FloatingChatMenu';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Pages with Code Splitting (Lazy Loading)
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const OurPatronsPage = lazy(() => import('./pages/OurPatronsPage'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const AdvertisingServiceDetail = lazy(() => import('./pages/AdvertisingServiceDetail'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailsPage = lazy(() => import('./pages/BlogDetailsPage'));
const AwardsLanding = lazy(() => import('./pages/AwardsLanding'));
const AwardEventPage = lazy(() => import('./pages/AwardEventPage'));
const Nomination = lazy(() => import('./pages/Nomination'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));

// Admin Pages (Lazy Loading)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminSignup = lazy(() => import('./pages/admin/AdminSignup'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ContactSubmissions = lazy(() => import('./pages/admin/ContactSubmissions'));
const NominationSubmissions = lazy(() => import('./pages/admin/NominationSubmissions'));
const AdminBlogList = lazy(() => import('./pages/admin/AdminBlogList'));
const AdminWriteBlog = lazy(() => import('./pages/admin/AdminWriteBlog'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAwardCategories = lazy(() => import('./pages/admin/AdminAwardCategories'));
const AdminAwardEvents = lazy(() => import('./pages/admin/AdminAwardEvents'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!location.pathname.startsWith("/admin") && <Navbar />}
      
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-sky-900">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-sky-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-sky-600">Loading...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/our-patrons" element={<OurPatronsPage />} />
            <Route path="/services" element={<Navigate to="/services/market-research" replace />} />
            <Route path="/services/:serviceId" element={<ServiceDetails />} />
            <Route path="/advertising-services" element={<Navigate to="/advertising-services/auto-rickshaw-branding" replace />} />
            <Route path="/advertising-services/:serviceId" element={<AdvertisingServiceDetail />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/awards" element={<AwardsLanding />} />
            <Route path="/awards/:categorySlug" element={<AwardsLanding />} />
            <Route path="/awards/:categorySlug/:eventSlug" element={<AwardEventPage />} />
            <Route path="/nomination" element={<Nomination />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            
            {/* Protected Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="contact" element={<ContactSubmissions />} />
              <Route path="nominations" element={<NominationSubmissions />} />
              <Route path="award-categories" element={<AdminAwardCategories />} />
              <Route path="award-events" element={<AdminAwardEvents />} />
              <Route path="blogs" element={<AdminBlogList />} />
              <Route path="blogs/new" element={<AdminWriteBlog />} />
              <Route path="blogs/:id/edit" element={<AdminWriteBlog />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Add more nested admin routes here later */}
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!location.pathname.startsWith("/admin") && <Footer />}
      {!location.pathname.startsWith("/admin") && <FloatingChatMenu />}
    </div>
  );
}

export default App;
