'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, getCookie, getCsrfToken } from '@/lib/auth';

interface InAppNotification {
  id: number;
  event: number | null;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const typeConfig = {
  info:    { label: 'Info',    className: 'badge-primary', icon: 'ℹ️' },
  success: { label: 'Éxito',   className: 'badge-success', icon: '✅' },
  warning: { label: 'Aviso',   className: 'badge-warning', icon: '⚠️' },
  error:   { label: 'Error',   className: 'badge-danger',  icon: '❌' },
};

const SidebarShell = ({ active }: { active: string }) => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon" style={{ color: 'white' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/></svg>
      </div>
      <span className="sidebar-logo-text">TEDI</span>
    </div>
    <nav className="sidebar-section" style={{ flex: 1 }}>
      {[
        { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/children', label: 'Niños', icon: '👧' },
        { href: '/attendance', label: 'Asistencia', icon: '✅' },
        { href: '/billing', label: 'Facturación', icon: '💳' },
        { href: '/notifications', label: 'Notificaciones', icon: '🔔' },
        { href: '/parent', label: 'Portal Padres', icon: '👨‍👩‍👧' },
      ].map(item => (
        <Link key={item.href} href={item.href} className={`sidebar-item${active === item.href ? ' active' : ''}`}>
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      setError(null);
      await getCsrfToken();
      await getCurrentUser();
      const res = await fetch(`${apiUrl}/api/notifications/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar las notificaciones.');
      setNotifications(await res.json());
    } catch (err: any) {
      setError(err.message || 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: number) => {
    setActionMsg(null);
    try {
      const res = await fetch(`${apiUrl}/api/notifications/${id}/mark-read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al marcar como leída.');
      setActionMsg({ type: 'success', text: 'Notificación marcada como leída.' });
      fetchData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const markAllRead = async () => {
    setActionMsg(null);
    try {
      const res = await fetch(`${apiUrl}/api/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al marcar todas como leídas.');
      setActionMsg({ type: 'success', text: 'Todas las notificaciones marcadas como leídas.' });
      fetchData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="app-shell">
      <SidebarShell active="/notifications" />
      <main className="app-main">
        <div className="topbar">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>Centro de Mensajes</p>
            <h1 className="topbar-title">
              Notificaciones
              {unreadCount > 0 && (
                <span className="badge badge-primary" style={{ marginLeft: '0.75rem', fontSize: '0.7rem' }}>
                  {unreadCount} nuevas
                </span>
              )}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {unreadCount > 0 && (
              <button id="mark-all-read" onClick={markAllRead} className="btn btn-secondary btn-sm">
                ✓ Marcar todas como leídas
              </button>
            )}
            <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        <div className="page-content">
          {actionMsg && (
            <div className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
              {actionMsg.text}
            </div>
          )}
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem', justifyContent: 'center' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--tedi-text-2)' }}>Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <h3 className="t-h3" style={{ color: 'var(--tedi-text-2)', marginBottom: '0.5rem' }}>Sin notificaciones</h3>
              <p style={{ color: 'var(--tedi-text-muted)', fontSize: '0.9rem' }}>No tienes notificaciones en este momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(notif => {
                const cfg = typeConfig[notif.notification_type] || typeConfig.info;
                return (
                  <div
                    key={notif.id}
                    id={`notification-${notif.id}`}
                    className="card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                      flexWrap: 'wrap',
                      borderLeft: !notif.is_read ? `3px solid var(--tedi-primary)` : '3px solid transparent',
                      background: !notif.is_read ? 'rgba(124,58,237,0.05)' : 'var(--tedi-card)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${cfg.className}`}>{cfg.icon} {cfg.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)' }}>
                          {new Date(notif.created_at).toLocaleString('es-ES')}
                        </span>
                        {notif.is_read && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Leída</span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--tedi-text)', marginBottom: '0.25rem' }}>
                        {notif.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--tedi-text-2)', lineHeight: 1.55 }}>{notif.message}</p>
                    </div>
                    {!notif.is_read && (
                      <button
                        id={`mark-read-${notif.id}`}
                        onClick={() => markRead(notif.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ flexShrink: 0 }}
                      >
                        Marcar leída
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
