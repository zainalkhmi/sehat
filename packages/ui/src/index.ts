/**
 * Future Health - Shared Clinical UI Tokens & Formatting Utilities
 */

export const CLINICAL_THEME = {
  colors: {
    primary: '#0284c7', // Medical Cerulean Blue
    primaryHover: '#0369a1',
    secondary: '#0f172a', // Deep Slate
    success: '#059669', // Emerald Green (Normal Vitals)
    warning: '#d97706', // Amber (Elevated Vitals)
    danger: '#dc2626', // Critical / Alert
    info: '#2563eb',
    background: '#f8fafc', // Clinical Clean Light
    surface: '#ffffff',
    border: '#e2e8f0',
    muted: '#64748b',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

export function formatVitalValue(loincCode: string, value?: number, unit?: string): string {
  if (value === undefined || value === null) return '--';
  switch (loincCode) {
    case '8867-4': // Heart rate
      return `${Math.round(value)} bpm`;
    case '8310-5': // Temperature
      return `${value.toFixed(1)} °C`;
    case '59408-5': // SpO2
      return `${Math.round(value)} %`;
    case '2339-0': // Blood glucose
      return `${Math.round(value)} mg/dL`;
    case '55423-8': // Steps
      return `${value.toLocaleString()} steps`;
    default:
      return `${value} ${unit ?? ''}`.trim();
  }
}

export function getVitalStatus(loincCode: string, value?: number): 'normal' | 'warning' | 'critical' {
  if (value === undefined || value === null) return 'normal';
  switch (loincCode) {
    case '8867-4': // Heart rate
      if (value < 50 || value > 120) return 'critical';
      if (value < 60 || value > 100) return 'warning';
      return 'normal';
    case '8310-5': // Temperature °C
      if (value > 38.5 || value < 35.0) return 'critical';
      if (value > 37.5) return 'warning';
      return 'normal';
    case '59408-5': // SpO2 %
      if (value < 90) return 'critical';
      if (value < 95) return 'warning';
      return 'normal';
    case '2339-0': // Glucose mg/dL (fasting)
      if (value > 200 || value < 60) return 'critical';
      if (value > 125) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
}

export function getRiskLevelBadgeStyle(riskLevel: 'low' | 'moderate' | 'high' | 'critical'): {
  bg: string;
  text: string;
  label: string;
} {
  switch (riskLevel) {
    case 'low':
      return { bg: '#ecfdf5', text: '#059669', label: 'Low Risk' };
    case 'moderate':
      return { bg: '#fef3c7', text: '#d97706', label: 'Moderate Risk' };
    case 'high':
      return { bg: '#fee2e2', text: '#dc2626', label: 'High Risk' };
    case 'critical':
      return { bg: '#450a0a', text: '#fca5a5', label: 'Critical Risk' };
  }
}

