// Symptômes de ménopause, regroupés par thème.
// Tous formulés comme des GÊNES : plus le niveau est élevé, plus ça va mal.
// Cohérence home ↔ historique ↔ tendances garantie.

export const GROUPS = [
  {
    title: 'Le corps',
    items: [
      { key: 'hot_flashes',   label: 'Bouffées de chaleur', icon: 'flame-outline',        color: '#C77B5A' },
      { key: 'sleep_trouble', label: 'Troubles du sommeil', icon: 'moon-outline',          color: '#5B6B8C' },
      { key: 'fatigue',       label: 'Fatigue',             icon: 'battery-half-outline',  color: '#C9A24B' },
    ],
  },
  {
    title: 'La tête et les émotions',
    items: [
      { key: 'mood_swings',   label: "Sautes d'humeur",    icon: 'partly-sunny-outline',  color: '#7A5878' },
      { key: 'anxiety',       label: 'Anxiété',            icon: 'pulse-outline',         color: '#6E8B73' },
      { key: 'brain_fog',     label: 'Brouillard mental',  icon: 'cloud-outline',         color: '#7E8AA2' },
    ],
  },
  {
    title: "L'intime",
    items: [
      { key: 'dryness',       label: 'Sécheresse intime',  icon: 'water-outline',         color: '#B96A7E' },
      { key: 'low_libido',    label: 'Baisse de libido',   icon: 'heart-outline',         color: '#A04E6B' },
    ],
  },
];

// Liste à plat pour les boucles.
export const ALL_SYMPTOMS = GROUPS.flatMap(g => g.items);
