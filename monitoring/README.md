# Monitoring

Ce dossier contient la configuration utilisée pour déployer Prometheus et Grafana dans le cluster k3s avec Helm.

La stack `kube-prometheus-stack` est utilisée pour collecter les métriques du cluster Kubernetes et les visualiser dans Grafana. Elle inclut notamment Prometheus, Grafana, Alertmanager, Node Exporter et Kube State Metrics.

Les documentations suivantes ont guidé l’installation :

- [kube-prometheus-stack – documentation officielle](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
- [kube-prometheus-stack – Artifact Hub](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack)
- [prometheus-operator-crds – Artifact Hub](https://artifacthub.io/packages/helm/prometheus-community/prometheus-operator-crds)
- [Documentation Helm – uninstall](https://helm.sh/docs/helm/helm_uninstall/)

## Prérequis

Avant de commencer, il faut disposer de :

- Un cluster k3s fonctionnel.
- `kubectl` configuré pour accéder au cluster.
- Helm 3 installé sur le nœud master.
- Un namespace `monitoring`, créé automatiquement lors de l’installation si nécessaire.

## Ajouter le dépôt Helm

Ajouter le dépôt Helm de la communauté Prometheus :

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Vérifier que le dépôt a bien été ajouté :

```bash
helm repo list
```

## Installation des CRDs

Lors de la première installation de `kube-prometheus-stack`, Helm rencontrait une erreur de timeout lors de la création des CRDs du Prometheus Operator :

```text
Error: INSTALLATION FAILED: failed to install CRD crds/crd-alertmanagerconfigs.yaml:
Timeout: request did not complete within requested timeout
```

Sur un cluster k3s local, l’installation de toutes les CRDs en même temps que la stack complète peut prendre trop de temps et provoquer ce timeout.

La solution consiste à installer d’abord les CRDs avec le chart dédié `prometheus-operator-crds`, puis à installer `kube-prometheus-stack` en désactivant la création des CRDs.

Installer les CRDs :

```bash
helm install prometheus-crds prometheus-community/prometheus-operator-crds \
  --namespace monitoring \
  --create-namespace
```

Vérifier qu’elles sont bien créées :

```bash
kubectl get crd | grep monitoring.coreos.com
```

Les CRDs attendues incluent notamment `alertmanagerconfigs`, `alertmanagers`, `prometheuses`, `prometheusrules`, `servicemonitors` et `podmonitors`.

## Configuration

Le fichier `prometheus-grafana-values.yaml` définit la configuration de la stack de monitoring.

Comme les CRDs ont été installées séparément, la création automatique des CRDs doit être désactivée :

```yaml
crds:
  enabled: false
```

La configuration comprend également :

- Grafana exposé via un `NodePort` sur le port `30030`.
- La persistance des données Grafana sur un volume de 2 Go.
- L’activation des dashboards Kubernetes par défaut.
- Prometheus avec une rétention des données de 7 jours.
- Alertmanager, Node Exporter et Kube State Metrics activés.
- Des ressources limitées afin de rester adaptées à un environnement local à deux VMs.

## Installation de la stack

Une fois les CRDs installées et le fichier de configuration prêt, installer la stack complète :

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prometheus-grafana-values.yaml
```

Vérifier l’état de la release Helm :

```bash
helm list -n monitoring
helm status prometheus -n monitoring
```

Vérifier que les pods sont bien démarrés :

```bash
kubectl get pods -n monitoring
```

Le namespace `monitoring` doit contenir notamment les pods de Grafana, Prometheus, du Prometheus Operator, d’Alertmanager, de Kube State Metrics et de Node Exporter.

## Accès à Grafana

Grafana est exposé via un `NodePort` sur le port `30030`. Il est donc accessible directement depuis la machine hôte :

```text
http://192.168.56.10:30030
```

Les identifiants définis dans le fichier de configuration sont :

```text
Utilisateur : admin
Mot de passe : admin123
```

Ces identifiants conviennent uniquement pour un environnement local de démonstration. Dans un environnement partagé ou en production, il faut utiliser un mot de passe fort stocké dans un Secret Kubernetes.

## Accès à Prometheus

Prometheus n’est pas exposé via un `NodePort` dans cette configuration. Pour y accéder temporairement, utiliser un port-forward :

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus \
  -n monitoring 9090:9090
```

Puis ouvrir :

```text
http://localhost:9090
```

## Accès à Alertmanager

Alertmanager peut également être accessible via un port-forward :

```bash
kubectl port-forward svc/prometheus-kube-prometheus-alertmanager \
  -n monitoring 9093:9090
```

Puis ouvrir :

```text
http://localhost:9093
```

## Mettre à jour la stack

Après une modification du fichier `prometheus-grafana-values.yaml`, appliquer les changements avec :

```bash
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prometheus-grafana-values.yaml
```

## Désinstaller la stack

Pour supprimer la release Helm :

```bash
helm uninstall prometheus -n monitoring
```

Supprimer également la release des CRDs :

```bash
helm uninstall prometheus-crds -n monitoring
```

Helm ne supprime pas automatiquement les CRDs. Pour un nettoyage complet, elles peuvent être supprimées manuellement :

```bash
kubectl delete crd alertmanagerconfigs.monitoring.coreos.com
kubectl delete crd alertmanagers.monitoring.coreos.com
kubectl delete crd podmonitors.monitoring.coreos.com
kubectl delete crd probes.monitoring.coreos.com
kubectl delete crd prometheusagents.monitoring.coreos.com
kubectl delete crd prometheuses.monitoring.coreos.com
kubectl delete crd prometheusrules.monitoring.coreos.com
kubectl delete crd scrapeconfigs.monitoring.coreos.com
kubectl delete crd servicemonitors.monitoring.coreos.com
kubectl delete crd thanosrulers.monitoring.coreos.com
```

Enfin, le namespace peut être supprimé si nécessaire :

```bash
kubectl delete namespace monitoring
```

## Problèmes rencontrés

### Timeout lors de l’installation des CRDs

La première tentative d’installation de `kube-prometheus-stack` échouait car Helm n’arrivait pas à créer les CRDs du Prometheus Operator dans le temps imparti.

Le problème a été résolu en installant d’abord les CRDs avec le chart `prometheus-operator-crds`, puis en installant la stack avec `crds.enabled: false`.

Si une installation précédente a échoué et a laissé des CRDs partiellement créées, il faut supprimer les releases Helm concernées ainsi que les CRDs avant de relancer l’installation.

### Pods en attente

Si certains pods restent en état `Pending`, cela peut venir d’un manque de CPU ou de mémoire sur les VMs.

Dans ce cas, vérifier les ressources disponibles avec :

```bash
kubectl top nodes
kubectl describe pod <POD_NAME> -n monitoring
```

Les ressources demandées par Grafana, Prometheus ou Alertmanager peuvent ensuite être réduites dans le fichier `prometheus-grafana-values.yaml`, puis appliquées avec `helm upgrade`.
