'use client';

import dynamic from 'next/dynamic';

// Dynamically import the main LMS App with SSR disabled for flawless hydration
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0d14',
      color: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
        Loading NexusLearn LMS...
      </div>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
