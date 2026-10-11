# Ansible

Ce dossier contient l’automatisation Ansible du projet DevOps. Elle permet de préparer les deux VMs Debian, d’installer le cluster k3s, d’installer Helm, puis de déployer Jenkins et la stack de monitoring de manière reproductible.

Ansible est exécuté depuis WSL, qui joue le rôle de machine de contrôle. Les machines gérées sont `k3s-master` et `k3s-worker`. Ansible n’a pas besoin d’être installé sur les VMs : une connexion SSH fonctionnelle et Python 3 suffisent.

Documentation utilisée :

- [Documentation officielle Ansible](https://docs.ansible.com/)
- [Collection kubernetes.core](https://docs.ansible.com/ansible/latest/collections/kubernetes/core/)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html)

## Organisation

```text
ansible/
├── ansible.cfg
├── inventories/
│   ├── local/
│   │   ├── hosts.yml
│   │   ├── group_vars/
│   │   │   ├── all/
│   │   │   ├── k3s_cluster/
│   │   │   ├── k3s_master/
│   │   │   └── k3s_workers/
│   │   └── host_vars/
│   └── staging/
├── playbooks/
│   └── site.yml
├── roles/
│   ├── common/
│   ├── k3s_prerequisites/
│   ├── k3s_server/
│   ├── k3s_agent/
│   ├── helm/
│   ├── jenkins/
│   ├── monitoring/
│   ├── app_namespace/
│   └── cluster_validation/
└── molecule/
```

Le fichier `playbooks/site.yml` est le point d’entrée principal. Il appelle les rôles dans l’ordre nécessaire au déploiement de la plateforme.

## Inventaire

L’inventaire local contient les deux VMs du projet :

| Groupe | Hôte | Adresse IP | Rôle |
|---|---|---|---|
| `k3s_master` | `k3s-master` | `192.168.56.10` | Control plane k3s |
| `k3s_workers` | `k3s-worker` | `192.168.56.11` | Worker k3s |

Le groupe `k3s_cluster` regroupe le master et le worker. Les variables communes sont stockées dans `group_vars`, tandis que les variables propres à une VM se trouvent dans `host_vars`.

Avant toute exécution, vérifier la connectivité :

```bash
ansible all -m ansible.builtin.ping
```

## Gestion des variables

Les variables sont organisées selon leur portée :

- `group_vars/all/` : variables communes à tous les hôtes.
- `group_vars/k3s_cluster/` : variables communes au cluster.
- `group_vars/k3s_master/` : variables propres au master.
- `group_vars/k3s_workers/` : variables propres aux workers.
- `host_vars/` : variables spécifiques à une machine.
- `roles/<role>/defaults/` : valeurs par défaut modifiables d’un rôle.

Les secrets sont placés dans `inventories/local/group_vars/all/vault.yml` et doivent être chiffrés avec Ansible Vault. Aucun token Docker Hub, mot de passe, kubeconfig sensible ou clé SSH ne doit être ajouté en clair dans le dépôt.

## Rôles

| Rôle | Objectif |
|---|---|
| `common` | Prépare la configuration commune des deux VMs |
| `k3s_prerequisites` | Configure les prérequis système et réseau de k3s |
| `k3s_server` | Installe le serveur k3s sur le master |
| `k3s_agent` | Joint le worker au cluster k3s |
| `helm` | Installe Helm sur le master |
| `jenkins` | Déploie Jenkins avec Helm |
| `monitoring` | Déploie Prometheus et Grafana avec Helm |
| `app_namespace` | Crée le namespace utilisé par l’application |
| `cluster_validation` | Vérifie l’état du cluster et des composants déployés |

L’ordre d’exécution est le suivant :

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

## Exécuter le playbook

Les commandes doivent être lancées depuis le dossier `ansible/` afin que le fichier `ansible.cfg` soit utilisé automatiquement.

Vérifier la syntaxe du playbook :

```bash
ansible-playbook playbooks/site.yml --syntax-check
```

Simuler l’exécution et afficher les différences :

```bash
ansible-playbook playbooks/site.yml --check --diff
```

Appliquer la configuration complète :

```bash
ansible-playbook playbooks/site.yml
```

Un rôle peut aussi être exécuté séparément grâce aux tags :

```bash
# Configuration commune
ansible-playbook playbooks/site.yml --limit all --tags common

# Prérequis k3s
ansible-playbook playbooks/site.yml --limit k3s_cluster --tags k3s_prerequisites

# Serveur k3s
ansible-playbook playbooks/site.yml --limit k3s_master --tags k3s_server

# Worker k3s
ansible-playbook playbooks/site.yml --limit k3s_workers --tags k3s_agent

# Helm
ansible-playbook playbooks/site.yml --limit k3s_master --tags helm

# Jenkins
ansible-playbook playbooks/site.yml --limit k3s_master --tags jenkins

# Monitoring
ansible-playbook playbooks/site.yml --limit k3s_master --tags monitoring

# Validation du cluster
ansible-playbook playbooks/site.yml --limit k3s_master --tags cluster_validation
```

Le rôle `k3s_server` doit être exécuté avant `k3s_agent`, car le worker utilise le token généré par le master. Lors d’un test complet du cluster, les deux rôles peuvent être lancés ensemble :

```bash
ansible-playbook playbooks/site.yml --tags k3s_server,k3s_agent
```

## Tests et idempotence

Chaque rôle est d’abord testé en mode simulation :

```bash
ansible-playbook playbooks/site.yml \
  --limit k3s_master \
  --tags helm \
  --check \
  --diff
```

Après une exécution réelle, la même commande doit être relancée. Si la configuration est déjà conforme, Ansible ne doit plus appliquer de modifications inutiles et doit afficher autant que possible `changed=0`.

Le mode `--check` reste une simulation : les tâches utilisant `shell`, Helm ou les modules Kubernetes doivent aussi être validées par une exécution réelle.

## Limites de validation

En raison des ressources limitées de l’environnement local, le playbook complet n’a pas été exécuté de bout en bout à chaque modification. Les rôles ont principalement été validés avec `--check` et `--diff`, puis testés individuellement lorsque cela était nécessaire.

## Points importants

### Communication entre les nœuds

Le rôle `k3s_prerequisites` ajoute les deux nœuds dans `/etc/hosts` afin que `k3s-master` et `k3s-worker` puissent se résoudre par leur nom.

Les adresses du réseau privé sont utilisées :

```text
192.168.56.10 k3s-master
192.168.56.11 k3s-worker
```

Les VMs ne doivent pas utiliser l’adresse NAT `10.0.2.15` pour communiquer entre elles, car cette adresse est identique sur les deux VMs VirtualBox.

### Token du cluster

Le rôle `k3s_server` récupère le token dans `/var/lib/rancher/k3s/server/node-token` et le stocke temporairement dans un fact Ansible.

Le rôle `k3s_agent` récupère ensuite ce token avec `hostvars['k3s-master']['k3s_node_token']` pour configurer et joindre le worker au cluster.

### Exécution de Helm

Les commandes Helm doivent être exécutées avec le même utilisateur que celui utilisé lors de la configuration initiale de Helm. Dans ce projet, Helm est utilisé avec l’utilisateur `vagrant` plutôt qu’avec `root`, car les dépôts et le cache Helm sont propres à chaque utilisateur.

## Problèmes rencontrés

### Fichiers locaux et machine cible

Les manifests et les fichiers de valeurs stockés dans les rôles Ansible existent sur la machine de contrôle, alors que les modules Kubernetes et Helm peuvent être exécutés sur `k3s-master`.

Utiliser directement `src` ou `values_files` avec un chemin local pouvait donc provoquer une erreur de fichier introuvable sur la VM cible. La solution retenue consiste à lire les fichiers depuis le contrôleur avec `lookup('ansible.builtin.file', ...)`, puis à injecter leur contenu dans les modules avec `definition` ou `release_values`.

### Bibliothèque Python Kubernetes

Les modules de la collection `kubernetes.core` nécessitent la bibliothèque Python `kubernetes` sur l’hôte qui exécute la tâche. Comme certaines tâches sont déléguées à `k3s-master`, cette bibliothèque doit être installée sur le master.

### Dépôts Helm et utilisateur courant

Une erreur indiquant qu’aucun dépôt Helm n’était disponible est apparue alors que les dépôts existaient bien en SSH. Le problème venait du fait que certaines tâches Ansible s’exécutaient avec `become: true`, donc avec l’utilisateur `root`, tandis que les dépôts avaient été ajoutés avec `vagrant`.

Les tâches Helm ont donc été exécutées avec le même utilisateur pour conserver le même cache et les mêmes dépôts.

### Vérification de Prometheus

`kubernetes.core.helm_info` a posé problème lors du parsing du manifeste rendu par Helm. À la place, la validation utilise directement les ressources Kubernetes avec `kubernetes.core.k8s_info`.

Cette méthode est plus fiable pour vérifier qu’un Deployment, un StatefulSet ou des pods sont réellement prêts.

### Mise à jour des dépôts Helm

L’option `update_repo_cache: true` met à jour tous les dépôts Helm présents sur la machine. Si un dépôt non concerné est indisponible, l’installation peut échouer.

La solution consiste à mettre à jour uniquement le dépôt nécessaire, par exemple :

```bash
helm repo update prometheus-community
```

### Conflits entre Helm et kubectl

Un conflit de propriété est apparu lorsqu’une ressource déjà gérée par Helm avait été modifiée avec `kubectl apply`.

Pour éviter ce type de problème, les objets gérés par Helm ne doivent pas être modifiés manuellement avec `kubectl apply`. Helm doit rester l’outil qui gère ces ressources.

## Validation finale

Après l’exécution du playbook, l’état du cluster peut être vérifié avec :

```bash
ansible k3s_master -b -m ansible.builtin.command \
  -a 'kubectl get nodes -o wide'

ansible k3s_master -b -m ansible.builtin.command \
  -a 'kubectl get pods -n jenkins'

ansible k3s_master -b -m ansible.builtin.command \
  -a 'kubectl get pods -n monitoring'
```

Le résultat attendu est un master et un worker en état `Ready`, ainsi que les composants Jenkins, Prometheus et Grafana opérationnels.
