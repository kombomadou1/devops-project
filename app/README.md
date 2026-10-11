# Application

Ce dossier contient le code source de l’application web utilisée dans le projet DevOps. Il s’agit d’une petite application de gestion d’associations, développée avec un backend NestJS et un frontend Angular.

L’application permet notamment de créer des associations, d’ajouter des membres, de consulter la liste des associations disponibles et de gérer certaines informations liées à celles-ci. Les données sont stockées dans une base SQLite.

## Fonctionnalités

- Créer une association.
- Ajouter des membres à une association.
- Consulter la liste des associations.
- Consulter et gérer les informations d’une association.
- Gérer les minutes associées à une association.
- Gérer les utilisateurs et les rôles.
- S’authentifier afin d’accéder aux fonctionnalités de l’application.

## Compte de test

Pour se connecter à l’application, les identifiants suivants peuvent être utilisés :

```text
Nom d’utilisateur : 1
Mot de passe : 123
```

## Structure du dossier

```text
app/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── docker-compose.yaml
```

Le dossier `backend/` contient l’API NestJS, tandis que le dossier `frontend/` contient l’application Angular. Le fichier `docker-compose.yaml` permet de lancer les deux applications en local avec Docker.

## Technologies utilisées

| Partie | Technologie |
|---|---|
| Backend | NestJS, TypeScript, SQLite |
| Frontend | Angular, TypeScript |
| Conteneurisation | Docker, Docker Compose |
| Serveur frontend | Nginx |

## Lancer l’application avec Docker

Depuis le dossier `app/`, lancer le backend et le frontend :

```bash
docker compose up --build
```

Cette commande construit les images Docker et démarre les deux conteneurs.

Pour arrêter les conteneurs :

```bash
docker compose down
```

## Lancer l’application en local

### Backend

Se placer dans le dossier du backend :

```bash
cd app/backend
```

Installer les dépendances :

```bash
npm install
```

Lancer l’application en mode développement :

```bash
npm run start:dev
```

Le backend écoute sur le port `3000`.

### Frontend

Dans un autre terminal, se placer dans le dossier du frontend :

```bash
cd app/frontend
```

Installer les dépendances :

```bash
npm install
```

Lancer l’application en mode développement :

```bash
npm run start
```

Le frontend est ensuite accessible depuis le navigateur à l’adresse affichée par Angular, généralement :

```text
http://localhost:4200
```

## Tests

Les tests peuvent être lancés séparément pour le backend et le frontend.

Pour le backend :

```bash
cd app/backend
npm test
```

Pour le frontend :

```bash
cd app/frontend
npm test
```

Ces tests sont également exécutés dans la pipeline Jenkins avant la construction des images Docker.

## Build des applications

Pour construire le backend :

```bash
cd app/backend
npm run build
```

Pour construire le frontend :

```bash
cd app/frontend
npm run build
```

Les images Docker sont construites automatiquement par Kaniko dans la pipeline Jenkins, puis envoyées vers Docker Hub avant d’être déployées dans Kubernetes.

## Communication frontend/backend

Le frontend communique avec le backend à travers une URL d’API définie dans sa configuration.

En local, le backend est accessible sur :

```text
http://localhost:3000
```

Dans Kubernetes, le frontend utilise le nom du Service backend plutôt qu’une adresse IP ou `localhost` :

```text
http://back-ges-asso-service:3000
```

Le backend doit écouter sur `0.0.0.0` afin d’être accessible depuis les autres pods du cluster.
