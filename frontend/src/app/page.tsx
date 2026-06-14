'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [health, setHealth] = useState<{ status: string; service: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/health/`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setHealth(data))
      .catch((err) => {
        console.error('Failed to fetch health status:', err);
        setError(err.message || 'Failed to connect to backend');
      });
  }, []);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.statusDot}></span>
          <h1 style={styles.title}>TEDI running</h1>
        </div>
        <p style={styles.subtitle}>Bootstrap technical setup successfully initialized.</p>
        
        <div style={styles.statusSection}>
          <h2 style={styles.sectionTitle}>Backend Health Status</h2>
          {health ? (
            <div style={styles.healthSuccess}>
              <p><strong>Service:</strong> {health.service}</p>
              <p><strong>Status:</strong> <span style={styles.badgeSuccess}>{health.status}</span></p>
            </div>
          ) : error ? (
            <div style={styles.healthError}>
              <p>Could not reach Django API:</p>
              <code style={styles.code}>{error}</code>
            </div>
          ) : (
            <p style={styles.loading}>Connecting to backend...</p>
          )}
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Local URLs</h3>
          <ul style={styles.list}>
            <li>Frontend: <a href="http://localhost:3000" style={styles.link}>http://localhost:3000</a></li>
            <li>Backend API: <a href="http://localhost:8000/api/health/" style={styles.link}>http://localhost:8000/api/health/</a></li>
            <li>Django Admin: <a href="http://localhost:8000/admin/" style={styles.link}>http://localhost:8000/admin/</a></li>
          </ul>
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
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontSize: '24px',
    margin: 0,
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '16px',
  },
  statusSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#4b5563',
    margin: '0 0 10px 0',
  },
  healthSuccess: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#065f46',
  },
  badgeSuccess: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  healthError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#991b1b',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#fee2e2',
    padding: '2px 4px',
    borderRadius: '4px',
  },
  loading: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0,
  },
  infoSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
};
