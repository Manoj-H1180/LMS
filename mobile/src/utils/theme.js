// ─── NexusLearn Mobile — Design Theme ─────────────────────────────────────
export const colors = {
  bg:           '#0b0d17',
  bgSecondary:  '#111827',
  bgCard:       '#151c2e',
  bgCardHover:  '#1a2340',
  border:       'rgba(99,102,241,0.18)',
  borderGlow:   'rgba(99,102,241,0.55)',

  accent:       '#6366f1',
  accentAlt:    '#a855f7',
  accentGreen:  '#10b981',
  accentAmber:  '#f59e0b',
  accentRed:    '#ef4444',
  accentBlue:   '#60a5fa',
  accentTeal:   '#06b6d4',

  textPrimary:  '#f8fafc',
  textMuted:    '#94a3b8',
  textDim:      '#475569',

  gold:         '#f59e0b',
  goldLight:    '#fbbf24',
  green:        '#34d399',
  rose:         '#f43f5e',
};

export const gradients = {
  accent:    ['#6366f1', '#a855f7'],
  green:     ['#10b981', '#059669'],
  amber:     ['#f59e0b', '#d97706'],
  blue:      ['#3b82f6', '#1d4ed8'],
  rose:      ['#f43f5e', '#be123c'],
  dark:      ['#151c2e', '#0b0d17'],
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const typography = {
  displayLg:  { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  displayMd:  { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  displaySm:  { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  bodyLg:     { fontSize: 16, fontWeight: '400', color: colors.textPrimary, lineHeight: 24 },
  bodyMd:     { fontSize: 14, fontWeight: '400', color: colors.textMuted,   lineHeight: 21 },
  bodySm:     { fontSize: 12, fontWeight: '400', color: colors.textMuted,   lineHeight: 18 },
  label:      { fontSize: 11, fontWeight: '700', color: colors.textDim,     textTransform: 'uppercase', letterSpacing: 0.8 },
  caption:    { fontSize: 10, fontWeight: '600', color: colors.textDim,     letterSpacing: 0.4 },
};

// Shared card style
export const cardStyle = {
  backgroundColor: colors.bgCard,
  borderRadius:    radius.lg,
  borderWidth:     1,
  borderColor:     colors.border,
};
