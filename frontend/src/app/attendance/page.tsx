'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, getCookie, getCsrfToken } from '@/lib/auth';

/* ── Types ─────────────────────────────────────────────────────── */
interface UserProfile { id: number; username: string; roles: string[]; is_staff: boolean; is_superuser: boolean; }
interface Child { id: number; full_name: string; is_active: boolean; }
interface AttendanceRecord {
  id: number; child: number; child_name: string;
  checked_in_at: string; checked_out_at: string | null;
  status: 'active' | 'completed' | 'cancelled';
  raw_minutes: number | null; billable_minutes: number | null;
  tolerance_minutes: number; uncovered_minutes: number; notes: string;
}
interface Settings { default_tolerance_minutes: number; }

/* ── Sidebar ────────────────────────────────────────────────────── */
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
        { href: '/dashboard',      label: 'Dashboard',      icon: '🏠' },
        { href: '/children',       label: 'Niños',          icon: '👧' },
        { href: '/attendance',     label: 'Asistencia',     icon: '✅', active: true },
        { href: '/billing',        label: 'Facturación',    icon: '💳' },
        { href: '/notifications',  label: 'Notificaciones', icon: '🔔' },
      ].map(item => (
        <Link key={item.href} href={item.href} className={`sidebar-item${item.active ? ' active' : ''}`}>
          <span>{item.icon}</span>{item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

/* ── Status badge helper ─────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'badge-cyan', completed: 'badge-success', cancelled: 'badge-danger',
  };
  const lbl: Record<string, string> = {
    active: '● En curso', completed: '✓ Completado', cancelled: '✕ Cancelado',
  };
  return <span className={`badge ${map[status] || 'badge-primary'}`}>{lbl[status] || status}</span>;
};

/* ── Main page ───────────────────────────────────────────────────── */
export default function AttendancePage() {
  const [user, setUser]           = useState<UserProfile | null>(null);
  const [children, setChildren]   = useState<Child[]>([]);
  const [records, setRecords]     = useState<AttendanceRecord[]>([]);
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [checkInNotes, setCheckInNotes]       = useState('');
  const [opNotes, setOpNotes]     = useState<Record<number, string>>({});
  const [newTolerance, setNewTolerance]       = useState('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'history' | 'settings'>('checkin');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      setError(null);
      await getCsrfToken();
      const userData = await getCurrentUser();
      setUser(userData);
      const isAdmin = userData.is_superuser || userData.is_staff || userData.roles.some((r: string) => ['super_admin','admin','staff'].includes(r));

      const recRes = await fetch(`${apiUrl}/api/attendance/records/`, { credentials: 'include' });
      if (!recRes.ok) throw new Error('No se pudieron cargar los registros de asistencia.');
      setRecords(await recRes.json());

      if (isAdmin) {
        const cRes = await fetch(`${apiUrl}/api/children/children/`, { credentials: 'include' });
        if (cRes.ok) setChildren((await cRes.json()).filter((c: Child) => c.is_active));
        const sRes = await fetch(`${apiUrl}/api/attendance/settings/`, { credentials: 'include' });
        if (sRes.ok) {
          const s = await sRes.json();
          setSettings(s);
          setNewTolerance(s.default_tolerance_minutes.toString());
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el módulo de asistencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const msg = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 5000);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) return msg('error', 'Debe seleccionar un niño.');
    try {
      await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/attendance/check-in/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        body: JSON.stringify({ child: parseInt(selectedChildId), notes: checkInNotes }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al realizar check-in.');
      msg('success', `✅ Check-in exitoso para ${data.child_name || 'el niño'}.`);
      setSelectedChildId(''); setCheckInNotes('');
      fetchData(); setActiveTab('history');
    } catch (err: any) { msg('error', err.message); }
  };

  const handleCheckOut = async (childId: number, recordId: number) => {
    try {
      await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/attendance/check-out/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        body: JSON.stringify({ child: childId, notes: opNotes[recordId] || '' }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al realizar check-out.');
      msg('success', `✅ Check-out exitoso. Duración: ${data.raw_minutes} min, Facturable: ${data.billable_minutes} min.`);
      setOpNotes(prev => ({ ...prev, [recordId]: '' }));
      fetchData();
    } catch (err: any) { msg('error', err.message); }
  };

  const handleCancel = async (childId: number, recordId: number) => {
    try {
      await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/attendance/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        body: JSON.stringify({ child: childId, notes: opNotes[recordId] || '' }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al cancelar.');
      msg('success', 'Asistencia cancelada exitosamente.');
      setOpNotes(prev => ({ ...prev, [recordId]: '' }));
      fetchData();
    } catch (err: any) { msg('error', err.message); }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const tolerance = parseInt(newTolerance);
    if (isNaN(tolerance) || tolerance < 0) return msg('error', 'La tolerancia debe ser un número ≥ 0.');
    try {
      await getCsrfToken();
      const res = await fetch(`${apiUrl}/api/attendance/settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        body: JSON.stringify({ default_tolerance_minutes: tolerance }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al actualizar configuración.');
      msg('success', '⚙️ Configuración guardada exitosamente.');
      setSettings(data);
    } catch (err: any) { msg('error', err.message); }
  };

  const isAdmin = user?.is_superuser || user?.is_staff || user?.roles?.some(r => ['super_admin','admin','staff'].includes(r));
  const activeRecords = records.filter(r => r.status === 'active');
  const completedToday = records.filter(r => {
    const d = new Date(r.checked_in_at);
    const today = new Date();
    return r.status === 'completed' && d.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="app-shell">
        <SidebarNav />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--tedi-text-2)' }}>Cargando módulo de asistencia...</p>
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
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>Módulo Operativo</p>
            <h1 className="topbar-title">Control de Asistencia</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {activeRecords.length > 0 && (
              <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                {activeRecords.length} niño{activeRecords.length > 1 ? 's' : ''} en curso
              </span>
            )}
            <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        <div className="page-content">

          {/* Notification banner */}
          {actionMsg && (
            <div className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-error'} anim-slide-up`} style={{ marginBottom: '1.5rem' }}>
              {actionMsg.text}
            </div>
          )}
          {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Quick stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', fontSize: '1.25rem' }}>🟢</div>
              <div>
                <div className="stat-value" style={{ color: '#06B6D4' }}>{activeRecords.length}</div>
                <div className="stat-label">En Centro Ahora</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', fontSize: '1.25rem' }}>✅</div>
              <div>
                <div className="stat-value">{completedToday.length}</div>
                <div className="stat-label">Completados Hoy</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', fontSize: '1.25rem' }}>📋</div>
              <div>
                <div className="stat-value">{records.length}</div>
                <div className="stat-label">Total Registros</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontSize: '1.25rem' }}>⏱</div>
              <div>
                <div className="stat-value">{settings?.default_tolerance_minutes ?? '—'}</div>
                <div className="stat-label">Min. Tolerancia</div>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          {isAdmin && (
            <div style={{
              display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
              background: 'var(--tedi-surface)', borderRadius: 'var(--r-xl)',
              padding: '0.375rem', border: '1px solid var(--tedi-border)',
              width: 'fit-content',
            }}>
              {([
                { key: 'checkin', label: '📥 Check-In' },
                { key: 'history', label: '📋 Historial' },
                { key: 'settings', label: '⚙️ Ajustes' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--r-lg)',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: activeTab === tab.key ? 'var(--tedi-grad-primary)' : 'transparent',
                    color: activeTab === tab.key ? 'white' : 'var(--tedi-text-2)',
                    boxShadow: activeTab === tab.key ? 'var(--tedi-glow)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* ── TAB: CHECK-IN ─────────────────────────── */}
          {(activeTab === 'checkin' || !isAdmin) && isAdmin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Check-In form */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 className="t-h3" style={{ marginBottom: '1.25rem', color: 'var(--tedi-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  📥 Registrar Entrada
                </h2>
                <form id="checkin-form" onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-wrap">
                    <label htmlFor="child-select" className="input-label">Seleccionar Niño</label>
                    <select
                      id="child-select"
                      value={selectedChildId}
                      onChange={e => setSelectedChildId(e.target.value)}
                      className="input"
                      style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '2rem' }}
                    >
                      <option value="">— Seleccione un niño —</option>
                      {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                  <div className="input-wrap">
                    <label htmlFor="checkin-notes" className="input-label">Notas de entrada <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                    <input
                      id="checkin-notes"
                      type="text"
                      className="input"
                      value={checkInNotes}
                      onChange={e => setCheckInNotes(e.target.value)}
                      placeholder="Ej. Lleva lonchera azul"
                    />
                  </div>
                  <button id="checkin-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }}>
                    📥 Realizar Check-In
                  </button>
                </form>
              </div>

              {/* Active records quick view */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 className="t-h3" style={{ marginBottom: '1.25rem', color: 'var(--tedi-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  🟢 Niños en el Centro
                  {activeRecords.length > 0 && (
                    <span className="badge badge-cyan" style={{ marginLeft: 'auto' }}>{activeRecords.length}</span>
                  )}
                </h2>
                {activeRecords.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--tedi-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
                    <p style={{ fontSize: '0.875rem' }}>No hay niños registrados actualmente</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {activeRecords.slice(0, 5).map(rec => (
                      <div key={rec.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        background: 'rgba(6,182,212,0.06)',
                        border: '1px solid rgba(6,182,212,0.2)',
                        borderRadius: 'var(--r-lg)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--tedi-grad-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.75rem',
                          }}>{rec.child_name?.[0]?.toUpperCase()}</div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--tedi-text)' }}>{rec.child_name}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(rec.checked_in_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {activeRecords.length > 5 && (
                      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--tedi-text-muted)' }}>
                        +{activeRecords.length - 5} más en el historial
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: HISTORY ─────────────────────────── */}
          {(activeTab === 'history' || !isAdmin) && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--tedi-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <h2 className="t-h3" style={{ color: 'var(--tedi-text)' }}>📋 Historial de Registros</h2>
                <span className="badge badge-primary">{records.length} registros</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tedi-table">
                  <thead>
                    <tr>
                      <th>Niño</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                      <th>Duración</th>
                      <th>Facturable</th>
                      <th>Sin cobertura</th>
                      {isAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? records.map(rec => (
                      <tr key={rec.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'var(--tedi-grad-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                            }}>{rec.child_name?.[0]?.toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--tedi-text)', fontSize: '0.875rem' }}>{rec.child_name}</div>
                              {rec.notes && <div style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', marginTop: 1 }}>{rec.notes}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {new Date(rec.checked_in_at).toLocaleString('es-ES')}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: rec.checked_out_at ? 'var(--tedi-text-2)' : 'var(--tedi-text-muted)' }}>
                          {rec.checked_out_at ? new Date(rec.checked_out_at).toLocaleString('es-ES') : '—'}
                        </td>
                        <td><StatusBadge status={rec.status} /></td>
                        <td>
                          {rec.raw_minutes !== null
                            ? <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--tedi-text-2)' }}>{rec.raw_minutes} min</span>
                            : <span style={{ color: 'var(--tedi-text-muted)' }}>—</span>}
                        </td>
                        <td>
                          {rec.billable_minutes !== null
                            ? <span style={{ fontFamily: 'var(--font-mono)', color: '#10B981', fontWeight: 600 }}>{rec.billable_minutes} min</span>
                            : <span style={{ color: 'var(--tedi-text-muted)' }}>—</span>}
                        </td>
                        <td>
                          {rec.uncovered_minutes > 0
                            ? <span className="badge badge-danger">{rec.uncovered_minutes} min</span>
                            : <span style={{ color: 'var(--tedi-text-muted)' }}>0</span>}
                        </td>
                        {isAdmin && (
                          <td>
                            {rec.status === 'active' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 200 }}>
                                <input
                                  type="text"
                                  className="input"
                                  style={{ fontSize: '0.8rem', padding: '0.375rem 0.625rem', height: 32 }}
                                  placeholder="Notas de salida..."
                                  value={opNotes[rec.id] || ''}
                                  onChange={e => setOpNotes(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                />
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                  <button
                                    id={`checkout-${rec.id}`}
                                    onClick={() => handleCheckOut(rec.child, rec.id)}
                                    className="btn btn-sm"
                                    style={{ flex: 1, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-md)', justifyContent: 'center' }}
                                  >
                                    📤 Salida
                                  </button>
                                  <button
                                    id={`cancel-${rec.id}`}
                                    onClick={() => handleCancel(rec.child, rec.id)}
                                    className="btn btn-sm btn-danger"
                                    style={{ borderRadius: 'var(--r-md)', justifyContent: 'center' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--tedi-text-muted)', fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--tedi-text-muted)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                          No hay registros de asistencia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: SETTINGS ─────────────────────────── */}
          {activeTab === 'settings' && isAdmin && settings && (
            <div style={{ maxWidth: 480 }}>
              <div className="card" style={{ padding: '2rem' }}>
                <h2 className="t-h3" style={{ marginBottom: '1.5rem', color: 'var(--tedi-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  ⚙️ Configuración de Asistencia
                </h2>

                <div className="card card-gradient" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏱</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tolerancia actual</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--tedi-primary-light)' }}>
                      {settings.default_tolerance_minutes} minutos
                    </div>
                  </div>
                </div>

                <form id="settings-form" onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-wrap">
                    <label htmlFor="tolerance-input" className="input-label">Minutos de Tolerancia</label>
                    <input
                      id="tolerance-input"
                      type="number"
                      className="input"
                      value={newTolerance}
                      onChange={e => setNewTolerance(e.target.value)}
                      min={0}
                      max={120}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', marginTop: '0.25rem' }}>
                      Tiempo extra permitido antes de cobrar minutos adicionales
                    </span>
                  </div>
                  <button id="settings-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }}>
                    Guardar Configuración
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
