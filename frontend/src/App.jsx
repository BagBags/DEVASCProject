import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// i18n setup
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// PWA Components
import OfflineIndicator from "./components/shared/OfflineIndicator";
import PWAInstallPrompt from "./components/shared/PWAInstallPrompt";
import LazyLoadErrorBoundary from "./components/shared/LazyLoadErrorBoundary";
import AuthPersistence from "./components/AuthPersistence";

import SignupForm from "./components/loginComponents/signupForm";
import LoginPage from "./components/loginComponents/loginPage";

// Contexts
import { UserProvider } from "./contexts/UserContext";

// Admin Side
import AdminHome from "./components/adminComponents/adminHomeComponents/adminHome";
import AdminContent from "./components/adminComponents/adminContentComponents/adminContent";
import AdminItinerary from "./components/adminComponents/adminItineraryComponents/adminItinerary";
import AdminMap from "./components/adminComponents/adminTourMapComponents/AdminTourMap";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Tourist Side
import ProfilePage from "./components/userComponents/ProfileComponents/Profile";
import Account from "./components/userComponents/ProfileComponents/Account";
import ProfileLayout from "./components/userComponents/ProfileComponents/ProfileLayout";
import "./App.css";
import Birthday from "./components/userComponents/ProfileComponents/Birthday";
import Gender from "./components/userComponents/ProfileComponents/Gender";
import Country from "./components/userComponents/ProfileComponents/Country";
import Language from "./components/userComponents/ProfileComponents/Language";
import Homepage from "./components/userComponents/HomepageComponents/Homepage";
import CreateItineraryPage from "./components/userComponents/CreateItinerary/CreateItinerary";
import TouristItinerary from "./components/userComponents/HomepageComponents/TouristItinerary";
import TouristItineraryMap from "./components/userComponents/HomepageComponents/TouristItinerariesMap";
import TourMap from "./components/userComponents/TourMap/LazyUserMap";

// Guest Side
import GuestHomepage from "./components/userComponents/HomepageComponents/GuestHomepage";
import GuestItinerary from "./components/userComponents/GuestItineraryComponents/GuestItinerary";
import GuestItineraryMap from "./components/userComponents/GuestItineraryComponents/GuestItineraryMap";

import TouristProtectedRoute from "./components/TouristProtectedRoute";
import NotFound from "./components/NotFound";
import CompleteProfile from "./components/userComponents/CompleteProfile";

// Helper wrapper to inject location for AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/CompleteProfile" element={<CompleteProfile />} />
        
        {/* Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/AdminHome" element={<AdminHome />} />
          <Route path="/AdminManageContent" element={<AdminContent />} />
          <Route path="/AdminItinerary" element={<AdminItinerary />} />
          <Route path="/AdminTourMap" element={<AdminMap />} />
        </Route>
        
        {/* Guest/Public Routes */}
        <Route path="/GuestHomepage" element={<GuestHomepage />} />
        <Route path="/GuestItinerary" element={<GuestItinerary />} />
        <Route path="/GuestItineraryMap/:itineraryId" element={<GuestItineraryMap />} />
        <Route path="/TourMap" element={<TourMap />} />
        
        <Route element={<TouristProtectedRoute />}>
          {/* Tourist - Core Features */}
          <Route path="/Homepage" element={<Homepage />} />
          <Route path="/CreateItinerary" element={<CreateItineraryPage />} />
          <Route path="/TouristItinerary" element={<TouristItinerary />} />
          <Route
            path="/TouristItineraryMap/:itineraryId"
            element={<TouristItineraryMap />}
          />
          {/* Profile Section with Persistent Header */}
          <Route path="/Profile" element={<ProfileLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="Account" element={<Account />} />
            <Route path="Birthday" element={<Birthday />} />
            <Route path="Gender" element={<Gender />} />
            <Route path="Country" element={<Country />} />
            <Route path="Language" element={<Language />} />
          </Route>
        </Route>
        
        {/* 404 Not Found - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLang);
  }, []);
  return (
    <LazyLoadErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <UserProvider>
          <Router>
            <AuthPersistence>
              <AnimatedRoutes />
              <OfflineIndicator />
              <PWAInstallPrompt />
            </AuthPersistence>
          </Router>
        </UserProvider>
      </I18nextProvider>
    </LazyLoadErrorBoundary>
  );
}
