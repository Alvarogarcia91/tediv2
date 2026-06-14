'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  age: number;
  unique_code: string;
  is_active: boolean;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/children/children/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Sin autorización para ver esta lista.' : 'Error al cargar los datos.');
        return res.json();
      })
      .then(data => { setChildren(data); setLoading(false); })
      .catch(err => { setError(err.message || 'Error desconocido.'); setLoading(false); });
  }, []);

  const filtered = children.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.unique_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* Minimal back sidebar */}
      <aside className="sidebar" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{ color: 'white' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>
            <span className="sidebar-logo-text">TEDI</span>
          </div>
          <nav className="sidebar-section">
            <Link href="/dashboard" className="sidebar-item">
              <svg className="sidebar-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Dashboard
            </Link>
            <Link href="/children" className="sidebar-item active">
              <svg className="sidebar-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Niños
            </Link>
            <Link href="/attendance" className="sidebar-item">
              <svg className="sidebar-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Asistencia
            </Link>
            <Link href="/billing" className="sidebar-item">
              <svg className="sidebar-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Facturación
            </Link>
            <Link href="/notifications" className="sidebar-item">
              <svg className="sidebar-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Notificaciones
            </Link>
          </nav>
        </div>
      </aside>

      <main className="app-main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', fontWeight: 500 }}>Módulo de Gestión</p>
            <h1 className="topbar-title">Lista de Niños</h1>
          </div>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>

        <div className="page-content">
          {/* Search & stats bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--tedi-text-muted)' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="children-search"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {!loading && !error && (
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <span className="badge badge-primary">{filtered.length} niños</span>
                <span className="badge badge-success">{filtered.filter(c => c.is_active).length} activos</span>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem', justifyContent: 'center' }}>
              <div className="spinner" />
              <p style={{ color: 'var(--tedi-text-2)' }}>Cargando niños...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="tedi-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre Completo</th>
                      <th>Edad</th>
                      <th>Fecha Nac.</th>
                      <th>Código Único</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((child, i) => (
                        <tr key={child.id}>
                          <td style={{ color: 'var(--tedi-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{String(i + 1).padStart(2, '0')}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--tedi-grad-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '0.8125rem',
                                flexShrink: 0,
                              }}>
                                {child.first_name?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 500, color: 'var(--tedi-text)' }}>{child.full_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-cyan">{child.age} años</span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                            {new Date(child.date_of_birth).toLocaleDateString('es-ES')}
                          </td>
                          <td>
                            <code style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                              background: 'var(--tedi-elevated)',
                              border: '1px solid var(--tedi-border)',
                              padding: '0.2rem 0.5rem', borderRadius: 'var(--r-sm)',
                              color: 'var(--tedi-primary-light)',
                            }}>
                              {child.unique_code}
                            </code>
                          </td>
                          <td>
                            <span className={`badge ${child.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {child.is_active ? '● Activo' : '○ Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--tedi-text-muted)' }}>
                          {search ? 'No hay resultados para tu búsqueda' : 'No hay niños registrados'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
