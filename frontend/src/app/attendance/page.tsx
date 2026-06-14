'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, getCookie, getCsrfToken } from '@/lib/auth';

interface UserProfile {
  id: number;
  username: string;
  roles: string[];
  is_staff: boolean;
  is_superuser: boolean;
}

interface Child {
  id: number;
  full_name: string;
  is_active: boolean;
}

interface AttendanceRecord {
  id: number;
  child_id: number;
  child_name: string;
  checked_in_at: string;
  checked_out_at: string | null;
  status: 'active' | 'completed' | 'cancelled';
  raw_minutes: number | null;
  billable_minutes: number | null;
  tolerance_minutes: number;
  uncovered_minutes: number;
  notes: string;
}

interface Settings {
  default_tolerance_minutes: number;
}

export default function AttendancePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [checkInNotes, setCheckInNotes] = useState<string>('');
  const [operationNotes, setOperationNotes] = useState<{ [recordId: number]: string }>({});
  const [newTolerance, setNewTolerance] = useState<string>('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      setError(null);
      // Ensure CSRF cookie is present
      await getCsrfToken();
      // Get current user
      const userData = await getCurrentUser();
      setUser(userData);

      const isStaffOrAdmin =
        userData.is_superuser ||
        userData.is_staff ||
        userData.roles.some((r: string) => ['super_admin', 'admin', 'staff'].includes(r));

      // Fetch Attendance Records
      const recordsRes = await fetch(`${apiUrl}/api/attendance/records/`, {
        credentials: 'include',
      });
      if (!recordsRes.ok) throw new Error('Failed to fetch attendance records.');
      const recordsData = await recordsRes.json();
      setRecords(recordsData);

      if (isStaffOrAdmin) {
        // Fetch Children for check-in
        const childrenRes = await fetch(`${apiUrl}/api/children/children/`, {
          credentials: 'include',
        });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData.filter((c: Child) => c.is_active));
        }

        // Fetch Attendance Settings
        const settingsRes = await fetch(`${apiUrl}/api/attendance/settings/`, {
          credentials: 'include',
        });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          setNewTolerance(settingsData.default_tolerance_minutes.toString());
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading attendance module.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedChildId) {
      setActionError('Debe seleccionar un niño.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/attendance/check-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          child: parseInt(selectedChildId),
          notes: checkInNotes,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al realizar check-in.');
      }

      setActionSuccess(`Check-in exitoso para ${data.child_name || 'el niño'}.`);
      setSelectedChildId('');
      setCheckInNotes('');
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCheckOut = async (childId: number, recordId: number) => {
    setActionError(null);
    setActionSuccess(null);
    const notes = operationNotes[recordId] || '';

    try {
      const res = await fetch(`${apiUrl}/api/attendance/check-out/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          child: childId,
          notes: notes,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al realizar check-out.');
      }

      setActionSuccess(`Check-out exitoso. Duración: ${data.raw_minutes} mins, Facturable: ${data.billable_minutes} mins.`);
      setOperationNotes((prev) => ({ ...prev, [recordId]: '' }));
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCancel = async (childId: number, recordId: number) => {
    setActionError(null);
    setActionSuccess(null);
    const notes = operationNotes[recordId] || '';

    try {
      const res = await fetch(`${apiUrl}/api/attendance/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          child: childId,
          notes: notes,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al cancelar asistencia.');
      }

      setActionSuccess('Asistencia cancelada exitosamente.');
      setOperationNotes((prev) => ({ ...prev, [recordId]: '' }));
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const tolerance = parseInt(newTolerance);
    if (isNaN(tolerance) || tolerance < 0) {
      setActionError('La tolerancia debe ser un número entero mayor o igual a 0.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/attendance/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          default_tolerance_minutes: tolerance,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al actualizar configuración.');
      }

      setActionSuccess('Configuración de tolerancia actualizada exitosamente.');
      setSettings(data);
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const isStaffOrAdmin =
    user?.is_superuser ||
    user?.is_staff ||
    user?.roles.some((r) => ['super_admin', 'admin', 'staff'].includes(r));

  if (loading) {
    return (
      <main style={styles.container}>
        <p style={styles.infoText}>Cargando módulo de asistencia...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Control de Asistencia</h1>
          <Link href="/dashboard" style={styles.backButton}>
            Volver al Dashboard
          </Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {actionError && <div style={styles.error}>{actionError}</div>}
        {actionSuccess && <div style={styles.success}>{actionSuccess}</div>}

        {isStaffOrAdmin && (
          <div style={styles.dashboardGrid}>
            {/* Formulario Check-In */}
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Registrar Entrada (Check-In)</h2>
              <form onSubmit={handleCheckIn} style={styles.form}>
                <div style={styles.formGroup}>
                  <label htmlFor="child-select" style={styles.label}>Seleccionar Niño:</label>
                  <select
                    id="child-select"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">-- Seleccione --</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="checkin-notes" style={styles.label}>Notas de entrada:</label>
                  <input
                    id="checkin-notes"
                    type="text"
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="Ej. Entra con abrigo rojo"
                    style={styles.input}
                  />
                </div>
                <button type="submit" style={styles.primaryButton}>
                  Realizar Check-In
                </button>
              </form>
            </div>

            {/* Ajustes de Tolerancia */}
            {settings && (
              <div style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Ajustes de Asistencia</h2>
                <form onSubmit={handleUpdateSettings} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label htmlFor="tolerance-input" style={styles.label}>Minutos de Tolerancia:</label>
                    <input
                      id="tolerance-input"
                      type="number"
                      value={newTolerance}
                      onChange={(e) => setNewTolerance(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <button type="submit" style={styles.secondaryButton}>
                    Guardar Configuración
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tabla de Historial/Registros */}
        <div style={styles.historySection}>
          <h2 style={styles.sectionTitle}>Historial de Registros</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Niño</th>
                  <th style={styles.th}>Entrada</th>
                  <th style={styles.th}>Salida</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Tiempo (mins)</th>
                  <th style={styles.th}>Facturables</th>
                  <th style={styles.th}>No Cubiertos</th>
                  {isStaffOrAdmin && <th style={styles.th}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {records.length ? (
                  records.map((rec) => (
                    <tr key={rec.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{rec.child_name}</strong>
                        {rec.notes && <div style={styles.recordNotes}>{rec.notes}</div>}
                      </td>
                      <td style={styles.td}>
                        {new Date(rec.checked_in_at).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        {rec.checked_out_at ? new Date(rec.checked_out_at).toLocaleString() : '---'}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={
                            rec.status === 'active'
                              ? styles.badgeActive
                              : rec.status === 'completed'
                              ? styles.badgeCompleted
                              : styles.badgeCancelled
                          }
                        >
                          {rec.status === 'active' ? 'Activo' : rec.status === 'completed' ? 'Completado' : 'Cancelado'}
                        </span>
                      </td>
                      <td style={styles.td}>{rec.raw_minutes !== null ? rec.raw_minutes : '---'}</td>
                      <td style={styles.td}>{rec.billable_minutes !== null ? rec.billable_minutes : '---'}</td>
                      <td style={styles.td}>
                        {rec.uncovered_minutes > 0 ? (
                          <span style={styles.uncoveredText}>{rec.uncovered_minutes} min</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      {isStaffOrAdmin && (
                        <td style={styles.td}>
                          {rec.status === 'active' ? (
                            <div style={styles.actionColumn}>
                              <input
                                type="text"
                                placeholder="Notas de salida..."
                                value={operationNotes[rec.id] || ''}
                                onChange={(e) =>
                                  setOperationNotes((prev) => ({
                                    ...prev,
                                    [rec.id]: e.target.value,
                                  }))
                                }
                                style={styles.tableInput}
                              />
                              <div style={styles.btnRow}>
                                <button
                                  onClick={() => handleCheckOut(rec.child_id, rec.id)}
                                  style={styles.checkOutButton}
                                >
                                  Check-Out
                                </button>
                                <button
                                  onClick={() => handleCancel(rec.child_id, rec.id)}
                                  style={styles.cancelButton}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={styles.infoText}>---</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isStaffOrAdmin ? 8 : 7} style={styles.tdEmpty}>
                      No hay registros de asistencia disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '1200px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#111827',
    margin: 0,
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
  success: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  sectionCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#374151',
    margin: '0 0 16px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#4b5563',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: '#4b5563',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
  },
  historySection: {
    marginTop: '20px',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
    color: '#374151',
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: '600' as const,
    color: '#4b5563',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  tdEmpty: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#9ca3af',
  },
  recordNotes: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    whiteSpace: 'pre-wrap' as const,
  },
  badgeActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
  badgeCompleted: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
  badgeCancelled: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
  uncoveredText: {
    color: '#dc2626',
    fontWeight: '600' as const,
  },
  actionColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    minWidth: '200px',
  },
  tableInput: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '12px',
  },
  btnRow: {
    display: 'flex',
    gap: '6px',
  },
  checkOutButton: {
    flex: 1,
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600' as const,
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600' as const,
    cursor: 'pointer',
  },
};
