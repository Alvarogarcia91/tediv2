'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getCsrfToken } from '@/lib/auth';

interface ParentSummary {
  parent: {
    id: number;
    name: string;
    email: string;
  };
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

export default function ParentPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setError(null);
        await getCsrfToken();
        const userData = await getCurrentUser();

        // Check if user has parent role or is parent
        if (!userData.is_parent && !userData.roles.includes('parent') && !userData.is_superuser) {
          setError('Este portal es de uso exclusivo para padres registrados.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${apiUrl}/api/parents/me/summary/`, {
          credentials: 'include',
        });
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('No tienes un perfil de padre asociado a esta cuenta.');
          }
          throw new Error('Error al cargar la información del resumen.');
        }
        const data = await res.json();
        setSummary(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocurrió un error al cargar el portal.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [router]);

  if (loading) {
    return (
      <main style={styles.container}>
        <p style={styles.infoText}>Cargando portal del padre...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <div style={styles.error}>{error}</div>
          <Link href="/dashboard" style={styles.backButton}>
            Volver al Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Portal de Padre</h1>
            <p style={styles.subtitle}>Resumen de familia para {summary?.parent.name}</p>
          </div>
          <Link href="/dashboard" style={styles.backButton}>
            Volver al Dashboard
          </Link>
        </div>

        {summary?.unread_notifications !== undefined && summary.unread_notifications > 0 && (
          <div style={styles.notificationAlert}>
            Tienes <strong>{summary.unread_notifications}</strong> notificaciones sin leer.{' '}
            <Link href="/notifications" style={styles.notificationLink}>
              Ver Notificaciones
            </Link>
          </div>
        )}

        {/* Sección: Mis Hijos */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Mis Hijos</h2>
          <div style={styles.childrenGrid}>
            {summary?.children && summary.children.length > 0 ? (
              summary.children.map((child) => (
                <div key={child.id} style={styles.childCard}>
                  <div style={styles.childHeader}>
                    <h3 style={styles.childName}>{child.full_name}</h3>
                    <span
                      style={
                        child.active_attendance
                          ? styles.statusBadgeIn
                          : styles.statusBadgeOut
                      }
                    >
                      {child.active_attendance ? 'Dentro' : 'Fuera'}
                    </span>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Código Único:</span>
                      <span style={styles.detailValue}>{child.unique_code}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Saldo Disponible:</span>
                      <span style={styles.detailValue}>
                        {child.available_hours.toFixed(1)} hrs ({child.available_minutes} mins)
                      </span>
                    </div>
                  </div>

                  {child.last_attendance ? (
                    <div style={styles.lastAttendanceBox}>
                      <h4 style={styles.boxTitle}>Último Movimiento</h4>
                      <p style={styles.boxText}>
                        <strong>Estado:</strong> {child.last_attendance.status === 'active' ? 'Ingresó' : child.last_attendance.status === 'completed' ? 'Completado' : 'Cancelado'}
                      </p>
                      <p style={styles.boxText}>
                        <strong>Entrada:</strong> {new Date(child.last_attendance.checked_in_at).toLocaleString()}
                      </p>
                      {child.last_attendance.checked_out_at && (
                        <p style={styles.boxText}>
                          <strong>Salida:</strong> {new Date(child.last_attendance.checked_out_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={styles.noAttendanceText}>No hay registros de asistencia previos.</p>
                  )}
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>No tienes hijos registrados en tu perfil.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '900px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  backButton: {
    textDecoration: 'none',
    backgroundColor: '#4b5563',
    color: '#ffffff',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500' as const,
  },
  infoText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  notificationAlert: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  notificationLink: {
    color: '#2563eb',
    fontWeight: '600' as const,
    textDecoration: 'underline',
  },
  section: {
    marginTop: '10px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '16px',
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '6px',
  },
  childrenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  childCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  childHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childName: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#111827',
    margin: 0,
  },
  statusBadgeIn: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  statusBadgeOut: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    fontWeight: '500' as const,
    color: '#1f2937',
  },
  lastAttendanceBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
  },
  boxTitle: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    color: '#9ca3af',
    margin: '0 0 6px 0',
  },
  boxText: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '2px 0',
  },
  noAttendanceText: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic',
    margin: 0,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '14px',
  },
};
