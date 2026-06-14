'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getCsrfToken } from '@/lib/auth';

interface ParentSummary {
  parent: { id: number; name: string; email: string };
  children: Array<{
    id: number;
    full_name: string;
    unique_code: string;
    available_minutes: number;
    available_hours: number;
    active_attendance: boolean;
    last_attendance: {
      id: number;
      checked_in_at: string;
      checked_out_at: string | null;
      status: string;
    } | null;
  }>;
  unread_notifications: number;
}

const SidebarNav = () => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon" style={{ color: 'white' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>
      <span className="sidebar-logo-text">TEDI</span>
    </div>
    <nav className="sidebar-section" style={{ flex: 1 }}>
      {[
        { href: '/dashboard',     label: 'Dashboard',      icon: '🏠' },
        { href: '/parent',        label: 'Mi Portal',      icon: '👨‍👩‍👧', active: true },
        { href: '/notifications', label: 'Notificaciones', icon: '🔔' },
      ].map(item => (
        <Link key={item.href} href={item.href} className={`sidebar-item${item.active ? ' active' : ''}`}>
          <span>{item.icon}</span>{item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

export default function ParentPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        await getCsrfToken();
        const userData = await getCurrentUser();
        if (!userData.is_parent && !userData.roles.includes('parent') && !userData.is_superuser) {
          setError('Este portal es exclusivo para padres registrados.');
          setLoading(false);
          return;
        }
        const res = await fetch(`${apiUrl}/api/parents/me/summary/`, { credentials: 'include' });
        if (!res.ok) throw new Error(res.status === 403 ? 'No tienes un perfil de padre asociado.' : 'Error al cargar el portal.');
        setSummary(await res.json());
      } catch (err: any) {
        setError(err.message || 'Error al cargar el portal.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [router]);

  const statusLabel = (status: string) => ({ active: 'En centro', completed: 'Completado', cancelled: 'Cancelado' }[status] || status);

  if (loading) {
    return (
      <div className="app-shell">
        <SidebarNav />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--tedi-text-2)' }}>Cargando portal de padres...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <SidebarNav />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: 420, width: '100%' }}>
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>
            <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>← Volver al Dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SidebarNav />
      <main className="app-main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>Portal Familiar</p>
            <h1 className="topbar-title">Bienvenido, {summary?.parent.name} 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {summary && summary.unread_notifications > 0 && (
              <Link href="/notifications" className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
                🔔 {summary.unread_notifications} sin leer
              </Link>
            )}
            <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        <div className="page-content">
          {/* Summary stats */}
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', fontSize: '1.25rem' }}>👧</div>
              <div>
                <div className="stat-value">{summary?.children.length ?? 0}</div>
                <div className="stat-label">Hijos Registrados</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', fontSize: '1.25rem' }}>🟢</div>
              <div>
                <div className="stat-value">{summary?.children.filter(c => c.active_attendance).length ?? 0}</div>
                <div className="stat-label">En Centro Ahora</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontSize: '1.25rem' }}>🔔</div>
              <div>
                <div className="stat-value">{summary?.unread_notifications ?? 0}</div>
                <div className="stat-label">Notif. Sin Leer</div>
              </div>
            </div>
          </div>

          {/* Children cards */}
          <h2 className="t-h2" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            👧 Mis Hijos
          </h2>

          {!summary?.children.length ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--tedi-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧</div>
              <h3 className="t-h3" style={{ color: 'var(--tedi-text-2)', marginBottom: '0.5rem' }}>Sin hijos registrados</h3>
              <p style={{ fontSize: '0.875rem' }}>No tienes hijos asociados a tu perfil todavía.</p>
            </div>
          ) : (
            <div className="grid-2">
              {summary.children.map(child => (
                <div key={child.id} className="card" style={{ padding: '1.75rem' }}>
                  {/* Child header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--tedi-grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '1.125rem',
                        flexShrink: 0,
                      }}>
                        {child.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="t-h3" style={{ color: 'var(--tedi-text)', marginBottom: '0.125rem' }}>{child.full_name}</h3>
                        <code style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                          background: 'var(--tedi-elevated)', border: '1px solid var(--tedi-border)',
                          padding: '0.15rem 0.5rem', borderRadius: 'var(--r-sm)', color: 'var(--tedi-primary-light)',
                        }}>
                          {child.unique_code}
                        </code>
                      </div>
                    </div>
                    <span className={`badge ${child.active_attendance ? 'badge-success' : 'badge-cyan'}`}
                      style={{ fontSize: '0.7rem' }}>
                      {child.active_attendance ? '🟢 En Centro' : '⚪ Fuera'}
                    </span>
                  </div>

                  {/* Balance */}
                  <div style={{
                    background: 'var(--tedi-grad-card)',
                    border: '1px solid var(--tedi-border-subtle)',
                    borderRadius: 'var(--r-lg)', padding: '1rem',
                    marginBottom: '1rem',
                  }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tedi-text-muted)', marginBottom: '0.25rem' }}>
                      Saldo de Horas Disponible
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem',
                        letterSpacing: '-0.04em',
                        background: 'var(--tedi-grad-primary)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>
                        {child.available_hours.toFixed(1)}
                      </span>
                      <span style={{ color: 'var(--tedi-text-muted)', fontSize: '0.9rem' }}>hrs</span>
                      <span style={{ color: 'var(--tedi-text-muted)', fontSize: '0.8rem' }}>
                        ({child.available_minutes} min)
                      </span>
                    </div>
                  </div>

                  {/* Last attendance */}
                  {child.last_attendance ? (
                    <div style={{
                      background: 'var(--tedi-elevated)',
                      border: '1px solid var(--tedi-border)',
                      borderRadius: 'var(--r-lg)', padding: '0.875rem',
                    }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tedi-text-muted)', marginBottom: '0.625rem' }}>
                        Último Movimiento
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {[
                          ['Estado', statusLabel(child.last_attendance.status)],
                          ['Entrada', new Date(child.last_attendance.checked_in_at).toLocaleString('es-ES')],
                          ...(child.last_attendance.checked_out_at ? [['Salida', new Date(child.last_attendance.checked_out_at).toLocaleString('es-ES')]] : []),
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--tedi-text-muted)', fontWeight: 600 }}>{label}</span>
                            <span style={{ color: 'var(--tedi-text-2)', fontFamily: label !== 'Estado' ? 'var(--font-mono)' : undefined, fontSize: label !== 'Estado' ? '0.75rem' : '0.8125rem' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--tedi-text-muted)', textAlign: 'center', padding: '0.75rem', fontStyle: 'italic' }}>
                      Sin registros de asistencia previos
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
