// Système de design de Lueur.
// Une seule source de vérité pour les couleurs et les espacements.
// Direction : digne et chaleureuse, pensée pour des femmes de 45 ans et plus.
// On évite le rose bonbon des apps de règles : ici c'est sobre, mûr, rassurant.

export const colors = {
  // Fonds et surfaces
  bg: '#FAF6F1',       // ivoire chaud, calme
  surface: '#FFFFFF',  // cartes
  line: '#ECE4DC',     // bordures très douces

  // Texte
  ink: '#2E2433',      // prune-encre, presque noir mais chaud
  inkSoft: '#736679',  // texte secondaire

  // Couleur de marque (mauve-prune, féminin sans être enfantin)
  plum: '#7A5878',
  plumDeep: '#4E3A4E',

  // Pastille d'intensité vide
  empty: '#EDE6DE',
};

// Échelle d'intensité partagée par tous les symptômes.
export const levels = ['Aucun', 'Léger', 'Modéré', 'Fort'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
};
