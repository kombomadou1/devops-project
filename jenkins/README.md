# Jenkins

Ce dossier contient la configuration pour déployer Jenkins dans le cluster k3s avec Helm.

Jenkins tourne dans le namespace `jenkins` et exécute la pipeline CI/CD du projet. La pipeline récupère le code depuis Git, installe les dépendances, lance les tests, construit les images Docker avec Kaniko, puis déploie le backend et le frontend dans Kubernetes.

L’installation s’appuie sur la documentation officielle :  
[Installing Jenkins on Kubernetes](https://www.jenkins.io/doc/book/installing/kubernetes/)

La documentation du chart Helm Jenkins est aussi disponible ici :  
[Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts)

## Préparation du cluster

Avant d’installer Jenkins avec Helm, plusieurs objets Kubernetes doivent être créés pour que Jenkins fonctionne correctement dans le cluster.

Ces objets sont définis dans deux fichiers :

- `jenkins-01-serviceAccount.yaml`
- `jenkins-02-volume.yaml`

### ServiceAccount et permissions

Le fichier `jenkins-01-serviceAccount.yaml` crée un ServiceAccount nommé `jenkins` dans le namespace `jenkins`.

Ce ServiceAccount est associé à un ClusterRole et à un ClusterRoleBinding, qui donnent à Jenkins les permissions pour créer et gérer les ressources Kubernetes utilisées pendant les builds :

- Pods et logs de pods
- Secrets
- ConfigMaps
- PersistentVolumeClaims
- Deployments et ReplicaSets

Ces permissions sont nécessaires, car Jenkins crée automatiquement des pods agents pour exécuter les pipelines.

Le fichier s’applique avec la commande suivante :

```bash
kubectl apply -f jenkins-01-serviceAccount.yaml
```

### Stockage persistant

Le fichier `jenkins-02-volume.yaml` crée une StorageClass et un PersistentVolume de 5 Go.

Ce volume permet à Jenkins de garder ses données, comme sa configuration, ses plugins et l’historique des builds, même après un redémarrage du pod.

Le PersistentVolume est associé au nœud `k3s-master`, où Jenkins est déployé.

Le fichier s’applique avec la commande suivante :

```bash
kubectl apply -f jenkins-02-volume.yaml
```

Les ressources se vérifient ensuite avec :

```bash
kubectl get pv
kubectl get sc
```

## Installation avec Helm

Une fois le namespace, le ServiceAccount et le volume créés, Jenkins s’installe avec Helm.

Ajout du dépôt Helm officiel de Jenkins :

```bash
helm repo add jenkins https://charts.jenkins.io
helm repo update
```

Création du namespace :

```bash
kubectl create namespace jenkins
```

Installation de Jenkins avec le fichier de valeurs personnalisé :

```bash
helm install jenkins jenkins/jenkins \
  --namespace jenkins \
  -f jenkins-values.yaml
```

Vérification du démarrage du pod Jenkins :

```bash
kubectl get pods -n jenkins -w
```

Vérification du service exposé :

```bash
kubectl get svc -n jenkins
```

## Configuration de Jenkins

Le fichier `jenkins-values.yaml` contient la configuration principale de Jenkins :

- Un seul controller Jenkins.
- Interface exposée via un `NodePort` sur le port `30080`.
- Données Jenkins conservées sur un volume de 5 Go.
- ServiceAccount `jenkins` créé manuellement.
- Agents Kubernetes activés pour exécuter les builds dans des pods temporaires.
- Téléchargement automatique des plugins au démarrage désactivé.

Jenkins est accessible depuis la machine hôte à l’adresse suivante :

```text
http://192.168.56.10:30080
```

Les identifiants sont à définir dans le fichier de configuration.

## Configuration pour la pipeline

Plusieurs éléments ont été configurés dans Jenkins pour que la pipeline CI/CD fonctionne.

### Plugins installés

La pipeline a besoin des plugins suivants :

- **Pipeline** : syntaxe déclarative `pipeline {}`.
- **Pipeline: Declarative** : définition des stages, agents, environnements et exécutions parallèles.
- **Pipeline: Stage View** : affichage des étapes de la pipeline.
- **Git** : récupération du code depuis un dépôt Git.
- **Credentials Binding** : utilisation de credentials dans la pipeline.
- **Kubernetes** : création de pods agents dans le cluster par Jenkins.
- **Kubernetes CLI** : utilisation d’un kubeconfig dans la pipeline avec `withKubeConfig`.

### Cloud Kubernetes

Dans **Manage Jenkins** → **Clouds**, un cloud Kubernetes est configuré pour que Jenkins puisse créer des agents temporaires dans le cluster.

Jenkins communique avec l’API Kubernetes via l’URL suivante :

```text
https://kubernetes.default
```

Les agents sont créés dans le namespace `jenkins`.

### Pod Template et agents

Un Pod Template nommé `devops-template` est défini dans Jenkins.

La pipeline l’utilise avec l’instruction suivante :

```groovy
agent {
    kubernetes {
        inheritFrom 'devops-template'
    }
}
```

Ce Pod Template contient trois conteneurs :

| Conteneur | Rôle |
|---|---|
| `node` | Installation des dépendances, tests et build des applications |
| `kaniko` | Construction et envoi des images Docker vers Docker Hub |
| `kubectl` | Déploiement des manifests Kubernetes dans le cluster |

Chaque conteneur reste actif avec la commande `sleep infinity`, pour que Jenkins puisse exécuter des commandes à l’intérieur.

### Credentials

La pipeline utilise deux credentials principaux :

- `k3s-credentials` : kubeconfig qui permet à Jenkins de déployer les applications dans le cluster k3s.
- `dockerhub-config` : Secret Kubernetes que Kaniko utilise pour s’authentifier auprès de Docker Hub.

Le token Docker Hub est créé à partir d’un access token, pas du mot de passe principal du compte.

Le Secret Docker Hub est monté dans le conteneur Kaniko au chemin suivant :

```text
/kaniko/.docker/config.json
```

## Pipeline CI/CD

La pipeline est définie dans le fichier `Jenkinsfile.complete` à la racine du projet.

Elle suit les étapes suivantes :

1. Récupération du code depuis Git.
2. Installation des dépendances du backend et du frontend.
3. Exécution des tests.
4. Build des applications.
5. Construction et push des images Docker avec Kaniko.
6. Déploiement du backend et du frontend dans le namespace `ges-asso`.
7. Mise à jour des images utilisées par les Deployments Kubernetes.

L’installation, les tests et le build du backend et du frontend s’exécutent en parallèle. Les builds Kaniko et les déploiements s’exécutent l’un après l’autre, pour faciliter le diagnostic en cas d’erreur.

## Problèmes rencontrés

### Erreurs de plugins au démarrage

Au premier démarrage, Jenkins avait des erreurs de téléchargement des plugins depuis `updates.jenkins.io`, à cause de problèmes de résolution DNS dans les pods.

Pour les éviter, le téléchargement automatique des plugins est désactivé dans le fichier de valeurs :

```yaml
controller:
  installPlugins: []
```

Jenkins démarre alors avec les plugins déjà présents dans l’image.

### Erreur `ErrImagePull`

Le pod Jenkins pouvait rester en erreur `ErrImagePull` ou `ImagePullBackOff`, car la VM n’arrivait pas à résoudre `registry-1.docker.io`.

Le problème venait de la configuration DNS de la VM, pas de l’image Jenkins. Une fois le DNS corrigé, le pod a pu récupérer l’image et démarrer normalement.

### Jenkins déployé sur le master

Jenkins a d’abord été déployé sur le worker, mais des problèmes de DNS et de communication avec l’API server rendaient le déploiement instable.

Après correction de la configuration réseau de k3s, Jenkins a été déployé sur le nœud `k3s-master`, où il est plus stable dans cet environnement à deux nœuds.

### Update Center de Jenkins

L’Update Center pouvait afficher une erreur de ce type :

```text
UnknownHostException: updates.jenkins.io
```

Dans ce cas, l’URL de l’Update Site a été passée temporairement en HTTP, puis le pod Jenkins a été redémarré. Une fois le problème réglé, l’URL est repassée en HTTPS.

Cette documentation a aidé à comprendre et résoudre le problème :  
[Jenkins Community – Back-off restarting failed container](https://community.jenkins.io/t/back-off-restarting-failed-container-imageid-or-containerid-not-generated/3809)
