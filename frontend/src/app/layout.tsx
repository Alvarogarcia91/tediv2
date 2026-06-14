import React from 'react';

export const metadata = {
  title: 'TEDI',
  description: 'TEDI running bootstrap setup',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f0f2f5' }}>
        {children}
      </body>
    </html>
  );
}
