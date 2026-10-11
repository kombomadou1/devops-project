# Application

Ce dossier contient le code source de l’application web du projet DevOps. C’est une petite application de gestion d’associations, avec un backend NestJS et un frontend Angular.

L’application permet entre autres de créer des associations, d’ajouter des membres, de consulter la liste des associations et de gérer certaines informations qui leur sont liées. Les données sont stockées dans une base SQLite.

## Fonctionnalités

- Créer une association.
- Ajouter des membres à une association.
- Consulter la liste des associations.
- Consulter et gérer les informations d’une association.
- Gérer les minutes associées à une association.
- Gérer les utilisateurs et les rôles.
- S’authentifier pour accéder aux fonctionnalités de l’application.

## Compte de test

Pour se connecter à l’application, on peut utiliser les identifiants suivants :

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

Le dossier `backend/` contient l’API NestJS et le dossier `frontend/` l’application Angular. Le fichier `docker-compose.yaml` lance les deux applications en local avec Docker.

## Technologies utilisées

| Partie | Technologie |
|---|---|
| Backend | NestJS, TypeScript, SQLite |
| Frontend | Angular, TypeScript |
| Conteneurisation | Docker, Docker Compose |
| Serveur frontend | Nginx |

## Lancer l’application avec Docker

Depuis le dossier `app/`, la commande suivante lance le backend et le frontend :

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

Aller dans le dossier du backend :

```bash
cd app/backend
```

Installation des dépendances :

```bash
npm install
```

Lancement de l’application en mode développement :

```bash
npm run start:dev
```

Le backend écoute sur le port `3000`.

### Frontend

Dans un autre terminal, aller dans le dossier du frontend :

```bash
cd app/frontend
```

Installation des dépendances :

```bash
npm install
```

Lancement de l’application en mode développement :

```bash
npm run start
```

Le frontend est ensuite accessible dans le navigateur, à l’adresse affichée par Angular, généralement :

```text
http://localhost:4200
```

## Tests

Les tests se lancent séparément pour le backend et pour le frontend.

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

Ces tests sont aussi exécutés dans la pipeline Jenkins avant la construction des images Docker.

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

Les images Docker sont construites automatiquement par Kaniko dans la pipeline Jenkins, puis envoyées sur Docker Hub avant d’être déployées dans Kubernetes.

## Communication frontend/backend

Le frontend communique avec le backend via une URL d’API définie dans sa configuration.

En local, le backend est accessible sur :

```text
http://localhost:3000
```

Dans Kubernetes, le frontend utilise le nom du Service backend plutôt qu’une adresse IP ou `localhost` :

```text
http://back-ges-asso-service:3000
```

Le backend doit écouter sur `0.0.0.0` pour être accessible depuis les autres pods du cluster.
