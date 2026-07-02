# Lueur — app de suivi ménopause

Suivi de symptômes de ménopause et santé intime. Construit avec **Expo (React
Native)**, **expo-router** pour la navigation, **SQLite local** pour la
saisie instantanée hors-ligne, et **Supabase** pour l'authentification et la
synchronisation entre appareils.

## Architecture

```
lueur/
├── app/
│   ├── _layout.js                ← initDb + AuthProvider + sync auto
│   ├── (auth)/
│   │   ├── _layout.js            ← stack d'onboarding
│   │   ├── welcome.js            ← écran d'entrée (déconnecté)
│   │   ├── create.js             ← création de compte / connexion
│   │   ├── profile-setup.js      ← formulaire profil
│   │   └── newsletter.js         ← opt-in newsletter + CGU
│   └── (tabs)/
│       ├── _layout.js            ← 3 onglets du bas
│       ├── index.js              ← Aujourd'hui (fonctionnel)
│       ├── history.js            ← Historique (à construire)
│       └── trends.js             ← Tendances (à construire)
├── components/
│   ├── SymptomCard.js            ← carte d'un symptôme + pastilles
│   └── UI.js                     ← Field, Btn, Toggle partagés
├── context/
│   └── AuthContext.js            ← session Supabase + gardes de routage
├── lib/
│   ├── db.js                     ← SQLite local (entries + profile)
│   ├── sync.js                   ← push dirty + pull remote (LWW)
│   ├── supabase.config.js        ← URL + anon key du projet Lueur
│   ├── supabaseClient.js         ← client + AsyncStorage + polyfill URL
│   ├── symptoms.js               ← liste des symptômes (couleurs, premium)
│   └── theme.js                  ← palette et espacements
├── app.json
└── package.json
```

## Stockage et confidentialité

- Saisie enregistrée **d'abord en local** (SQLite via expo-sqlite) : l'écran
  reste réactif même sans réseau.
- La couche `sync.js` pousse ensuite les entrées "dirty" vers Supabase et tire
  ce qui vient d'un autre appareil. Réconciliation last-write-wins sur
  `updated_at`.
- Toutes les tables Supabase sont protégées par RLS : chaque utilisatrice ne
  peut lire et écrire **que ses propres données**.

## Prérequis Supabase

Le projet Supabase est `Lueur-app` (référence `vbbqimpjghkgburkgdsy`).
Schéma attendu (voir migrations Supabase) :

- `public.profiles` — colonnes `id, first_name, last_name, dob, phone, zip,
  city, newsletter, created_at, updated_at`, PK = FK vers `auth.users`.
- `public.entries` — colonnes `id, user_id, day, symptom_key, intensity,
  updated_at`, unique `(user_id, day, symptom_key)`.
- Trigger `on_auth_user_created` qui insère un profil vide au signup.
- Confirmation email désactivée en Auth settings (sinon la session n'est pas
  ouverte à la fin de `signUp`, l'onboarding ne peut pas se poursuivre).

## Lancer en dev

```
cd lueur
npm install
npx expo install --fix     # cale les versions natives
npx expo start
```

Scanne le QR code avec Expo Go (Android) ou l'appareil photo (iPhone).

## Feuille de route

1. **Historique** — calendrier coloré des symptômes (élément signature).
2. **Tendances** — graphiques 1/3/6 mois + résumé médecin.
3. **Paywall RevenueCat** — verrouiller les symptômes `premium` et
   l'historique long.
4. **Polissage** — police, icône, splash, animations.
