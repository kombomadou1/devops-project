# Jenkins

Ce dossier contient la configuration utilisée pour déployer Jenkins dans le cluster k3s avec Helm.

Jenkins est déployé dans le namespace `jenkins` et sert à exécuter la pipeline CI/CD du projet. La pipeline récupère le code depuis Git, installe les dépendances, lance les tests, construit les images Docker avec Kaniko, puis déploie le backend et le frontend dans Kubernetes.

La documentation officielle qui a guidé l’installation est disponible ici :  
[Installing Jenkins on Kubernetes](https://www.jenkins.io/doc/book/installing/kubernetes/)

La documentation du chart Helm Jenkins est également disponible ici :  
[Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts)

## Préparation du cluster

Avant d’installer Jenkins avec Helm, plusieurs objets Kubernetes doivent être créés afin que Jenkins puisse fonctionner correctement dans le cluster.

Ces objets sont définis dans deux fichiers :

- `jenkins-01-serviceAccount.yaml`
- `jenkins-02-volume.yaml`

### ServiceAccount et permissions

Le fichier `jenkins-01-serviceAccount.yaml` crée un ServiceAccount nommé `jenkins` dans le namespace `jenkins`.

Ce ServiceAccount est associé à un ClusterRole et à un ClusterRoleBinding. Ils donnent à Jenkins les permissions nécessaires pour créer et gérer les ressources Kubernetes utilisées pendant les builds :

- Pods et logs de pods
- Secrets
- ConfigMaps
- PersistentVolumeClaims
- Deployments et ReplicaSets

Ces permissions sont nécessaires car Jenkins crée automatiquement des pods agents pour exécuter les pipelines.

Le fichier peut être appliqué avec la commande suivante :

```bash
kubectl apply -f jenkins-01-serviceAccount.yaml
```

### Stockage persistant

Le fichier `jenkins-02-volume.yaml` crée une StorageClass et un PersistentVolume de 5 Go.

Ce volume permet à Jenkins de conserver ses données, notamment sa configuration, ses plugins et l’historique des builds, même après un redémarrage du pod.

Le PersistentVolume est associé au nœud `k3s-master`, où Jenkins est déployé.

Le fichier peut être appliqué avec la commande suivante :

```bash
kubectl apply -f jenkins-02-volume.yaml
```

Les ressources peuvent ensuite être vérifiées avec :

```bash
kubectl get pv
kubectl get sc
```

## Installation avec Helm

Après la création du namespace, du ServiceAccount et du volume, Jenkins peut être installé avec Helm.

Ajouter le dépôt Helm officiel de Jenkins :

```bash
helm repo add jenkins https://charts.jenkins.io
helm repo update
```

Créer le namespace :

```bash
kubectl create namespace jenkins
```

Installer Jenkins avec le fichier de valeurs personnalisé :

```bash
helm install jenkins jenkins/jenkins \
  --namespace jenkins \
  -f jenkins-values.yaml
```

Vérifier que le pod Jenkins est bien démarré :

```bash
kubectl get pods -n jenkins -w
```

Vérifier le service exposé :

```bash
kubectl get svc -n jenkins
```

## Configuration de Jenkins

Le fichier `jenkins-values.yaml` définit la configuration principale de Jenkins :

- Déploiement d’un seul controller Jenkins.
- Exposition de l’interface via un `NodePort` sur le port `30080`.
- Persistance des données Jenkins sur un volume de 5 Go.
- Utilisation du ServiceAccount `jenkins` créé manuellement.
- Activation des agents Kubernetes pour exécuter les builds dans des pods temporaires.
- Désactivation du téléchargement automatique des plugins au démarrage.

Jenkins est accessible depuis la machine hôte à l’adresse suivante :

```text
http://192.168.56.10:30080
```

Les identifiants définis dans le fichier de configuration sont :

```text
Utilisateur : admin
Mot de passe : admin123
```

## Configuration pour la pipeline

Plusieurs éléments ont été configurés dans Jenkins afin que la pipeline CI/CD puisse fonctionner.

### Plugins installés

Les plugins suivants sont nécessaires pour la pipeline :

- **Pipeline** : permet d’utiliser la syntaxe déclarative `pipeline {}`.
- **Pipeline: Declarative** : permet de définir les stages, agents, environnements et exécutions parallèles.
- **Pipeline: Stage View** : affiche les différentes étapes de la pipeline.
- **Git** : permet de récupérer le code depuis un dépôt Git.
- **Credentials Binding** : permet d’utiliser des credentials dans la pipeline.
- **Kubernetes** : permet à Jenkins de créer des pods agents dans le cluster.
- **Kubernetes CLI** : permet d’utiliser un kubeconfig dans la pipeline avec `withKubeConfig`.

### Cloud Kubernetes

Dans **Manage Jenkins** → **Clouds**, un cloud Kubernetes a été configuré pour permettre à Jenkins de créer des agents temporaires dans le cluster.

Jenkins utilise l’URL suivante pour communiquer avec l’API Kubernetes :

```text
https://kubernetes.default
```

Les agents sont créés dans le namespace `jenkins`.

### Pod Template et agents

Un Pod Template nommé `devops-template` a été créé dans Jenkins.

Il est utilisé dans la pipeline grâce à l’instruction suivante :

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

Chaque conteneur reste actif avec la commande `sleep infinity`, afin que Jenkins puisse exécuter des commandes à l’intérieur.

### Credentials

Deux credentials principaux sont utilisés dans la pipeline :

- `k3s-credentials` : contient un kubeconfig permettant à Jenkins de déployer les applications dans le cluster k3s.
- `dockerhub-config` : Secret Kubernetes utilisé par Kaniko pour s’authentifier auprès de Docker Hub.

Le token Docker Hub est créé à partir d’un access token, et non du mot de passe principal du compte.

Le Secret Docker Hub est monté dans le conteneur Kaniko au chemin suivant :

```text
/kaniko/.docker/config.json
```

## Pipeline CI/CD

La pipeline est définie dans le fichier `Jenkinsfile.complete` à la racine du projet.

Elle effectue les étapes suivantes :

1. Récupération du code depuis Git.
2. Installation des dépendances du backend et du frontend.
3. Exécution des tests.
4. Build des applications.
5. Construction et push des images Docker avec Kaniko.
6. Déploiement du backend et du frontend dans le namespace `ges-asso`.
7. Mise à jour des images utilisées par les Deployments Kubernetes.

Les étapes d’installation, de test et de build du backend et du frontend sont exécutées en parallèle. Les builds Kaniko et les déploiements sont exécutés séquentiellement afin de faciliter le diagnostic en cas d’erreur.

## Problèmes rencontrés

### Erreurs de plugins au démarrage

Lors du premier démarrage, Jenkins rencontrait des erreurs liées au téléchargement des plugins depuis `updates.jenkins.io`, notamment à cause de problèmes de résolution DNS dans les pods.

Pour éviter cela, le téléchargement automatique des plugins a été désactivé dans le fichier de valeurs :

```yaml
controller:
  installPlugins: []
```

Jenkins démarre alors avec les plugins déjà présents dans l’image.

### Erreur `ErrImagePull`

Le pod Jenkins pouvait rester en erreur `ErrImagePull` ou `ImagePullBackOff` car la VM ne parvenait pas à résoudre `registry-1.docker.io`.

Le problème venait de la configuration DNS de la VM, et non de l’image Jenkins elle-même. Après correction du DNS, le pod a pu récupérer l’image et démarrer correctement.

### Jenkins déployé sur le master

Jenkins a d’abord été déployé sur le worker, mais des problèmes de DNS et de communication avec l’API server ont rendu le déploiement instable.

Après avoir corrigé la configuration réseau de k3s, Jenkins a été déployé sur le nœud `k3s-master`, où il fonctionne de manière plus stable dans cet environnement à deux nœuds.

### Update Center de Jenkins

L’Update Center pouvait afficher une erreur du type :

```text
UnknownHostException: updates.jenkins.io
```

Dans ce cas, l’URL de l’Update Site a été temporairement passée en HTTP, puis le pod Jenkins a été redémarré. Une fois le problème résolu, l’URL a été remise en HTTPS.

La documentation suivante a aidé à comprendre et résoudre ce problème :  
[Jenkins Community – Back-off restarting failed container](https://community.jenkins.io/t/back-off-restarting-failed-container-imageid-or-containerid-not-generated/3809)
