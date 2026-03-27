# Guide de contribution - Althea Systems

## Workflow Git

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Production, toujours stable |
| `features/issue-XX` | Nouvelles fonctionnalites |
| `fix/description` | Corrections de bugs |
| `chore/description` | Maintenance, config |
| `docs/description` | Documentation |

### Process

1. Creer une branche depuis `main`
2. Developper et commiter avec des messages conventionnels
3. Pusher et creer une Pull Request
4. Obtenir au moins 1 review approbatrice
5. Merger via squash merge

### Commits conventionnels

```
feat(scope): description       # Nouvelle fonctionnalite
fix(scope): description        # Correction de bug
docs(scope): description       # Documentation
chore(scope): description      # Maintenance
refactor(scope): description   # Refactoring sans changement fonctionnel
test(scope): description       # Ajout/modification de tests
style(scope): description      # Formatage, pas de changement de code
perf(scope): description       # Amelioration de performance
```

Scopes courants : `auth`, `admin`, `products`, `orders`, `cart`, `api`, `db`, `ui`, `infra`

## Setup developpement

Voir [docs/INSTALLATION.md](docs/INSTALLATION.md) pour le guide complet.

```bash
git clone https://github.com/itsaam/althea-systems.git
cd althea-systems
npm ci
# Configurer .env (voir INSTALLATION.md)
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Standards de code

### TypeScript
- Strict mode active
- Pas de `any` sauf cas justifie
- Types explicites pour les parametres de fonctions
- Interfaces dans `src/types/`

### API Routes
- Validation Zod sur chaque endpoint
- Gestion d'erreur centralisee via `withApiLogger`
- Pas de `req.body` brut -- toujours valider
- Reponses coherentes : `{ data }` ou `{ error, message }`

### Base de donnees
- Toujours utiliser Prisma (jamais de SQL brut)
- Transactions pour les operations multi-tables
- Migrations pour tout changement de schema

### Securite
- Pas de secrets dans le code (utiliser `process.env`)
- bcrypt pour le hashing (salt >= 10)
- Sessions JWT via NextAuth
- Rate limiting sur les routes sensibles

## Structure des fichiers

```
src/app/api/          # Endpoints REST (route handlers)
src/lib/              # Logique metier et services
src/lib/validators/   # Schemas Zod
src/components/       # Composants React
src/hooks/            # Custom hooks
src/stores/           # Zustand stores
src/types/            # TypeScript types
```

## Pull Requests

### Checklist

- [ ] Le code compile sans erreur (`npm run build`)
- [ ] Les tests passent (`npm run test`)
- [ ] Le linter est satisfait (`npm run lint`)
- [ ] La documentation est a jour si necessaire
- [ ] Les migrations Prisma sont incluses si le schema change
- [ ] Pas de secrets commites

### Template PR

```markdown
## Description
Breve description du changement.

## Type de changement
- [ ] Nouvelle fonctionnalite
- [ ] Correction de bug
- [ ] Refactoring
- [ ] Documentation

## Tests
Comment tester ce changement.

## Screenshots (si UI)
```

## Revue de code

### Ce qu'on verifie
- Logique metier correcte
- Validation des entrees
- Gestion d'erreur
- Performance (requetes N+1, cache)
- Securite (injection, auth, autorisation)
- Lisibilite et maintenabilite

### Conventions
- Approuver avec un commentaire constructif
- Demander des changements avec des suggestions specifiques
- Ne pas bloquer pour du style si le linter passe

## Gestion des issues

Les issues GitHub sont organisees par labels :
- `auth-infra` : Authentification et infrastructure (Samy)
- `frontend` : Interface utilisateur
- `backend` : API et logique serveur
- `bug` : Corrections
- `enhancement` : Ameliorations

Chaque issue a des criteres d'acceptation sous forme de checkboxes.
