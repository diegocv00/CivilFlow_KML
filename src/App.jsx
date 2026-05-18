import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import DocsPage from './pages/DocsPage'

function App() {
  return (
    <div className="min-h-screen bg-surface-bg text-on-surface font-sans">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
