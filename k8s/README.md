# Kubernetes

Ce dossier contient les manifests Kubernetes utilisés pour déployer l’application dans le cluster k3s.

L’application est composée d’un backend NestJS et d’un frontend Angular servi par Nginx. Les deux applications sont déployées dans le namespace `ges-asso` à l’aide de Deployments et de Services.

La documentation officielle de Kubernetes peut être consultée ici :  
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

Les fichiers sont séparés afin de distinguer clairement les Deployments, qui gèrent les pods de l’application, et les Services, qui permettent d’y accéder.

## Namespace

Toutes les ressources de l’application sont déployées dans le namespace `ges-asso`.

Le namespace peut être créé avec la commande suivante :

```bash
kubectl create namespace ges-asso
```

Le namespace est également déclaré dans chaque manifest afin d’éviter un déploiement accidentel dans le namespace `default`.

## Backend

Le backend est une application NestJS conteneurisée et déployée dans Kubernetes.

Le fichier `back-asso-deploy.yaml` définit le Deployment du backend. Il permet à Kubernetes de créer et de maintenir le nombre de pods souhaité pour l’application.

Le fichier `back-asso-service.yaml` crée un Service de type `NodePort` sur le port `30000`. Ce Service permet d’accéder au backend depuis l’extérieur du cluster.

L’application backend est accessible à l’adresse suivante :

```text
http://192.168.56.10:30000 ou
http://192.168.56.11:30000 (selon le noeud sur lequel il est déployé)
```

À l’intérieur du cluster, le frontend communique avec le backend via le nom DNS du Service :

```text
http://back-ges-asso-service:3000
```

Le backend doit écouter sur `0.0.0.0` et non uniquement sur `localhost`, sinon il ne sera pas accessible depuis les autres pods du cluster.

## Frontend

Le frontend est une application Angular servie par Nginx.

Le fichier `front-asso-deploy.yaml` définit le Deployment du frontend. Le fichier `front-asso-service.yaml` crée le Service associé.

Le frontend utilise le nom du Service backend pour effectuer ses requêtes API. Cette communication passe par le DNS interne de Kubernetes, et non par une adresse IP fixe.

## Déploiement manuel

Les manifests peuvent être appliqués manuellement depuis le nœud master :

```bash
kubectl -n ges-asso apply -f k8s/app/back-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/back-asso-service.yaml

kubectl -n ges-asso apply -f k8s/app/front-asso-deploy.yaml
kubectl -n ges-asso apply -f k8s/app/front-asso-service.yaml
```

Vérifier que les pods sont bien créés :

```bash
kubectl -n ges-asso get pods
```

Vérifier les Deployments :

```bash
kubectl -n ges-asso get deployments
```

Vérifier les Services et leurs endpoints :

```bash
kubectl -n ges-asso get svc
kubectl -n ges-asso get endpoints
```

## Déploiement avec Jenkins

En pratique, le déploiement est automatisé par la pipeline Jenkins définie dans `Jenkinsfile`.

Après la construction et l’envoi des images Docker avec Kaniko, Jenkins applique les manifests Kubernetes puis met à jour l’image utilisée par chaque Deployment.

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

L’utilisation d’un tag d’image basé sur le numéro de build permet de suivre facilement la version déployée et évite d’utiliser le tag `latest`.

## Mise à jour des applications

Lorsqu’une nouvelle image est poussée, Kubernetes met à jour le Deployment progressivement grâce à la stratégie `RollingUpdate`.

Pendant un déploiement, il est possible de voir temporairement deux pods pour la même application : l’ancien pod termine son arrêt pendant que le nouveau démarre.

L’état d’un déploiement peut être vérifié avec :

```bash
kubectl -n ges-asso rollout status deployment/back-ges-asso
kubectl -n ges-asso rollout status deployment/front-ges-asso
```

## Problèmes rencontrés

### Image non mise à jour

Pousser une nouvelle image vers Docker Hub ne suffit pas toujours : le Deployment peut continuer à utiliser l’ancienne version.

La commande `kubectl set image` permet de forcer la mise à jour de l’image utilisée par le Deployment. Le premier nom correspond au Deployment, tandis que le second correspond au nom exact du conteneur défini dans le manifest.

### Deux pods visibles pendant un déploiement

Pendant une mise à jour, Kubernetes peut afficher temporairement deux pods : l’ancien pod se termine pendant que le nouveau démarre. Ce comportement est normal avec une stratégie `RollingUpdate`.

### Communication frontend/backend

Le frontend doit utiliser le nom du Service backend, par exemple `back-ges-asso-service`, et non `localhost`. Dans un conteneur, `localhost` désigne le conteneur frontend lui-même et non le backend.

Une erreur `502 Host is unreachable` peut apparaître si le backend écoute uniquement sur `localhost`, si les labels du Service ne correspondent pas aux pods, ou si le DNS interne de Kubernetes ne fonctionne pas correctement.
