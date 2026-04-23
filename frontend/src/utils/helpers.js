export const RISK_COLORS = {
  low: '#00ff88',
  medium: '#ffd60a',
  high: '#ff9500',
  critical: '#ff3860',
};

export const RISK_BG = {
  low: '#00ff8815',
  medium: '#ffd60a15',
  high: '#ff950015',
  critical: '#ff386015',
};

export function getRiskColor(risk) {
  return RISK_COLORS[risk] || RISK_COLORS.low;
}

export function getRiskBg(risk) {
  return RISK_BG[risk] || RISK_BG.low;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
