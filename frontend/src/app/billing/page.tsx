'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface HourPackage {
  id: number;
  name: string;
  description: string;
  hours: string;
  minutes: number;
  price: string;
  is_active: boolean;
}

interface ChildHourBalance {
  id: number;
  child: number;
  child_name: string;
  available_minutes: number;
  available_hours: number;
  total_purchased_minutes: number;
  total_purchased_hours: number;
  total_consumed_minutes: number;
  total_consumed_hours: number;
  updated_at: string;
}

const SidebarShell = () => (
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
        { href: '/billing', label: 'Facturación', icon: '💳', active: true },
        { href: '/notifications', label: 'Notificaciones', icon: '🔔' },
      ].map(item => (
        <Link key={item.href} href={item.href} className={`sidebar-item${item.active ? ' active' : ''}`}>
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

export default function BillingPage() {
  const [packages, setPackages] = useState<HourPackage[]>([]);
  const [balances, setBalances] = useState<ChildHourBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    Promise.all([
      fetch(`${apiUrl}/api/billing/packages/`, { credentials: 'include' }),
      fetch(`${apiUrl}/api/billing/balances/`, { credentials: 'include' }),
    ])
      .then(async ([pkgRes, balRes]) => {
        if (!pkgRes.ok || !balRes.ok) {
          if ([401, 403].includes(pkgRes.status) || [401, 403].includes(balRes.status))
            throw new Error('Sin autorización para ver facturación.');
          throw new Error('Error al cargar datos de facturación.');
        }
        setPackages(await pkgRes.json());
        setBalances(await balRes.json());
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="app-shell">
      <SidebarShell />
      <main className="app-main">
        <div className="topbar">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>Módulo Financiero</p>
            <h1 className="topbar-title">Facturación & Paquetes</h1>
          </div>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
        </div>

        <div className="page-content">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem', justifyContent: 'center' }}>
              <div className="spinner" /><p style={{ color: 'var(--tedi-text-2)' }}>Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              {/* Stats summary */}
              <div className="grid-3">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>📦</div>
                  <div>
                    <div className="stat-value">{packages.length}</div>
                    <div className="stat-label">Paquetes de Horas</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>👧</div>
                  <div>
                    <div className="stat-value">{balances.length}</div>
                    <div className="stat-label">Balances de Niños</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.10)', color: '#06B6D4' }}>⏱</div>
                  <div>
                    <div className="stat-value">{balances.reduce((a, b) => a + b.available_hours, 0)}h</div>
                    <div className="stat-label">Horas Disponibles Total</div>
                  </div>
                </div>
              </div>

              {/* Packages table */}
              <div>
                <h2 className="t-h2" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  📦 Paquetes de Horas
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tedi-table">
                      <thead>
                        <tr>
                          <th>Nombre del Paquete</th>
                          <th>Horas / Minutos</th>
                          <th>Precio</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.length ? packages.map(pkg => (
                          <tr key={pkg.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--tedi-text)' }}>{pkg.name}</div>
                              {pkg.description && <div style={{ fontSize: '0.8rem', color: 'var(--tedi-text-muted)', marginTop: 2 }}>{pkg.description}</div>}
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--tedi-primary-light)', fontWeight: 600 }}>
                                {pkg.hours}h
                              </span>
                              <span style={{ color: 'var(--tedi-text-muted)', fontSize: '0.8125rem', marginLeft: '0.375rem' }}>
                                ({pkg.minutes} min)
                              </span>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#10B981' }}>
                                ${pkg.price}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${pkg.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {pkg.is_active ? '● Activo' : '○ Inactivo'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--tedi-text-muted)' }}>Sin paquetes registrados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Balances table */}
              <div>
                <h2 className="t-h2" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  ⏳ Balance de Horas por Niño
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="tedi-table">
                      <thead>
                        <tr>
                          <th>Niño</th>
                          <th>Disponibles</th>
                          <th>Total Comprado</th>
                          <th>Total Consumido</th>
                          <th>Actualizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balances.length ? balances.map(bal => (
                          <tr key={bal.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  background: 'var(--tedi-grad-primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontWeight: 700, fontSize: '0.75rem',
                                }}>
                                  {bal.child_name?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--tedi-text)' }}>{bal.child_name}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#06B6D4', fontSize: '1rem' }}>
                                {bal.available_hours}h
                              </span>
                              <span style={{ color: 'var(--tedi-text-muted)', fontSize: '0.8rem', marginLeft: 4 }}>({bal.available_minutes} min)</span>
                            </td>
                            <td style={{ color: 'var(--tedi-text-2)' }}>{bal.total_purchased_hours}h ({bal.total_purchased_minutes} min)</td>
                            <td style={{ color: 'var(--tedi-text-2)' }}>{bal.total_consumed_hours}h ({bal.total_consumed_minutes} min)</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--tedi-text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {new Date(bal.updated_at).toLocaleDateString('es-ES')}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--tedi-text-muted)' }}>Sin balances registrados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
