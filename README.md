# Projet DevOps

Ce projet consiste à mettre en place une plateforme DevOps locale complète, dans le but de mettre en pratique les compétences essentielles du domaine : provisionnement de machines virtuelles, déploiement d’un cluster Kubernetes, automatisation avec Ansible, intégration et déploiement continus avec Jenkins, ainsi que supervision avec Prometheus et Grafana.

L’environnement repose sur deux machines virtuelles Debian, sur lesquelles est déployé un cluster k3s. Une application web Angular/NestJS y est conteneurisée et déployée, tandis que Jenkins automatise la construction et la publication des images Docker. La supervision du cluster et des workloads est assurée par la stack `kube-prometheus-stack`.

## Objectifs du projet

- Créer un environnement local reproductible avec Vagrant et VirtualBox.
- Déployer un cluster Kubernetes léger avec k3s, composé d’un nœud control-plane et d’un nœud worker.
- Conteneuriser une application Angular/NestJS avec Docker.
- Mettre en place un pipeline CI/CD avec Jenkins et Kaniko.
- Automatiser l’installation et la configuration de l’infrastructure avec Ansible.
- Superviser le cluster, les nœuds et les pods avec Prometheus et Grafana.
- Documenter les problèmes rencontrés et les solutions mises en place.

## Architecture

```text
Machine hôte Windows
        |
        | Vagrant + VirtualBox
        |
+---------------------+        +---------------------+
|     k3s-master      |        |     k3s-worker      |
|  192.168.56.10      |        |  192.168.56.11      |
|---------------------|        |---------------------|
|  k3s server         |<------>|  k3s agent          |
|  Control plane      |        |  Worker node        |
|  Jenkins            |        |                     |
|  Prometheus         |        |                     |
|  Grafana            |        |                     |
+---------------------+        +---------------------+
```

Les deux VMs utilisent un réseau NAT pour accéder à Internet et un réseau privé Host-Only pour communiquer entre elles ainsi qu’avec la machine hôte. Le nœud `k3s-master` héberge le control plane k3s ainsi que les composants de CI/CD et de monitoring, tandis que `k3s-worker` sert de nœud d’exécution pour les workloads.

## Stack technique

| Outil | Rôle dans le projet |
|---|---|
| VirtualBox | Virtualisation des machines virtuelles |
| Vagrant | Provisionnement et gestion des VMs Debian |
| Debian | Système d’exploitation des nœuds |
| k3s | Distribution Kubernetes légère |
| kubectl | Administration du cluster Kubernetes |
| Helm | Déploiement de Jenkins et du monitoring |
| Docker | Conteneurisation de l’application |
| Kaniko | Construction des images Docker dans Kubernetes |
| Jenkins | Automatisation des pipelines CI/CD |
| Ansible | Automatisation de la configuration et du déploiement |
| Prometheus | Collecte et stockage des métriques |
| Grafana | Visualisation des métriques |
| Angular / NestJS | Application web frontend et backend |

## Structure du dépôt

```text
.
├── app/                  # Application Angular (frontend) et NestJS (backend)
├── infra/                # Vagrantfile et configuration des VMs
├── k8s/                  # Manifests Kubernetes et fichiers Helm
│   ├── app/              # Deployments et Services de l’application
│   ├── jenkins/          # Configuration Jenkins
│   └── monitoring/       # Configuration Prometheus et Grafana
├── jenkins/              # Documentation liée à Jenkins
├── ansible/              # Inventaire, playbooks et rôles Ansible
├── monitoring/           # Dashboards Grafana et captures d’écran
├── Jenkinsfile           # Pipeline Jenkins principal
├── Jenkinsfile.complete  # Pipeline Jenkins principal (avec le manifest des agent mis en évidence)
├── Jenkinsfile.backend   # Pipeline du backend NestJS
├── Jenkinsfile.frontend  # Pipeline du frontend Angular
└── README.md
```

## Prérequis

Avant de démarrer le projet, il faut disposer des éléments suivants :

