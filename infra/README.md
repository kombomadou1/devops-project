# Infrastructure

Ce dossier contient l’infrastructure locale utilisée pour le projet : deux machines virtuelles Debian créées avec Vagrant et VirtualBox.

L’objectif est de mettre en place un petit environnement Kubernetes composé d’un nœud control plane et d’un nœud worker. Le cluster k3s est ensuite utilisé pour déployer Jenkins, Prometheus et Grafana.

## Machines virtuelles

| VM | Rôle | IP privée | RAM | vCPU |
|---|---|---:|---:|---:|
| `k3s-master` | Control plane Kubernetes | `192.168.56.10` | 4 Go | 5 |
| `k3s-worker` | Nœud worker Kubernetes | `192.168.56.11` | 2 Go | 2 |

Au départ, le nœud master disposait des mêmes ressources que le worker. Ses ressources ont ensuite été augmentées car Jenkins, Prometheus et Grafana sont déployés dans le cluster et nécessitent davantage de mémoire et de CPU.

Les deux VMs utilisent l’image `debian/bookworm64`. Elles possèdent une interface NAT pour accéder à Internet, ainsi qu’un réseau privé Host-Only leur permettant de communiquer entre elles avec des adresses IP fixes.

## Prérequis

- VirtualBox 7.x
- Vagrant 2.x
- Assez de ressources disponibles sur la machine hôte pour faire tourner les deux VMs

## Démarrer les VMs

Depuis le dossier `infra/` :

```bash
vagrant up
```

Cette commande crée et démarre les deux machines virtuelles.

Pour vérifier leur état :

```bash
vagrant status
```

## Se connecter aux VMs

La méthode recommandée consiste à passer par Vagrant, qui utilise automatiquement la bonne clé SSH :

```bash
vagrant ssh k3s-master
vagrant ssh k3s-worker
```

Il est aussi possible de se connecter directement avec les adresses IP privées :

```bash
ssh vagrant@192.168.56.10
ssh vagrant@192.168.56.11
```

Si la connexion échoue, la commande `vagrant ssh-config` permet de retrouver la clé privée générée par Vagrant.

## Configuration réseau

Les VMs communiquent via le réseau privé `192.168.56.0/24` :

```text
k3s-master : 192.168.56.10
k3s-worker : 192.168.56.11
```

Ce réseau est important car Kubernetes doit utiliser ces adresses IP fixes. L’interface NAT utilise la même adresse par défaut sur les deux VMs (`10.0.2.15`) et ne peut donc pas servir à la communication entre les nœuds.

## Arrêter ou supprimer les VMs

Pour arrêter les VMs :

```bash
vagrant halt
```

Pour les supprimer et nettoyer l’état Vagrant :

```bash
vagrant destroy -f
```

Si VirtualBox conserve des VMs anciennes ou corrompues, elles peuvent être supprimées avec :

```bash
vagrant destroy -f
rm -rf .vagrant
vagrant up
```
## Problème rencontré

Au premier lancement des VMs avec `vagrant up`, une erreur `E_ACCESSDENIED` apparaissait et empêchait Vagrant de créer ou démarrer les machines virtuelles.

Le problème venait du service **VirtualBox System Service**, qui n’était pas démarré sur la machine hôte. Sans ce service, Vagrant ne peut pas communiquer correctement avec VirtualBox.

Pour le résoudre :

1. Ouvrir le gestionnaire de services Windows avec `Win + R`, puis `services.msc`.
2. Rechercher **VirtualBox System Service**.
3. Faire un clic droit sur le service et sélectionner **Démarrer**.
4. Relancer la commande :

```bash
vagrant up
```

Après le démarrage du service, les VMs ont pu être créées et lancées normalement.