import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutGrid, Truck, Users, Settings, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const { adminProfile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', icon: LayoutGrid, label: 'Tableau de bord', end: true },
    { to: '/admin/vehicules', icon: Truck, label: 'Véhicules' },
    { to: '/admin/administrateurs', icon: Users, label: 'Administrateurs' },
    { to: '/admin/parametres', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div style={styles.wrap}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoCircle}>FC</div>
          <div>
            <div style={styles.brandName}>LogiFec</div>
            <div style={styles.brandSub}>FECONDE</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userBox}>
            <div style={styles.userAvatar}>{(adminProfile?.nom || '?').charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{adminProfile?.nom || 'Administrateur'}</div>
              <div style={styles.userEmail}>{adminProfile?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={15} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  wrap: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' },
  sidebar: {
    background: 'var(--navy-deep)', color: '#fff',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' },
  logoCircle: {
    width: 34, height: 34, borderRadius: '50%', background: '#1F8F5F',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 600, color: '#fff' },
  brandSub: { fontSize: 10.5, color: '#8494A3', letterSpacing: '0.06em', textTransform: 'uppercase' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px',
    borderRadius: 8, fontSize: 13.5, color: '#B9C4D0', fontWeight: 500,
    transition: 'background 0.12s, color 0.12s',
  },
  navItemActive: { background: 'rgba(31,143,95,0.18)', color: '#fff' },
  sidebarFooter: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginTop: 12 },
  userBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 12 },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#2A4A6E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, flexShrink: 0, color: '#fff',
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: 11, color: '#8494A3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
    color: '#B9C4D0', borderRadius: 8, padding: '9px 12px', fontSize: 12.5,
    cursor: 'pointer', fontWeight: 500,
  },
  main: { background: 'var(--sand)', minHeight: '100vh' },
}
