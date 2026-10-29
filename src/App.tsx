import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./lib/auth"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import DemoBanner from "./components/layout/DemoBanner"
import HomePage from "./pages/HomePage"
import PlannerPage from "./pages/PlannerPage"
import WorkshopPage from "./pages/WorkshopPage"
import BuildBattlePage from "./pages/BuildBattlePage"
import LeaderboardPage from "./pages/LeaderboardPage"
import PassportPage from "./pages/PassportPage"
import PublicPassportPage from "./pages/PublicPassportPage"
import CertificatePage from "./pages/CertificatePage"
import LoginPage from "./pages/LoginPage"
import AdminPage from "./pages/AdminPage"
import NotFound from "./pages/NotFound"

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (user.role !== "admin" && user.role !== "judge") return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/workshop" element={<WorkshopPage />} />
            <Route path="/build-battle" element={<BuildBattlePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/p/:token" element={<PublicPassportPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<ProtectedAdmin><AdminPage /></ProtectedAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
