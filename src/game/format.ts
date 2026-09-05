const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function formatNumber(n: number, forceDecimals = false): string {
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + formatNumber(-n, forceDecimals);
  if (n < 1000) {
    if (forceDecimals) return n.toFixed(1);
    return Math.floor(n).toLocaleString("en-US");
  }
  let tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIXES.length) tier = SUFFIXES.length - 1;
  const scaled = n / Math.pow(10, tier * 3);
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return scaled.toFixed(digits) + SUFFIXES[tier];
}

export function formatAps(n: number): string {
  if (n < 10 && n > 0) return n.toFixed(1);
  return formatNumber(n);
}

export function formatTime(totalSeconds: number): string {
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