- Windows 10/11 comme machine hôte
- VirtualBox
- Vagrant
- Un terminal avec OpenSSH
- WSL pour l’utilisation d’Ansible comme nœud de contrôle (ou d'une troisième vm linux)
- kubectl et Helm pour administrer le cluster
- Un compte Docker Hub pour la publication des images

Les VMs sont configurées avec les adresses suivantes :

```text
k3s-master : 192.168.56.10
k3s-worker : 192.168.56.11
```

## Mise en place de l’infrastructure

Les machines virtuelles sont définies dans le dossier `infra/` à l’aide d’un `Vagrantfile`. Initialement configurées avec 2 Go de RAM et 2 vCPU, leurs ressources ont ensuite été ajustées : le nœud master dispose désormais de 4 Go de RAM et 5 vCPU afin de supporter Jenkins, Prometheus et Grafana dans le cluster k3s.

```bash
cd infra
vagrant up
vagrant ssh k3s-master
vagrant ssh k3s-worker
```

L’accès SSH recommandé se fait via Vagrant, car celui-ci utilise automatiquement les clés générées pour chaque machine :

```bash
vagrant ssh k3s-master
vagrant ssh k3s-worker
```

## Déploiement du cluster k3s

Le control plane est installé sur `k3s-master`, en forçant l’utilisation de l’adresse du réseau privé :

```bash
curl -sfL https://get.k3s.io | \
  sh -s - server \
  --node-ip 192.168.56.10 \
  --advertise-address 192.168.56.10
```

Le token du cluster est ensuite récupéré sur le master afin de permettre au worker de rejoindre le cluster :

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Sur `k3s-worker`, l’agent k3s est installé avec l’adresse du serveur, le token et l’IP privée du worker :

```bash
curl -sfL https://get.k3s.io | \
  K3S_URL=https://192.168.56.10:6443 \
  K3S_TOKEN=<TOKEN> \
  sh -s - agent
```

La bonne configuration du réseau est essentielle dans ce projet. Sans l’option `--node-ip`, k3s peut utiliser l’adresse NAT VirtualBox `10.0.2.15`, identique sur les deux VMs, ce qui empêche la communication correcte entre les nœuds.

Vérification du cluster :

```bash
kubectl get nodes -o wide
```

Résultat attendu :

```text
NAME          STATUS   ROLES                  INTERNAL-IP
k3s-master    Ready    control-plane,master   192.168.56.10
k3s-worker    Ready    <none>                 192.168.56.11
```

## Déploiement de l’application

L’application est composée d’un frontend Angular et d’un backend NestJS. Chaque partie possède son propre `Dockerfile`, ce qui permet de construire des images distinctes.

Les manifests Kubernetes correspondants se trouvent dans `k8s/app/` :

```text
k8s/app/
├── back-asso-deploy.yaml
├── back-asso-service.yaml
├── front-asso-deploy.yaml
└── front-asso-service.yaml
```

Ils permettent de déployer les pods, d’exposer les services et de rendre l’application accessible depuis le cluster.

## Pipeline CI/CD avec Jenkins

Jenkins est déployé dans le cluster Kubernetes à l’aide du chart Helm officiel. Il est exposé via un `NodePort` afin d’être accessible depuis la machine hôte :

```text
http://192.168.56.10:30080
```

La configuration personnalisée de Jenkins comprend notamment :

- Un namespace dédié `jenkins`
- Un `ServiceAccount` et des règles RBAC pour interagir avec le cluster
- Un volume persistant pour conserver les données Jenkins
- Une exposition en `NodePort` sur le port `30080`
- L’utilisation d’agents Kubernetes pour exécuter les builds

Les pipelines Jenkins sont définis sous forme de `Jenkinsfile` :

- `Jenkinsfile.backend` pour la construction du backend NestJS
- `Jenkinsfile.frontend` pour la construction du frontend Angular
- `Jenkinsfile.complete` pour une chaîne complète de build et de déploiement

Les images sont construites dans le cluster avec Kaniko, ce qui évite d’avoir à exposer le Docker daemon de la VM ou à installer Docker directement dans les agents Jenkins. Les images produites sont ensuite publiées sur Docker Hub.

## Supervision avec Prometheus et Grafana

La supervision est déployée avec le chart Helm `kube-prometheus-stack`. Ce chart installe notamment Prometheus, Grafana, Alertmanager, `kube-state-metrics` et Node Exporter.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --f k8s/monitoring/prometheus-grafana-values.yaml
```

Grafana est exposé via un `NodePort` :

```text
http://192.168.56.10:30030
```

Les dashboards par défaut permettent de superviser :

- L’état global du cluster
- La consommation CPU et mémoire des nœuds
- Les ressources utilisées par les pods et les namespaces
- Les métriques système collectées par Node Exporter

Prometheus peut être consulté temporairement avec un port-forward :

```bash
kubectl port-forward \
  --address 0.0.0.0 \
  -n monitoring \
  svc/prometheus-kube-prometheus-prometheus \
  9090:9090
```

Puis en ouvrant :

```text
http://192.168.56.10:9090
```

## Automatisation avec Ansible

Ansible est utilisé depuis WSL comme nœud de contrôle. Il se connecte aux deux VMs en SSH afin d’automatiser leur préparation, l’installation de k3s, l’installation de Helm et le déploiement des composants.

L’organisation retenue sépare clairement l’inventaire, les variables, les playbooks et les rôles :

```text
ansible/
├── ansible.cfg
├── inventories/
│   └── local/
├── playbooks/
│   └── site.yml
└── roles/
    ├── common/
    ├── k3s_prerequisites/
    ├── k3s_server/
    ├── k3s_agent/
    ├── helm/
    ├── jenkins/
    ├── monitoring/
    └── cluster_validation/
```

Le playbook principal est `ansible/playbooks/site.yml`. Il applique les rôles dans l’ordre suivant :

```text
common
→ k3s_prerequisites
→ k3s_server
→ k3s_agent
→ helm
→ jenkins
→ monitoring
→ cluster_validation
```

Les secrets sensibles, comme le token k3s ou les identifiants Docker Hub, sont prévus dans un fichier chiffré avec Ansible Vault et ne doivent jamais être versionnés en clair.

Exécution du playbook :

```bash
cd ansible
ansible-playbook playbooks/site.yml
```

Vérification de la connectivité :

```bash
ansible all -m ansible.builtin.ping
```

## Problèmes rencontrés

Plusieurs problèmes ont été rencontrés au cours du projet, notamment liés au réseau, au DNS et à la gestion des ressources Kubernetes.

### Adresses IP identiques sur les nœuds

Les deux VMs utilisaient initialement l’adresse NAT `10.0.2.15`. Cette adresse étant identique sur les deux machines, le control plane ne pouvait pas joindre correctement le kubelet du worker.

La solution a consisté à forcer les IP du réseau privé avec `--node-ip` sur le master et `node-ip` dans la configuration de l’agent sur le worker.

### Résolution DNS défaillante

Les pods rencontraient des erreurs `ErrImagePull` ou `ImagePullBackOff`, car ils ne parvenaient pas à résoudre `registry-1.docker.io`. Le problème venait de la configuration DNS des VMs, et non des images elles-mêmes.

La correction a consisté à utiliser des serveurs DNS publics, puis à vérifier la résolution depuis un pod :

```bash
kubectl run test-net \
  --image=busybox \
  --rm -it \
  --restart=Never \
  -- nslookup registry-1.docker.io
```

### CoreDNS et monitoring

Grafana ne parvenait pas à joindre le service Prometheus à cause d’un blocage du plugin Kubernetes de CoreDNS. Un redémarrage du déploiement CoreDNS a permis de rétablir la résolution DNS interne :

```bash
kubectl rollout restart deployment/coredns -n kube-system
```

### Décalage horaire des VMs

Prometheus affichait des métriques incohérentes à cause d’un décalage important de l’horloge système. La synchronisation a été corrigée avec Chrony :

```bash
sudo chronyc makestep
```

## Compétences mises en pratique

- Provisionnement d’un environnement multi-VM avec Vagrant et VirtualBox
- Administration d’un cluster Kubernetes k3s
- Écriture et application de manifests Kubernetes
- Conteneurisation d’une application frontend et backend
- Mise en place d’un pipeline CI/CD avec Jenkins
- Construction d’images dans Kubernetes avec Kaniko
- Automatisation de l’infrastructure avec Ansible
- Gestion des secrets avec Ansible Vault
- Supervision d’un cluster avec Prometheus et Grafana
- Diagnostic réseau, DNS, stockage et synchronisation temporelle
- Documentation technique et retour d’expérience

## Améliorations possibles

- Ajouter un Ingress Controller avec HTTPS
- Mettre en place GitOps avec Argo CD
- Utiliser un stockage distribué comme Longhorn
- Ajouter des alertes Prometheus vers un canal de notification
- Intégrer les tests Ansible avec Molecule et ansible-lint
- Étendre l’infrastructure avec Terraform vers un environnement cloud

## Captures d’écran

Des captures de Grafana sont disponibles dans le dossier `monitoring/screenshots/`. Elles illustrent la supervision des ressources du cluster, des nœuds et des pods.
