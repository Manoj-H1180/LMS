'use client';

import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('NexusLearn client rendering error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0a0d14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>The app hit a problem</h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>Your account is still safe. Reload the page to try again. If this keeps happening, contact support with the time it occurred.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 8, padding: '10px 18px', color: '#fff', background: '#6366f1', fontWeight: 700, cursor: 'pointer' }}>Reload app</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
