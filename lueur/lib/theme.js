// Système de design Lueur — source de vérité unique.
// Direction : sobre, chaleureuse, mûre. Pensée pour des femmes de 45 ans et plus.

export const colors = {
  bg:       '#FAF6F1',  // ivoire chaud
  surface:  '#FFFFFF',
  line:     '#ECE4DC',  // bordures douces
  ink:      '#2E2433',  // prune-encre
  inkSoft:  '#736679',  // texte secondaire
  plum:     '#7A5878',  // couleur de marque
  plumDeep: '#4E3A4E',  // titres principaux
  empty:    '#EDE6DE',  // pastilles vides
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius  = { sm: 10, md: 16, lg: 22 };
export const LEVELS  = ['Aucune', 'Légère', 'Modérée', 'Forte'];

// Mélange la couleur du symptôme avec du blanc pour obtenir 4 teintes cohérentes.
// Niveau 0 = très pâle, niveau 3 = couleur pleine.
// La même fonction est utilisée partout (home, historique, tendances).
const WHITE_MIX = [0.86, 0.58, 0.28, 0.0];
function hexToRgb(h) {
  h = h.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function rgbToHex(r,g,b) {
  const t = (x) => Math.round(x).toString(16).padStart(2,'0');
  return '#'+t(r)+t(g)+t(b);
}
export function shade(color, lvl) {
  const [r,g,b] = hexToRgb(color);
  const m = WHITE_MIX[Math.max(0, Math.min(3, lvl))];
  return rgbToHex(r*(1-m)+255*m, g*(1-m)+255*m, b*(1-m)+255*m);
}
