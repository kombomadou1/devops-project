# Kubernetes

Ce dossier contient les manifests Kubernetes pour déployer l’application dans le cluster k3s.

L’application se compose d’un backend NestJS et d’un frontend Angular servi par Nginx. Les deux sont déployés dans le namespace `ges-asso` avec des Deployments et des Services.

La documentation officielle de Kubernetes est disponible ici :  
[Kubernetes Documentation](https://kubernetes.io/docs/home/)

## Structure du dossier

```text
k8s/
└── app/
    ├── back-asso-deploy.yaml
    ├── back-asso-service.yaml
    ├── front-asso-deploy.yaml
    └── front-asso-service.yaml
```

Les fichiers sont séparés pour distinguer les Deployments, qui gèrent les pods de l’application, des Services, qui permettent d’y accéder.

## Namespace

Toutes les ressources de l’application sont déployées dans le namespace `ges-asso`.

Le namespace se crée avec la commande suivante :

```bash
kubectl create namespace ges-asso
```

Le namespace est aussi déclaré dans chaque manifest, pour éviter un déploiement accidentel dans le namespace `default`.

## Backend

Le backend est une application NestJS conteneurisée et déployée dans Kubernetes.

Le fichier `back-asso-deploy.yaml` définit le Deployment du backend. Kubernetes y trouve le nombre de pods à créer et à maintenir pour l’application.

Le fichier `back-asso-service.yaml` crée un Service de type `NodePort` sur le port `30000`, qui donne accès au backend depuis l’extérieur du cluster.

Le backend est accessible à l’adresse suivante :

```text
http://192.168.56.10:30000 ou
http://192.168.56.11:30000 (selon le noeud sur lequel il est déployé)
```

À l’intérieur du cluster, le frontend communique avec le backend via le nom DNS du Service :

```text
http://back-ges-asso-service:3000
```

Le backend doit écouter sur `0.0.0.0` et pas seulement sur `localhost`, sinon les autres pods du cluster ne peuvent pas y accéder.

## Frontend

Le frontend est une application Angular servie par Nginx.

Le fichier `front-asso-deploy.yaml` définit le Deployment du frontend, et `front-asso-service.yaml` crée le Service associé.

Le frontend utilise le nom du Service backend pour ses requêtes API. La communication passe par le DNS interne de Kubernetes, pas par une adresse IP fixe.

## Déploiement manuel

Les manifests s’appliquent manuellement depuis le nœud master :

```bash
kubectl -n ges-asso apply -f k8s/app/back-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/back-asso-service.yaml

kubectl -n ges-asso apply -f k8s/app/front-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/front-asso-service.yaml
```

Vérification de la création des pods :

```bash
kubectl -n ges-asso get pods
```

Vérification des Deployments :

```bash
kubectl -n ges-asso get deployments
```

Vérification des Services et de leurs endpoints :

```bash
kubectl -n ges-asso get svc
kubectl -n ges-asso get endpoints
```

## Déploiement avec Jenkins

En pratique, le déploiement est automatisé par la pipeline Jenkins définie dans `Jenkinsfile`.

Après la construction et l’envoi des images Docker avec Kaniko, Jenkins applique les manifests Kubernetes, puis met à jour l’image de chaque Deployment.

Pour le backend :

```bash
kubectl -n ges-asso apply -f k8s/app/back-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/back-asso-service.yaml

kubectl -n ges-asso set image deployment/back-ges-asso \
  back-ges-asso=kombomadou/back-ges-asso:build-${BUILD_NUMBER}
```

Pour le frontend :

```bash
kubectl -n ges-asso apply -f k8s/app/front-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/front-asso-service.yaml

kubectl -n ges-asso set image deployment/front-ges-asso \
  front-ges-asso=kombomadou/front-ges-asso:build-${BUILD_NUMBER}
```

Un tag d’image basé sur le numéro de build permet de suivre facilement la version déployée et évite d’utiliser le tag `latest`.

## Mise à jour des applications

Quand une nouvelle image est poussée, Kubernetes met le Deployment à jour progressivement grâce à la stratégie `RollingUpdate`.

Pendant un déploiement, deux pods de la même application peuvent apparaître temporairement : l’ancien termine son arrêt pendant que le nouveau démarre.

L’état d’un déploiement se vérifie avec :

```bash
kubectl -n ges-asso rollout status deployment/back-ges-asso
kubectl -n ges-asso rollout status deployment/front-ges-asso
```

## Problèmes rencontrés

### Image non mise à jour

Pousser une nouvelle image sur Docker Hub ne suffit pas toujours : le Deployment peut continuer à utiliser l’ancienne version.

La commande `kubectl set image` force la mise à jour de l’image du Deployment. Le premier nom est celui du Deployment, le second est le nom exact du conteneur défini dans le manifest.

### Deux pods visibles pendant un déploiement

Pendant une mise à jour, Kubernetes peut afficher temporairement deux pods : l’ancien se termine pendant que le nouveau démarre. C’est normal avec une stratégie `RollingUpdate`.

### Communication frontend/backend

Le frontend doit utiliser le nom du Service backend, par exemple `back-ges-asso-service`, et pas `localhost`. Dans un conteneur, `localhost` désigne le conteneur frontend lui-même, pas le backend.

Une erreur `502 Host is unreachable` peut apparaître si le backend écoute seulement sur `localhost`, si les labels du Service ne correspondent pas aux pods, ou si le DNS interne de Kubernetes ne fonctionne pas correctement.
