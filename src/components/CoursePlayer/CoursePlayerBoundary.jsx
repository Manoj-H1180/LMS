'use client';

import React from 'react';

export default class CoursePlayerBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Course player rendering error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" className="glass-panel" style={{ maxWidth: 680, margin: '48px auto', padding: 32, textAlign: 'center' }}>
          <h1 style={{ color: '#fff', marginBottom: 10 }}>This course has invalid lesson data</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>The rest of your account is available. Return to your courses and choose another course, or re-import this course after correcting its lesson files.</p>
          <button type="button" className="glow-btn" onClick={this.props.onBack}>Back to courses</button>
        </section>
      );
    }

    return this.props.children;
  }
}
