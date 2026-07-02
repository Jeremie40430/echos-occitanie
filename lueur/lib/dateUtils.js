// Utilitaires de date — utilisés partout dans l'app.

export function today() {
  const d = new Date();
  return toKey(d);
}

export function toKey(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function dayNum(key) {
  return fromKey(key).getDate();
}

export function dayInitial(key) {
  return ['D','L','M','M','J','V','S'][fromKey(key).getDay()];
}

export function longDate(key) {
  const s = fromKey(key).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dateLabel(key, todayKey) {
  if (key === todayKey) return "Aujourd'hui";
  if (key === addDays(todayKey, -1)) return 'Hier';
  return longDate(key);
}

// Renvoie les N derniers jours (aujourd'hui inclus si inclToday=true).
export function lastNDays(n, todayKey, inclToday = true) {
  const days = [];
  const start = inclToday ? 0 : 1;
  for (let i = n - 1; i >= start; i--) days.push(addDays(todayKey, -i));
  return days;
}
