'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to get user profile, redirecting...', err);
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  if (loading) {
    return (
      <main style={styles.container}>
        <p style={styles.infoText}>Loading user profile...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div style={styles.profileSection}>
          <h2 style={styles.welcomeText}>Bienvenido, {user?.username}</h2>
          <p style={styles.emailText}>{user?.email}</p>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Roles:</span>
            <div style={styles.badgeContainer}>
              {user?.roles.length ? (
                user.roles.map((role) => (
                  <span key={role} style={styles.badge}>
                    {role}
                  </span>
                ))
              ) : (
                <span style={styles.badgeNone}>No roles assigned</span>
              )}
            </div>
          </div>

          <div style={styles.detailsList}>
            <div style={styles.detailItem}>
              <strong>First Name:</strong> {user?.first_name || 'N/A'}
            </div>
            <div style={styles.detailItem}>
              <strong>Last Name:</strong> {user?.last_name || 'N/A'}
            </div>
            <div style={styles.detailItem}>
              <strong>Is Staff:</strong> {user?.is_staff ? 'Yes' : 'No'}
            </div>
            <div style={styles.detailItem}>
              <strong>Is Superuser:</strong> {user?.is_superuser ? 'Yes' : 'No'}
            </div>
            <div style={styles.detailItem}>
              <strong>Is Parent:</strong> {user?.is_parent ? 'Yes' : 'No'}
            </div>
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
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '500px',
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
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#111827',
    margin: 0,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  welcomeText: {
    fontSize: '20px',
    color: '#111827',
    margin: 0,
  },
  emailText: {
    color: '#4b5563',
    margin: 0,
    fontSize: '14px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
    marginBottom: '10px',
  },
  infoLabel: {
    fontWeight: '600' as const,
    color: '#374151',
    fontSize: '14px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '6px',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
  badgeNone: {
    color: '#9ca3af',
    fontSize: '12px',
  },
  detailsList: {
    backgroundColor: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: '6px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontSize: '14px',
    color: '#4b5563',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoText: {
    color: '#6b7280',
    fontSize: '16px',
  },
};
