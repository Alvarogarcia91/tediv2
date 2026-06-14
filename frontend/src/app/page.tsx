'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

/* ─── Icons ─────────────────────────────────────────────────────── */
const Icons = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
};

/* ─── Feature data ───────────────────────────────────────────────── */
const features = [
  {
    icon: <Icons.Users />,
    title: 'Gestión de Niños',
    desc: 'Perfiles completos, historial y seguimiento de cada niño registrado en el centro.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.12)',
  },
  {
    icon: <Icons.Chart />,
    title: 'Control de Asistencia',
    desc: 'Registro en tiempo real de entradas y salidas con reportes automáticos.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.10)',
  },
  {
    icon: <Icons.CreditCard />,
    title: 'Facturación & Paquetes',
    desc: 'Gestión de cobros, mensualidades y paquetes de servicio de forma centralizada.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
  },
  {
    icon: <Icons.Bell />,
    title: 'Notificaciones',
    desc: 'Comunicación directa con padres de familia via avisos y notificaciones.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
  },
  {
    icon: <Icons.Shield />,
    title: 'Portal de Padres',
    desc: 'Acceso especial para padres de familia para ver el progreso de sus hijos.',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.10)',
  },
  {
    icon: <Icons.Zap />,
    title: 'Reportes Avanzados',
    desc: 'Estadísticas y dashboards en tiempo real para toma de decisiones informadas.',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.10)',
  },
];

const stats = [
  { value: '500+', label: 'Niños Registrados' },
  { value: '50+', label: 'Familias Activas' },
  { value: '98%', label: 'Asistencia Promedio' },
  { value: '100%', label: 'Digital & Seguro' },
];

