import {Verdict} from '../types';

export const Colors = {
  night: '#07071A',
  ink: '#F8FAFF',
  muted: 'rgba(248,250,255,0.72)',
  glass: 'rgba(255,255,255,0.12)',
  glassBorder: 'rgba(255,255,255,0.22)',
  lime: '#A3FF12',
  cyan: '#22D3EE',
  magenta: '#F472B6',
  orange: '#FB923C',
};

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 40,
};

export const Radius = {
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const verdictTheme = (verdict: Verdict | 'LOAD') => {
  if (verdict === 'GO') {
    return {
      colors: ['#052e16', '#14532d', '#4ADE80'] as const,
      accent: '#A3FF12',
      label: 'GO',
    };
  }
  if (verdict === 'WAIT') {
    return {
      colors: ['#431407', '#9a3412', '#FB923C'] as const,
      accent: '#FDE68A',
      label: 'WAIT',
    };
  }
  if (verdict === 'STAY') {
    return {
      colors: ['#4a044e', '#86198f', '#F472B6'] as const,
      accent: '#F9A8D4',
      label: 'STAY',
    };
  }
  return {
    colors: ['#07071A', '#1e1b4b', '#7C3AED'] as const,
    accent: '#22D3EE',
    label: '…',
  };
};
