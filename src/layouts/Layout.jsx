import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

const sidebarLinks = [
  { path: '/dashboard', label: 'Panel Principal', icon: 'dashboard' },
  { path: '/perfil', label: 'Perfil', icon: 'person' },
  { path: '/docs', label: 'Documentación', icon: 'description' },
]

function Layout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col border-r border-outline-variant transition-[width] duration-300 ${
          collapsed ? 'w-16' : 'w-[250px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-outline-variant">
          <span className="material-symbols-outlined text-primary text-2xl mr-2">ssid_chart</span>
          {!collapsed && (
            <span className="text-sm font-bold tracking-widest uppercase text-primary">DHIDROSAN</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path)
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center h-10 mx-2 px-3 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-surface-container text-primary border-l-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] leading-none mr-3">{link.icon}</span>
                {!collapsed && <span className="font-medium">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-outline-variant p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-8 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!collapsed && <span className="text-[11px] ml-2 text-on-surface-variant">Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center px-8 border-b border-outline-variant shrink-0">
          <h1 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant">
            {location.pathname === '/' && 'Panel Principal'}
            {location.pathname === '/dashboard' && 'Panel Principal'}
            {location.pathname === '/perfil' && 'Perfil'}
            {location.pathname === '/docs' && 'Documentación'}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-error" />
            </button>
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
              <span className="text-sm font-medium text-on-surface">Ing. Camilo Cardenas</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
