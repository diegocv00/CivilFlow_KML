import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

const SIDEBAR_LINKS = [
  { to: '/dashboard', l: 'Área de trabajo', ico: '◈' },
  { to: '/perfil', l: 'Perfil', ico: '◎' },
  { to: '/docs', l: 'Documentación', ico: '▣' },
]

function Layout() {
  const location = useLocation()
  const path = location.pathname
  const [collapsed, setCollapsed] = useState(true)
  const w = collapsed ? 56 : 220

  return (
    <div className="h-screen overflow-hidden bg-surface-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16">
        <aside style={{
          width: w, flexShrink: 0, background: '#15171b',
          borderRight: '1px solid #2a2c30', display: 'flex',
          flexDirection: 'column', overflow: 'hidden',
          transition: 'width 0.2s'
        }}>
          <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'12px 0'}}>
          {SIDEBAR_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', fontSize: 13, fontWeight: path === l.to ? 600 : 400,
                color: path === l.to ? '#3B82F6' : '#849495',
                background: path === l.to ? 'rgba(59,130,246,0.06)' : 'transparent',
                borderLeft: path === l.to ? '3px solid #3B82F6' : '3px solid transparent',
                textDecoration: 'none', fontFamily: 'Geist, monospace',
                letterSpacing: '0.02em', transition: 'all 0.15s',
                whiteSpace: 'nowrap', overflow: 'hidden'
              }}>
              <span style={{fontSize:14,opacity:0.7,flexShrink:0}}>{l.ico}</span>
              {!collapsed && <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{l.l}</span>}
            </Link>
          ))}
          </div>
          <div style={{padding:'8px 0',borderTop:'1px solid #2a2c30',display:'flex',justifyContent:'center'}}>
            <button onClick={()=>setCollapsed(p=>!p)}
              style={{background:'none',border:'none',cursor:'pointer',color:'#849495',fontSize:16,padding:'6px 12px',borderRadius:4,transition:'all 0.15s'}}>
              {collapsed ? '▶' : '◀'}
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
