# Puff Tycoon

Une mini-simulation de gestion mobile, jouable directement dans le navigateur. Développez un atelier de produits aromatiques fictifs **sans nicotine** : produisez du stock, ajustez les prix, recrutez des revendeurs et atteignez vos objectifs.

## Lancer le jeu

Ouvrez `index.html` dans un navigateur, ou servez le dossier avec :

```bash
python3 -m http.server 8000
```

Puis visitez `http://localhost:8000`.

## Publication GitHub Pages

Dans **Settings → Pages**, choisissez la branche de publication et le dossier racine (`/`). Aucun outil de compilation n'est nécessaire : le jeu est une application statique.

La progression est automatiquement enregistrée dans le `localStorage` du navigateur.

## Vérifier la logique de jeu

```bash
node test-game.js
```

Ce test vérifie notamment la production, les limites de prix, les ventes sans stock,
les ventes par les revendeurs et les récompenses d'objectifs.
