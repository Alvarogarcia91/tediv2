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

export default function BillingPage() {
  const [packages, setPackages] = useState<HourPackage[]>([]);
  const [balances, setBalances] = useState<ChildHourBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Fetch both endpoints in parallel
    Promise.all([
      fetch(`${apiUrl}/api/billing/packages/`, { credentials: 'include' }),
      fetch(`${apiUrl}/api/billing/balances/`, { credentials: 'include' })
    ])
      .then(async ([pkgRes, balRes]) => {
        if (!pkgRes.ok || !balRes.ok) {
          if (pkgRes.status === 401 || pkgRes.status === 403 || balRes.status === 401 || balRes.status === 403) {
            throw new Error('Not authorized to view billing information.');
          }
          throw new Error('Failed to fetch billing data.');
        }
        
        const pkgs = await pkgRes.json();
        const bals = await balRes.json();
        
        setPackages(pkgs);
        setBalances(bals);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching billing data:', err);
        setError(err.message || 'An error occurred.');
        setLoading(false);
      });
  }, []);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Billing Dashboard</h1>
          <Link href="/dashboard" style={styles.backButton}>
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading billing data...</p>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <div style={styles.content}>
            {/* Packages Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Hour Packages</h2>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Package Name</th>
                      <th style={styles.th}>Hours</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.length ? (
                      packages.map((pkg) => (
                        <tr key={pkg.id} style={styles.tr}>
                          <td style={styles.td}><strong>{pkg.name}</strong><br/><small style={styles.desc}>{pkg.description || 'No description'}</small></td>
                          <td style={styles.td}>{pkg.hours} hrs ({pkg.minutes} min)</td>
                          <td style={styles.td}>${pkg.price}</td>
                          <td style={styles.td}>
                            <span style={pkg.is_active ? styles.badgeActive : styles.badgeInactive}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={styles.tdEmpty}>No packages available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balances Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Child Hour Balances</h2>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Child</th>
                      <th style={styles.th}>Available Hours (Minutes)</th>
                      <th style={styles.th}>Total Purchased</th>
                      <th style={styles.th}>Total Consumed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.length ? (
                      balances.map((bal) => (
                        <tr key={bal.id} style={styles.tr}>
                          <td style={styles.td}><strong>{bal.child_name}</strong></td>
                          <td style={styles.td}>
                            <span style={styles.highlight}>{bal.available_hours} hrs</span> ({bal.available_minutes} min)
                          </td>
                          <td style={styles.td}>{bal.total_purchased_hours} hrs ({bal.total_purchased_minutes} min)</td>
                          <td style={styles.td}>{bal.total_consumed_hours} hrs ({bal.total_consumed_minutes} min)</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={styles.tdEmpty}>No child hour balances found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#111827',
    margin: 0,
  },
  desc: {
    color: '#6b7280',
    fontSize: '12px',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
    color: '#374151',
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
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
  highlight: {
    fontWeight: 'bold' as const,
    color: '#2563eb',
  },
};
