# Bibliothèque — Frontend Angular

Interface de gestion de bibliothèque (Angular 22) reliée au backend Spring Boot et au processus Camunda « Emprunt ».

## Pages demandées

| Page | Route | Appels backend |
|---|---|---|
| Login | `/login` | (compte local, voir ci-dessous) |
| Liste des livres | `/livres` | `GET /api/livres/list`, `POST /api/livres` |
| Détail d'un livre | `/livres/:numero` | `GET /api/livres/{n}`, `PUT`, `DELETE`, `GET /api/emprunts/list` |
| Emprunt | `/emprunt` | `POST /api/emprunts` (démarre le processus Camunda), `GET /api/membres/list`, `POST /api/membres` |
| Liste des emprunts | `/emprunts` | `GET /api/emprunts/list` |
| Finaliser un emprunt | `/finaliser` | `GET /api/emprunts/a-traiter` (tâches Camunda), `POST /api/emprunts/retour/{userTaskKey}/{processInstanceKey}` |

## Lancer

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm start          # http://localhost:4200
```

Ordre de démarrage : Camunda (c8run), puis le backend Spring Boot (port 8081), puis Angular.

## Connexion

Compte : voir `src/app/core/config.ts` (constante `COMPTE`). Il n'est pas affiché dans le formulaire.

## Configuration

- Adresse du backend : `API_URL` dans `src/app/core/config.ts`.
- Le backend doit autoriser `http://localhost:4200` (classe `CorsConfig`).
