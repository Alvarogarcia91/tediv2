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

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      setError(null);
      await getCsrfToken();
      const userData = await getCurrentUser();
      setUser(userData);

      const res = await fetch(`${apiUrl}/api/notifications/`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch notifications.');
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRead = async (id: number) => {
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/api/notifications/${id}/mark-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Error al marcar la notificación como leída.');
      }

      setActionSuccess('Notificación marcada como leída.');
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/api/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Error al marcar todas las notificaciones como leídas.');
      }

      setActionSuccess('Todas las notificaciones marcadas como leídas.');
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <main style={styles.container}>
        <p style={styles.infoText}>Cargando notificaciones...</p>
      </main>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'success':
        return styles.typeSuccess;
      case 'warning':
        return styles.typeWarning;
      case 'error':
        return styles.typeError;
      default:
        return styles.typeInfo;
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Centro de Notificaciones</h1>
          <div style={styles.headerButtons}>
            {notifications.some(n => !n.is_read) && (
              <button onClick={handleMarkAllRead} style={styles.markAllButton}>
                Marcar todas como leídas
              </button>
            )}
            <Link href="/dashboard" style={styles.backButton}>
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {actionError && <div style={styles.error}>{actionError}</div>}
        {actionSuccess && <div style={styles.success}>{actionSuccess}</div>}

        <div style={styles.notificationsList}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  ...styles.notificationItem,
                  ...(notif.is_read ? styles.notificationRead : styles.notificationUnread),
                }}
              >
                <div style={styles.notificationContent}>
                  <div style={styles.notificationHeader}>
                    <span style={{ ...styles.typeBadge, ...getTypeStyle(notif.notification_type) }}>
                      {notif.notification_type.toUpperCase()}
                    </span>
                    <span style={styles.dateText}>
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 style={styles.notificationTitle}>{notif.title}</h3>
                  <p style={styles.notificationMessage}>{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    style={styles.markReadButton}
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No tienes notificaciones en este momento.</p>
          )}
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
    maxWidth: '800px',
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
  headerButtons: {
    display: 'flex',
    gap: '10px',
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
  markAllButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: 'pointer',
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
  notificationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  notificationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  notificationUnread: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
  },
  notificationRead: {
    backgroundColor: '#ffffff',
  },
  notificationContent: {
    flex: 1,
    paddingRight: '12px',
  },
  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  typeBadge: {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: '600' as const,
  },
  typeInfo: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  typeSuccess: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  typeWarning: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  typeError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  dateText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  notificationTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  notificationMessage: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
  },
  markReadButton: {
    backgroundColor: '#ffffff',
    color: '#2563eb',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500' as const,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#9ca3af',
    padding: '40px 0',
  },
};
