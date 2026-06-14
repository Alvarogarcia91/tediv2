'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_staff: boolean;
  is_superuser: boolean;
  is_parent: boolean;
}

/* ─── Icons ─────────────────────────────────────────────────────── */
const I = {
  Logo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Home: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Parent: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
};

/* ─── Sidebar ────────────────────────────────────────────────────── */
function Sidebar({ user, onLogout }: { user: UserProfile | null; onLogout: () => void }) {
  const isAdmin = user?.is_superuser || user?.is_staff || user?.roles?.some(r => ['super_admin', 'admin', 'staff'].includes(r));
  const isParent = user?.is_parent || user?.roles?.includes('parent') || user?.is_superuser;

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <I.Home />, always: true },
    { href: '/children', label: 'Niños', icon: <I.Users />, show: isAdmin },
    { href: '/attendance', label: 'Asistencia', icon: <I.Check />, show: isAdmin },
    { href: '/billing', label: 'Facturación', icon: <I.CreditCard />, show: isAdmin },
    { href: '/notifications', label: 'Notificaciones', icon: <I.Bell />, always: true },
    { href: '/parent', label: 'Portal Padres', icon: <I.Parent />, show: isParent },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ color: 'white' }}>
          <I.Logo />
        </div>
        <span className="sidebar-logo-text">TEDI</span>
      </div>

      {/* User pill */}
      <div style={{
        margin: '1rem 0.75rem 0.25rem',
        padding: '0.75rem',
        background: 'var(--tedi-elevated)',
        border: '1px solid var(--tedi-border)',
        borderRadius: 'var(--r-lg)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--tedi-grad-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.9375rem',
          fontFamily: 'var(--font-display)',
          marginBottom: '0.5rem',
        }}>
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tedi-text)', lineHeight: 1.2 }}>
          {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', marginTop: '0.125rem' }}>
          {user?.email}
        </p>
        {user?.roles?.length ? (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {user.roles.map(r => (
              <span key={r} className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{r}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="sidebar-section" style={{ flex: 1 }}>
        <p className="sidebar-section-label">Navegación</p>
        {navItems.filter(item => item.always || item.show).map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item${pathname === item.href ? ' active' : ''}`}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer logout */}
      <div className="sidebar-footer">
        <button
          id="sidebar-logout"
          onClick={onLogout}
          className="sidebar-item btn-danger"
          style={{
            width: '100%', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444', borderRadius: 'var(--r-md)',
          }}
        >
          <I.LogOut />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon, value, label, color, bg }: { icon: React.ReactNode; value: string; label: string; color: string; bg: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ─── Main dashboard page ────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => router.push('/'));
  }, [router]);

  const handleLogout = async () => {
    try { await logout(); } finally { router.push('/'); }
  };

  const isAdmin = user?.is_superuser || user?.is_staff || user?.roles?.some(r => ['super_admin', 'admin', 'staff'].includes(r));
  const isParent = user?.is_parent || user?.roles?.includes('parent') || user?.is_superuser;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tedi-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <p style={{ color: 'var(--tedi-text-2)', fontSize: '0.9375rem' }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="app-main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="topbar-title">{greeting()}, {user?.first_name || user?.username} 👋</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-primary">
              <I.Zap />
              {user?.is_superuser ? 'Super Admin' : user?.is_staff ? 'Staff' : 'Usuario'}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">

          {/* Stats grid */}
          <div className="grid-4 anim-slide-up" style={{ marginBottom: '2rem' }}>
            <StatCard icon={<I.Users />} value="—" label="Niños Registrados" color="#7C3AED" bg="rgba(124,58,237,0.12)" />
            <StatCard icon={<I.Check />} value="—" label="Asistencias Hoy" color="#06B6D4" bg="rgba(6,182,212,0.10)" />
            <StatCard icon={<I.CreditCard />} value="—" label="Pagos Pendientes" color="#10B981" bg="rgba(16,185,129,0.10)" />
            <StatCard icon={<I.Bell />} value="—" label="Notificaciones" color="#F59E0B" bg="rgba(245,158,11,0.10)" />
          </div>

          {/* User info card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Profile */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 className="t-h3" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--tedi-text)' }}>
                <I.Parent />
                Perfil de Usuario
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  ['Usuario', user?.username],
                  ['Email', user?.email],
                  ['Nombre', user?.first_name ? `${user.first_name} ${user.last_name}` : '—'],
                  ['Staff', user?.is_staff ? '✅ Sí' : '❌ No'],
                  ['Superusuario', user?.is_superuser ? '✅ Sí' : '❌ No'],
                  ['Padre/Madre', user?.is_parent ? '✅ Sí' : '❌ No'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--tedi-border)',
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--tedi-text-muted)', fontWeight: 600 }}>{lbl}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--tedi-text-2)' }}>{val}</span>
                  </div>
                ))}
                {user?.roles?.length ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--tedi-text-muted)', fontWeight: 600 }}>Roles</span>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {user.roles.map(r => <span key={r} className="badge badge-primary">{r}</span>)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 className="t-h3" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--tedi-text)' }}>
                <I.Zap />
                Accesos Rápidos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isAdmin && (
                  <>
                    <Link href="/children" id="dash-children-link" className="btn btn-secondary" style={{
                      justifyContent: 'flex-start', gap: '0.75rem',
                      borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem',
                    }}>
                      <I.Users /> Ver Lista de Niños
                    </Link>
                    <Link href="/billing" id="dash-billing-link" className="btn btn-secondary" style={{
                      justifyContent: 'flex-start', gap: '0.75rem',
                      borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem',
                    }}>
                      <I.CreditCard /> Facturación y Paquetes
                    </Link>
                    <Link href="/attendance" id="dash-attendance-link" className="btn btn-secondary" style={{
                      justifyContent: 'flex-start', gap: '0.75rem',
                      borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem',
                    }}>
                      <I.Check /> Control de Asistencia
                    </Link>
                  </>
                )}
                {isParent && (
                  <Link href="/parent" id="dash-parent-link" className="btn btn-secondary" style={{
                    justifyContent: 'flex-start', gap: '0.75rem',
                    borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem',
                  }}>
                    <I.Parent /> Portal de Padre
                  </Link>
                )}
                <Link href="/notifications" id="dash-notifications-link" className="btn btn-secondary" style={{
                  justifyContent: 'flex-start', gap: '0.75rem',
                  borderRadius: 'var(--r-lg)', padding: '0.75rem 1rem',
                }}>
                  <I.Bell /> Ver Notificaciones
                </Link>
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="card card-gradient" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', flexShrink: 0 }} className="anim-pulse-glow" />
              <span style={{ fontSize: '0.9rem', color: 'var(--tedi-text-2)' }}>
                Sistema TEDI operando correctamente
              </span>
            </div>
            <span className="badge badge-success">En línea</span>
          </div>
        </div>
      </main>
    </div>
  );
}
