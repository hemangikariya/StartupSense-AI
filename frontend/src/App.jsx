import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { IdeaValidator } from './pages/IdeaValidator';
import { SuccessPrediction } from './pages/SuccessPrediction';
import { InvestorReadiness } from './pages/InvestorReadiness';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { StartupDNA } from './pages/StartupDNA';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { MarketOpportunity } from './pages/MarketOpportunity';
import { SWOTAnalysis } from './pages/SWOTAnalysis';
import { RevenueModel } from './pages/RevenueModel';
import { TargetAudience } from './pages/TargetAudience';
import { MVPGenerator } from './pages/MVPGenerator';
import { TechStack } from './pages/TechStack';
import { Branding } from './pages/Branding';
import { PitchDeckGenerator } from './pages/PitchDeckGenerator';
import { BusinessPlanGenerator } from './pages/BusinessPlanGenerator';
import { Forecasting } from './pages/Forecasting';
import { ReportsCenter } from './pages/ReportsCenter';
import { MentorChat } from './pages/MentorChat';
import { HelpCenter } from './pages/HelpCenter';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

// Global Layout Components
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Protected Route Guard
const ProtectedRoute = ({ children, adminOnly }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Dashboard Wrapper Layout
const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'pl-16' : 'pl-64'}`}>
        <Navbar />
        <main className="flex-grow overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-analysis"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IdeaValidator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/success-prediction"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SuccessPrediction />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor-readiness"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <InvestorReadiness />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-analysis"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RiskAnalysis />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/startup-dna"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StartupDNA />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/competitors"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CompetitorAnalysis />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-research"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MarketOpportunity />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/swot"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SWOTAnalysis />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RevenueModel />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audience"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TargetAudience />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mvp"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MVPGenerator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech-stack"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TechStack />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/branding"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Branding />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pitch-deck"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PitchDeckGenerator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-plan"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BusinessPlanGenerator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forecasting"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Forecasting />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsCenter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-mentor"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MentorChat />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-center"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HelpCenter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
