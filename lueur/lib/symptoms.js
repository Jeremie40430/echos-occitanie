// La liste des symptômes que l'app suit.
// Chaque symptôme a une couleur sémantique : la chaleur tire vers l'argile chaud,
// le sommeil vers l'indigo, etc. Cette couleur servira aussi plus tard dans le
// calendrier (vue Historique) et les graphiques (vue Tendances).
//
// Le champ `premium` prépare le modèle freemium : à terme, les symptômes
// premium seront verrouillés derrière l'abonnement. Pour l'instant tout est
// ouvert pour qu'on puisse développer tranquillement.
//
// Les icônes viennent d'Ionicons, déjà inclus dans Expo (aucune dépendance à ajouter).

export const SYMPTOMS = [
  {
    key: 'hot_flashes',
    label: 'Bouffées de chaleur',
    icon: 'flame-outline',
    color: '#C77B5A',     // argile chaud
    premium: false,
  },
  {
    key: 'sleep',
    label: 'Sommeil',
    icon: 'moon-outline',
    color: '#5B6B8C',     // indigo doux
    premium: false,
  },
  {
    key: 'mood',
    label: 'Humeur',
    icon: 'partly-sunny-outline',
    color: '#7A5878',     // prune
    premium: false,
  },
  {
    key: 'energy',
    label: 'Énergie',
    icon: 'battery-half-outline',
    color: '#C9A24B',     // doré sourd
    premium: false,
  },
  {
    key: 'intimacy_comfort',
    label: 'Confort intime',
    icon: 'water-outline',
    color: '#B96A7E',     // rose-prune
    premium: false,
  },
  {
    key: 'libido',
    label: 'Libido',
    icon: 'heart-outline',
    color: '#A04E6B',     // magenta sourd
    premium: true,        // exemple de symptôme réservé au premium
  },
  {
    key: 'anxiety',
    label: 'Anxiété',
    icon: 'pulse-outline',
    color: '#6E8B73',     // sauge
    premium: true,
  },
];

// Petit utilitaire pour retrouver un symptôme par sa clé.
export const symptomByKey = (key) => SYMPTOMS.find((s) => s.key === key);
