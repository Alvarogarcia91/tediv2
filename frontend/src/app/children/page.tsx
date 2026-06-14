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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/children/children/`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Not authorized to view children list.');
          }
          throw new Error('Failed to fetch children data.');
        }
        return res.json();
      })
      .then((data) => {
        setChildren(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching children:', err);
        setError(err.message || 'An error occurred.');
        setLoading(false);
      });
  }, []);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Children List</h1>
          <Link href="/dashboard" style={styles.backButton}>
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading children...</p>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Age</th>
                  <th style={styles.th}>Unique Code</th>
                  <th style={styles.th}>Active</th>
                </tr>
              </thead>
              <tbody>
                {children.length ? (
                  children.map((child) => (
                    <tr key={child.id} style={styles.tr}>
                      <td style={styles.td}>{child.full_name}</td>
                      <td style={styles.td}>{child.age}</td>
                      <td style={styles.td}>
                        <code style={styles.code}>{child.unique_code}</code>
                      </td>
                      <td style={styles.td}>
                        <span style={child.is_active ? styles.badgeActive : styles.badgeInactive}>
                          {child.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={styles.tdEmpty}>
                      No children registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
  },
  title: {
    fontSize: '22px',
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
    fontSize: '16px',
    textAlign: 'center' as const,
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
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
  },
  tdEmpty: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#9ca3af',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#111827',
    fontWeight: '600' as const,
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500' as const,
  },
};
