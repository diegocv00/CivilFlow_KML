import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WorkArea from './components/workarea'
import ProfilePage from './pages/ProfilePage'
import DocsPage from './pages/DocsPage'
import PricingPage from './pages/PricingPage'
import CivilFlowPage from './pages/CivilFlowPage'
import CivilStructurePage from './pages/CivilStructurePage'
import CivilTerrainPage from './pages/CivilTerrainPage'
import CivilBIMPage from './pages/CivilBIMPage'
import CivilManagePage from './pages/CivilManagePage'
import CivilMEPPage from './pages/CivilMEPPage'
import CivilRoadsPage from './pages/CivilRoadsPage'

function App() {
  return (
    <div className="min-h-screen bg-surface-bg text-on-surface font-sans">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/civilflow" element={<CivilFlowPage />} />
        <Route path="/civilstructure" element={<CivilStructurePage />} />
        <Route path="/civilterrain" element={<CivilTerrainPage />} />
        <Route path="/civilbim" element={<CivilBIMPage />} />
        <Route path="/civilmanage" element={<CivilManagePage />} />
        <Route path="/civilmep" element={<CivilMEPPage />} />
        <Route path="/civilroads" element={<CivilRoadsPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<WorkArea />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
