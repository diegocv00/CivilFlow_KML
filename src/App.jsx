import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import WorkArea from './components/workarea'
import ProfilePage from './pages/ProfilePage'
import DocsPage from './pages/DocsPage'
import PricingPage from './pages/PricingPage'

function App() {
  return (
    <div className="min-h-screen bg-surface-bg text-on-surface font-sans">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<WorkArea />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
