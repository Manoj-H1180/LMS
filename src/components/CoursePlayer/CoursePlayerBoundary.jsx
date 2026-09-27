'use client';

import React from 'react';

export default class CoursePlayerBoundary extends React.Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Course player rendering error:', error, info.componentStack);
    this.setState({ errorMessage: error?.message || 'Unknown rendering error' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" className="glass-panel" style={{ maxWidth: 680, margin: '48px auto', padding: 32, textAlign: 'center' }}>
          <h1 style={{ color: '#fff', marginBottom: 10 }}>This course has invalid lesson data</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>The course player encountered invalid or incomplete lesson data. Other parts of your account are still available.</p>
          {this.state.errorMessage && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, overflowWrap: 'anywhere', marginBottom: 20 }}>Details: {this.state.errorMessage}</p>}
          <button type="button" className="glow-btn" onClick={this.props.onBack}>Back to courses</button>
        </section>
      );
    }

    return this.props.children;
  }
}