/* ─── LOGIN FORM COMPONENT ───────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      {error && (
        <div className="alert alert-error anim-slide-up">
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          {error}
        </div>
      )}

      <div className="input-wrap">
        <label htmlFor="login-username" className="input-label">Usuario</label>
        <input
          id="login-username"
          type="text"
          className="input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="ej. alvaro.garcia"
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div className="input-wrap">
        <label htmlFor="login-password" className="input-label">Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••"
            required
            disabled={loading}
            autoComplete="current-password"
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            id="toggle-password"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute', right: '0.875rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              color: 'var(--tedi-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: 0,
              transition: 'color var(--dur-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--tedi-primary-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--tedi-text-muted)')}
          >
            {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        </div>
      </div>

      <button
        id="login-submit"
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.25rem', justifyContent: 'center', gap: '0.625rem', height: 48 }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: 18, height: 18 }} />
            Entrando...
          </>
        ) : (
          <>
            Ingresar al Sistema
            <Icons.ArrowRight />
          </>
        )}
      </button>
    </form>
  );
}

/* ─── MAIN LANDING PAGE ──────────────────────────────────────────── */
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'login'>('login');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tedi-bg)', position: 'relative', overflow: 'hidden' }}>

      {/* ── Background glow orbs ──────────────────────── */}
      <div style={{
        position: 'fixed', top: '-10%', left: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Navbar ───────────────────────────────────── */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--tedi-border)',
        background: 'rgba(7,7,14,0.7)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--tedi-grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--tedi-glow)',
            color: 'white',
          }}>
            <Icons.Logo />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.375rem', color: 'var(--tedi-text)',
            letterSpacing: '-0.02em',
          }}>
            TEDI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {['Funciones', 'Nosotros', 'Contacto'].map(item => (
            <a key={item} href="#" style={{
              color: 'var(--tedi-text-2)', fontSize: '0.9rem', fontWeight: 500,
              transition: 'color var(--dur-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--tedi-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--tedi-text-2)')}
            >{item}</a>
          ))}
        </div>
      </nav>

      {/* ── HERO + LOGIN ─────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 5,
        display: 'grid', gridTemplateColumns: '1fr 420px',
        gap: '4rem', alignItems: 'center',
        maxWidth: 1200, margin: '0 auto',
        padding: '4rem 2.5rem 5rem',
        minHeight: 'calc(100vh - 80px)',
      }}>

        {/* Left — Hero Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="anim-slide-up">
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              <Icons.Zap />
              Sistema de Gestión Infantil
            </span>
          </div>

          <h1 className="t-hero anim-slide-up delay-1">
            La plataforma que
            {' '}
            <span className="grad-text">transforma</span>
            {' '}
            la gestión de tu centro
          </h1>

          <p className="anim-slide-up delay-2" style={{
            fontSize: '1.125rem', color: 'var(--tedi-text-2)',
            lineHeight: 1.7, maxWidth: 520,
          }}>
            TEDI digitaliza la administración de centros de desarrollo infantil: asistencia,
            facturación, comunicación con padres y más — todo en un solo lugar.
          </p>

          {/* Stats row */}
          <div className="anim-slide-up delay-3" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem', paddingTop: '0.5rem',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: 'var(--tedi-card)',
                border: '1px solid var(--tedi-border)',
                borderRadius: 'var(--r-lg)',
                padding: '0.875rem 1rem',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1.5rem', letterSpacing: '-0.04em',
                  background: 'var(--tedi-grad-primary)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="anim-slide-up delay-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {['Control de Asistencia', 'Facturación Digital', 'Portal de Padres', 'Reportes en Tiempo Real'].map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'var(--tedi-elevated)',
                border: '1px solid var(--tedi-border)',
                borderRadius: 'var(--r-full)',
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem', color: 'var(--tedi-text-2)',
              }}>
                <span style={{ color: '#10B981' }}><Icons.Check /></span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login Card */}
        <div className="anim-slide-up delay-2" style={{
          background: 'var(--tedi-card)',
          border: '1px solid var(--tedi-border-subtle)',
          borderRadius: 'var(--r-2xl)',
          padding: '2.25rem',
          boxShadow: 'var(--tedi-shadow-lg), var(--tedi-glow)',
          position: 'relative',
        }}>
          {/* Card glow top border */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, var(--tedi-primary), var(--tedi-secondary), transparent)',
            borderRadius: 1,
          }} />

          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--tedi-grad-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--tedi-glow)',
              color: 'white',
            }}>
              <Icons.Logo />
            </div>
            <h2 className="t-h2" style={{ color: 'var(--tedi-text)', marginBottom: '0.375rem' }}>
              Bienvenido a TEDI
            </h2>
            <p style={{ color: 'var(--tedi-text-muted)', fontSize: '0.875rem' }}>
              Inicia sesión para acceder al sistema
            </p>
          </div>

          <LoginForm />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div className="divider" />
            <span style={{ fontSize: '0.75rem', color: 'var(--tedi-text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
              ¿Primera vez?
            </span>
            <div className="divider" />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--tedi-text-muted)' }}>
            Contacta al administrador para obtener acceso al sistema.
          </p>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────── */}
      <section id="funciones" style={{
        position: 'relative', zIndex: 5,
        background: 'var(--tedi-surface)',
        borderTop: '1px solid var(--tedi-border)',
        padding: '5rem 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Módulos del Sistema</p>
            <h2 className="t-h1">
              Todo lo que necesitas,{' '}
              <span className="grad-text">en un solo lugar</span>
            </h2>
            <p style={{
              color: 'var(--tedi-text-2)', marginTop: '1rem',
              fontSize: '1.0625rem', maxWidth: 540, margin: '1rem auto 0',
            }}>
              Módulos especializados diseñados para la operación diaria de centros de desarrollo infantil.
            </p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{
                padding: '1.75rem',
                background: 'var(--tedi-card)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
              }}>
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--r-lg)',
                  background: f.bg,
                  color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="t-h3" style={{ color: 'var(--tedi-text)', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--tedi-text-2)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 5,
        borderTop: '1px solid var(--tedi-border)',
        background: 'var(--tedi-bg)',
        padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--tedi-grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            <Icons.Logo />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--tedi-text)' }}>
            TEDI
          </span>
        </div>
        <p style={{ color: 'var(--tedi-text-muted)', fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} TEDI — Sistema de Gestión Infantil · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
