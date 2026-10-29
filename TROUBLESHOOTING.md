# Troubleshooting : problèmes rencontrés et solutions

Ce document recense les principaux problèmes rencontrés pendant la construction de la plateforme DevOps (Vagrant, VirtualBox, k3s, Jenkins, Kaniko, Ansible, Prometheus, Grafana). Les 46 entrées sont classées par domaine, et chacune est présentée de la même façon : le symptôme, la cause, puis la solution retenue.

Il complète les README de chaque dossier, qui traitent surtout des problèmes propres à leur composant. Les identifiants (A1, B2, etc.) servent aux renvois d'une entrée à l'autre.

## Environnement

| Élément | Valeur |
|---|---|
| Machine hôte | Windows 11, 16 Go de RAM (environ la moitié réellement disponible pour le cluster) |
| Virtualisation | VirtualBox 7.x, Vagrant 2.x, image `debian/bookworm64` |
| VMs | `k3s-master` (192.168.56.10, 4 Go / 5 vCPU, au départ 2 Go / 2 vCPU) et `k3s-worker` (192.168.56.11, 2 Go / 2 vCPU) |
| Swap | 2 Go par VM, provisionné par le `Vagrantfile` |
| Kubernetes | k3s |
| Outils | Helm, Jenkins, Kaniko, Prometheus, Grafana |
| Automatisation | Ansible exécuté depuis WSL |

Les noms de domaine, les IP et les identifiants de ce document sont ceux d'un laboratoire local. Aucun secret réel n'y figure.

## Sommaire

- [A. Poste de travail et VMs](#domaine-a)
  - [A1](#a1) `E_ACCESSDENIED` au `vagrant up`
  - [A2](#a2) VMs corrompues dans VirtualBox
  - [A3](#a3) `Permission denied (publickey)` en SSH direct
  - [A4](#a4) `ping 8.8.8.8` fonctionne, pas `google.com`
  - [A5](#a5) `k3s.service could not be found`
  - [A6](#a6) Horloge des VMs en retard de 33 h
- [B. Réseau k3s](#domaine-b)
  - [B1](#b1) Les deux nœuds ont l'IP `10.0.2.15`
  - [B2](#b2) Erreur 502 sur logs et exec (port 10250)
  - [B3](#b3) `ErrImagePull` sur `registry-1.docker.io`
  - [B4](#b4) `x509: certificate signed by unknown authority`
  - [B5](#b5) CoreDNS bloqué, Grafana sans données
- [C. Jenkins](#domaine-c)
  - [C1](#c1) `Init:CrashLoopBackOff` du sidecar JCasC
  - [C2](#c2) Jenkins instable sur le worker
  - [C3](#c3) Jenkins sans écran de login
  - [C4](#c4) Erreurs de plugins au démarrage
  - [C5](#c5) `UnknownHostException: updates.jenkins.io`
  - [C6](#c6) `StatefulSet not ready` avec `--wait`
  - [C7](#c7) `helm upgrade` en conflit sur `jenkins-agent`
  - [C8](#c8) Jenkins à 0 réplica et ressources insuffisantes
- [D. Pipeline CI/CD et Kaniko](#domaine-d)
  - [D1](#d1) `UNAUTHORIZED` au push Docker Hub
  - [D2](#d2) Conteneurs de l'agent qui s'arrêtent
  - [D3](#d3) Label du Pod Template ignoré
  - [D4](#d4) `chtimes ... no such file or directory`
  - [D5](#d5) Erreurs `symlink` et `chown` à l'extraction des images
  - [D6](#d6) `unknown instruction: API_URL=...`
  - [D7](#d7) `reading dockerfile at /kaniko/Dockerfile`
  - [D8](#d8) Builds Kaniko en échec en parallèle
  - [D9](#d9) Namespace bloqué en `Terminating`
  - [D10](#d10) Nginx `502 Host is unreachable`
- [E. Ansible](#domaine-e)
  - [E1](#e1) `getent` avec une liste dans `key`
  - [E2](#e2) Noms des nœuds non résolus
  - [E3](#e3) Token k3s introuvable sur le worker
  - [E4](#e4) Fact du token absent avec `--limit`
  - [E5](#e5) Erreurs de syntaxe diverses
  - [E6](#e6) `Failed to import ... kubernetes`
  - [E7](#e7) `src` et `values_files` lus au mauvais endroit
  - [E8](#e8) `no repositories found`
  - [E9](#e9) `helm_info` plante sur un `\t`
  - [E10](#e10) `helm status -o json` renvoie un stdout vide
  - [E11](#e11) Mauvais type de ressource pour Prometheus
  - [E12](#e12) `update_repo_cache` échoue à cause d'un autre dépôt
- [F. Monitoring (Prometheus et Grafana)](#domaine-f)
  - [F1](#f1) Timeout à l'installation des CRDs
  - [F2](#f2) Réinstallation impossible, CRDs orphelines
  - [F3](#f3) `up` vide et `Server time is out of sync`
  - [F4](#f4) Grafana ne redémarre pas après `cordon`
  - [F5](#f5) Pods `Pending` par manque de ressources
- [Annexe : méthode de diagnostic](#annexe)

---

<a id="domaine-a"></a>

# A. Poste de travail et VMs

<a id="a1"></a>

## A1. `E_ACCESSDENIED` au `vagrant up`

**Symptôme :** `vagrant up` s'arrête avec une erreur de `VBoxManage`.

```text
VBoxManage.exe: error: Details: code E_ACCESSDENIED (0x80070005), component MachineWrap, interface IMachine
```

**Cause :** Le service système de VirtualBox n'était pas démarré. Sans lui, Vagrant ne peut ni créer ni modifier les VMs.

**Solution :**

1. Ouvrir `services.msc` (Win + R).
2. Chercher **VirtualBox System Service**.
3. Faire un clic droit puis **Démarrer**.
4. Relancer `vagrant up`.

<a id="a2"></a>

## A2. VMs corrompues ou obsolètes dans VirtualBox

**Symptôme :** Même avec le service démarré, `vagrant up` échoue encore avec `E_ACCESSDENIED`, en pointant vers un UUID qui semble bloqué.

**Cause :** Des VMs créées lors d'essais précédents (avec un autre `Vagrantfile`) restaient enregistrées dans VirtualBox, dans un état incohérent.

**Solution :**

```powershell
# Lister les VMs enregistrées
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" list vms

# Désenregistrer et supprimer une VM corrompue
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" unregistervm "<NAME_OR_UUID>" --delete

# Réinitialiser l'état Vagrant du projet
vagrant destroy -f
Remove-Item -Recurse -Force .vagrant
vagrant up
```

Changer légèrement les noms des VMs dans le `Vagrantfile` (par exemple `devops-k3s-master`) force aussi la création de VMs avec un nouvel UUID.

<a id="a3"></a>

## A3. `Permission denied (publickey)` en SSH direct

**Symptôme :** `vagrant ssh` fonctionne, mais `ssh vagrant@192.168.56.10` ou `ssh -p 2222 vagrant@localhost` échouent.

**Cause :** Vagrant génère une paire de clés SSH par VM et range la clé privée dans `.vagrant/`. Le client SSH, lui, utilise par défaut les clés personnelles, que la VM ne reconnaît pas.

**Solution :**

```powershell
# Recommandé : laisser Vagrant choisir la bonne clé
vagrant ssh k3s-master

# Alternative manuelle : retrouver la clé générée, puis la passer à ssh
vagrant ssh-config k3s-master
ssh -i "<PATH_TO>/.vagrant/machines/k3s-master/virtualbox/private_key" vagrant@192.168.56.10
```

<a id="a4"></a>

## A4. `ping 8.8.8.8` fonctionne mais pas `google.com`

**Symptôme :** La connectivité IP est bonne, mais la résolution de noms échoue.

**Cause :** Le DNS NAT de VirtualBox (`10.188.0.1` dans ce projet) ne répondait pas correctement.

**Solution :**

```bash
# Utiliser des serveurs DNS publics
sudo tee /etc/resolv.conf <<'EOF'
nameserver 8.8.8.8
nameserver 1.1.1.1
EOF

ping -c 3 google.com
curl -I https://get.k3s.io
```

Cette modification peut être écrasée après un redémarrage par DHCP, NetworkManager ou systemd-resolved. Dans ce cas, il faut rendre la configuration DNS persistante selon le gestionnaire réseau de la VM.

<a id="a5"></a>

## A5. `k3s.service could not be found`

**Symptôme :** Après l'installation, le service k3s n'existe pas.

**Cause :** Le script d'installation n'a pas pu être téléchargé ou exécuté. Ici, la VM ne résolvait pas `get.k3s.io` (voir [A4](#a4)).

**Solution :** Corriger le DNS, puis relancer l'installation avec les options réseau du control plane.

```bash
curl -I https://get.k3s.io
```

<a id="a6"></a>

## A6. Horloge des VMs en retard d'environ 33 heures

**Symptôme :** Toutes les cibles Prometheus sont `UP`, mais la requête `up` ne renvoie rien. Prometheus affiche `Server time is out of sync`.

**Cause :** Un gros décalage d'horloge sur les VMs, mesuré avec Chrony :

```text
System time : 119613 seconds slow of NTP time
```

Prometheus collectait avec des timestamps faux pendant que Grafana interrogeait une autre plage de temps.

**Solution :**

```bash
# Vérifier la synchronisation
chronyc tracking

# Forcer une correction immédiate (à lancer sur le master ET le worker)
sudo chronyc makestep
```

Il faut ensuite redémarrer les composants de monitoring pour qu'ils repartent avec des timestamps corrects :

```bash
kubectl rollout restart deployment/coredns -n kube-system
kubectl rollout restart deployment/prometheus-grafana -n monitoring
kubectl rollout restart deployment/prometheus-kube-state-metrics -n monitoring
kubectl rollout restart deployment/prometheus-kube-prometheus-operator -n monitoring
kubectl rollout restart statefulset/prometheus-prometheus-kube-prometheus-prometheus -n monitoring
```

Pour éviter que le problème revienne après un redémarrage, Chrony est activé et autorisé à faire un saut d'horloge au démarrage :

```bash
sudo systemctl enable chrony
```

```conf
# /etc/chrony/chrony.conf
# Corriger l'horloge d'un coup si l'écart dépasse 1 seconde, pendant les 3 premières mises à jour
makestep 1.0 3
```

Deux précisions :

- `timedatectl` peut afficher `System clock synchronized: no` alors que Chrony est bien synchronisé. La référence reste `chronyc tracking`.
- Une heure en UTC dans les VMs face à l'heure de Paris sous Windows n'est pas un retard. Pour afficher l'heure locale : `sudo timedatectl set-timezone Europe/Paris`.

---

<a id="domaine-b"></a>

# B. Réseau k3s

<a id="b1"></a>

## B1. Les deux nœuds ont la même IP `10.0.2.15`

**Symptôme :**

```text
k3s-master   Ready   ...   10.0.2.15
k3s-worker   Ready   ...   10.0.2.15
```

Plusieurs erreurs en découlent (voir [B2](#b2), [B3](#b3), [B5](#b5) et [C1](#c1)) : `connection refused`, `Failed to connect to proxy`, pods Jenkins en `CrashLoopBackOff`, images impossibles à télécharger.

**Cause :** Chaque VM a deux interfaces : un réseau privé Host-Only (`192.168.56.x`) pour communiquer entre elles, et une interface NAT pour accéder à Internet. k3s a choisi automatiquement l'adresse NAT, qui vaut `10.0.2.15` sur les deux VMs.

**Solution :** Forcer les adresses du réseau privé.

```bash
# Master : installer le control plane avec l'adresse du réseau privé
sudo ./install-k3s.sh server \
  --node-ip 192.168.56.10 \
  --advertise-address 192.168.56.10
```

```yaml
# Worker : /etc/rancher/k3s/config.yaml (créé avant l'installation de l'agent)
server: https://192.168.56.10:6443
token: <MASTER_TOKEN>
node-ip: 192.168.56.11
```

```bash
# Vérification : chaque nœud doit avoir une INTERNAL-IP unique
kubectl get nodes -o wide
```

Côté Ansible, le rôle `k3s_prerequisites` ajoute les deux nœuds dans `/etc/hosts` et vérifie que l'IP attendue est bien configurée sur la machine (voir [E2](#e2)).

<a id="b2"></a>

## B2. Erreur 502 sur les logs et `exec`

**Symptôme :**

```text
proxy error from 127.0.0.1:6443 while dialing <NODE_IP>:10250
code 502: 502 Bad Gateway
```

**Cause :** L'API server n'arrivait pas à joindre le kubelet du nœud, parce que l'IP NAT était la même sur les deux VMs ([B1](#b1)).

**Solution :** Appliquer la correction de [B1](#b1), puis vérifier que chaque nœud a une `INTERNAL-IP` unique.

<a id="b3"></a>

## B3. `ErrImagePull` sur `registry-1.docker.io`

**Symptôme :**

```text
failed to resolve reference
lookup registry-1.docker.io: Try again
```

**Cause :** Le nœud ne résout pas les noms de domaine. Le problème vient du DNS de la VM ([A4](#a4)), pas de l'image.

**Solution :**

```bash
# 1. Corriger le DNS de la VM (voir A4)
# 2. Tester la résolution de noms depuis un pod
kubectl run test-net --image=busybox --rm -it --restart=Never -- \
  nslookup registry-1.docker.io

# 3. Supprimer le pod en échec pour forcer un nouveau pull
kubectl delete pod <POD_NAME> -n <NAMESPACE> --force --grace-period=0
```

<a id="b4"></a>

## B4. `x509: certificate signed by unknown authority`

**Symptôme :** `kubectl` refuse de se connecter au cluster après une réinstallation de k3s.

**Cause :** Le cluster a de nouveaux certificats, mais `~/.kube/config` contient encore l'ancien kubeconfig.

**Solution :**

```bash
mkdir -p "$HOME/.kube"
sudo cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"
kubectl get nodes
```

<a id="b5"></a>

## B5. CoreDNS bloqué : Grafana sans données

**Symptôme :** Les dashboards Grafana sont vides.

```text
lookup prometheus-kube-prometheus-prometheus.monitoring on 10.43.0.10:53: i/o timeout
```

Les logs de CoreDNS indiquent :

```text
[INFO] plugin/ready: Plugins not ready: "kubernetes"
```

**Cause :** Le plugin Kubernetes de CoreDNS était bloqué, alors que le `Corefile` était correct. Grafana ne pouvait plus résoudre le Service Prometheus.

**Solution :**

```bash
kubectl rollout restart deployment/coredns -n kube-system
kubectl rollout status deployment/coredns -n kube-system --timeout=120s

# Valider le DNS depuis l'intérieur du cluster
kubectl run dns-test -n monitoring --image=busybox:1.36 --restart=Never --rm -it -- \
  nslookup kubernetes.default.svc.cluster.local
```

---

<a id="domaine-c"></a>

# C. Jenkins

<a id="c1"></a>

## C1. `Init:CrashLoopBackOff` du sidecar JCasC

**Symptôme :**

```text
Init:CrashLoopBackOff
Max retries exceeded with url: /api/v1/namespaces/jenkins/configmaps
Connection refused to 10.43.0.1:443
```

**Cause :** L'initContainer `config-reload-init` ne joignait pas l'API server (`10.43.0.1`), à cause du réseau k3s mal configuré ([B1](#b1)).

**Solution :**

```bash
# Chaque nœud doit avoir sa propre INTERNAL-IP privée
kubectl get nodes -o wide

# Après correction de node-ip, redémarrer k3s et vérifier CoreDNS
sudo systemctl restart k3s
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

<a id="c2"></a>

## C2. Jenkins instable sur le worker

**Symptôme :** Jenkins était déployé sur le worker, avec des problèmes de DNS, de communication avec l'API server et de téléchargement d'images.

**Cause :** Le réseau et le DNS du worker étaient mal configurés ([A4](#a4), [B1](#b1)). Dans un lab à deux nœuds, le master est aussi plus stable et plus simple à déboguer.

**Solution :** Une fois le réseau corrigé, forcer Jenkins sur le master.

```bash
# Rendre le worker non planifiable
kubectl cordon k3s-worker

# Supprimer le pod ; le StatefulSet le recrée sur le master
kubectl delete pod jenkins-0 -n jenkins --force --grace-period=0
kubectl get pod jenkins-0 -n jenkins -o wide

# Une fois Jenkins stable, remettre le worker en service
kubectl uncordon k3s-worker
```

Le PersistentVolume est lié au nœud `k3s-master` par une `nodeAffinity`.

<a id="c3"></a>

## C3. Jenkins démarre sans écran de login

**Symptôme :** L'accès à « Créer un job » est direct, sans authentification.

**Cause :** La configuration de sécurité de `config.xml` était en mode « aucune sécurité », probablement à cause d'une configuration JCasC qui écrasait les paramètres du chart :

```xml
<authorizationStrategy class="hudson.security.AuthorizationStrategy$Unsecured"/>
<securityRealm class="hudson.security.SecurityRealm$None"/>
```

**Solution :**

1. Dans Jenkins : **Manage Jenkins** puis **Configure Global Security**, activer la sécurité avec la base d'utilisateurs de Jenkins et créer un administrateur.
2. Variante radicale pour un lab : renommer `config.xml` dans le pod, puis recréer le pod pour que JCasC réapplique la sécurité.

```bash
kubectl exec -it -n jenkins jenkins-0 -- bash
cd /var/jenkins_home
mv config.xml config.xml.insecure.bkp
exit
kubectl delete pod jenkins-0 -n jenkins --force --grace-period=0
```

<a id="c4"></a>

## C4. Erreurs de plugins au démarrage

**Symptôme :**

```text
Unable to retrieve JSON from https://updates.jenkins.io/...
updates.jenkins.io: Temporary failure in name resolution
```

**Cause :** Le chart essaie de télécharger des plugins au démarrage, mais la résolution DNS depuis les pods était instable.

**Solution :**

```yaml
controller:
  # Ne pas télécharger les plugins au démarrage (évite les erreurs liées au DNS)
  installPlugins: []
```

Jenkins démarre alors avec les plugins déjà présents dans l'image. Les plugins nécessaires au pipeline (Pipeline, Git, Credentials Binding, Kubernetes, Kubernetes CLI) sont installés ensuite depuis l'interface.

<a id="c5"></a>

## C5. `UnknownHostException: updates.jenkins.io` dans l'Update Center

**Symptôme :**

```text
There were errors checking the update sites: UnknownHostException: updates.jenkins.io
```

Alors que `curl -I https://updates.jenkins.io` depuis le pod renvoie `HTTP/2 200`.

**Cause :** Probablement un cache DNS ou TLS à l'initialisation de Jenkins. Le réseau fonctionne, mais l'Update Center échoue au premier cycle.

**Solution :**

1. Passer l'URL de l'Update Site en HTTP dans **Manage Jenkins**, **Plugins**, **Advanced**.
2. Redémarrer le pod Jenkins.
3. Remettre l'URL en HTTPS.
4. Redémarrer à nouveau le pod.

```bash
kubectl delete pod jenkins-0 -n jenkins --force --grace-period=0
kubectl get pods -n jenkins -w
```

<a id="c6"></a>

## C6. `StatefulSet not ready` avec `--wait`

**Symptôme :**

```text
Error: INSTALLATION FAILED: resource StatefulSet/jenkins/jenkins not ready. status: InProgress, message: Ready: 0/1
context deadline exceeded
```

**Cause :** Avec `--wait`, Helm attend que le StatefulSet soit prêt, mais le pod Jenkins met du temps à démarrer (téléchargement de l'image, initialisation).

**Solution :** Retirer `--wait` et suivre le démarrage à la main, ou réessayer plus tard.

```bash
helm install jenkins jenkins/jenkins --namespace jenkins -f jenkins-values.yaml
kubectl get pods -n jenkins -w
```

<a id="c7"></a>

## C7. `helm upgrade` en conflit sur `jenkins-agent`

**Symptôme :**

```text
Error: UPGRADE FAILED: conflict occurred while applying object jenkins/jenkins-agent /v1, Kind=Service:
Apply failed with 2 conflicts: conflicts with "kubectl-client-side-apply" using v1:
- .metadata.labels.helm.sh/chart
- .spec.type
```

L'historique Helm montre les révisions 2, 3 et 4 en `failed`, tandis que la révision 1 reste `deployed`.

**Cause :** Le Service `jenkins-agent` avait été créé ou modifié avec `kubectl apply`. Le manager `kubectl-client-side-apply` détenait donc `.spec.type` et le label `helm.sh/chart`. Helm 4 utilise le server-side apply et détecte ce conflit de propriété. Le passage du chart de 5.9.63 à 5.9.67 touche justement ces champs.

Le nombre de réplicas n'est pas en cause.

**Solution (celle qui a fonctionné) :**

```bash
# Laisser Helm reprendre la propriété des champs en conflit
helm upgrade jenkins jenkins/jenkins \
  --namespace jenkins \
  -f jenkins-values.yaml \
  --force-conflicts
```

Alternative : supprimer uniquement le Service fautif. Helm le recrée, sans toucher au pod ni au PVC.

```bash
kubectl delete svc jenkins-agent -n jenkins
helm upgrade jenkins jenkins/jenkins --namespace jenkins -f jenkins-values.yaml
```

Pour vérifier qui détient les champs :

```bash
kubectl get svc jenkins-agent -n jenkins --show-managed-fields -o yaml | grep -B2 -A6 manager
helm history jenkins -n jenkins
```

À retenir : ne pas modifier avec `kubectl apply` ou `kubectl edit` un objet géré par Helm.

<a id="c8"></a>

## C8. Jenkins à 0 réplica et ressources insuffisantes

**Symptôme :** Avec Jenkins et la stack de monitoring installés, les pods du monitoring restaient en `Pending`, le cluster devenait très lent et, à un moment, les commandes `kubectl` ne répondaient plus.

**Cause :** Les ressources de départ (2 Go de RAM et 2 vCPU par VM) étaient insuffisantes. L'hôte limitait aussi ce qu'on pouvait allouer : 16 Go de RAM sur le PC, dont environ la moitié réellement disponible pour le cluster, avec Ansible qui tournait en plus sous WSL.

**Solution :** Plusieurs ajustements successifs :

1. Réglage fin des `requests` et `limits` de Jenkins, Prometheus, Grafana et Alertmanager.
2. Passage temporaire de Jenkins à 0 réplica pour laisser démarrer le monitoring.
3. Fermeture des navigateurs et des applications gourmandes sur l'hôte.
4. Ajout de 2 Go de swap dans chaque VM.
5. Passage du master de 2 Go / 2 vCPU à 4 Go / 5 vCPU.

```ruby
# Vagrantfile (extrait) : ressources du master après l'augmentation
master.vm.provider "virtualbox" do |vb|
  vb.name = "devops-k3s-master"
  vb.memory = 4096
  vb.cpus = 5
end

# Fichier de swap de 2 Go créé dans chaque VM (filet de sécurité pour les pics de mémoire)
config.vm.provision "shell", inline: <<-SHELL
  if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
  fi
SHELL
```

```bash
# Réduire Jenkins à 0 réplica, puis le relancer
kubectl scale statefulset jenkins -n jenkins --replicas=0
kubectl scale statefulset jenkins -n jenkins --replicas=1
```

Dans le fichier de valeurs Helm, le nombre de réplicas doit rester à `1` quand Jenkins doit tourner.

---

<a id="domaine-d"></a>

# D. Pipeline CI/CD et Kaniko

<a id="d1"></a>

## D1. `UNAUTHORIZED` au push Docker Hub

**Symptôme :**

```text
UNAUTHORIZED: authentication required
```

**Cause :** Le Secret Docker Hub était monté sous le nom `/kaniko/.docker/.dockerconfigjson`, alors que Kaniko cherche `/kaniko/.docker/config.json`.

**Solution :** Monter le Secret avec `items`, pour renommer la clé en `config.json`.

```bash
# Créer le secret de registre à partir d'un token d'accès (jamais le mot de passe du compte)
kubectl create secret docker-registry dockerhub-config \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<DOCKERHUB_USER> \
  --docker-password='<DOCKERHUB_ACCESS_TOKEN>' \
  -n jenkins
```

```yaml
# Spec du pod (extrait) : monter le secret sous le nom config.json
volumeMounts:
  - name: docker-config
    mountPath: /kaniko/.docker
volumes:
  - name: docker-config
    secret:
      secretName: dockerhub-config
      items:
        - key: .dockerconfigjson
          path: config.json
```

Dans l'interface Jenkins, si le montage graphique ne permet pas de définir `key` et `path`, il faut passer par le champ **Raw YAML for the Pod**. Le même montage ne doit pas être défini deux fois. Et il ne faut jamais afficher le contenu du fichier avec `cat` : il contient le token.

<a id="d2"></a>

## D2. Conteneurs de l'agent qui s'arrêtent

**Symptôme :** Les conteneurs `node`, `kaniko` ou `kubectl` du pod agent se terminent immédiatement.

**Cause :** Définir `command` remplace l'`ENTRYPOINT` de l'image. Sans commande de longue durée, le conteneur s'arrête. Une mauvaise forme des arguments aggrave le problème.

**Solution :**

```yaml
# Garder le conteneur actif pour que Jenkins puisse y lancer des commandes
command:
  - /bin/sh
args:
  - -c
  - sleep infinity
```

Il faut éviter `args: ["-c \"sleep infinity\""]`. Pour l'image Kaniko, utiliser le shell fourni par l'image (`/busybox/sh`) ou `sleep` directement.

<a id="d3"></a>

## D3. Label du Pod Template ignoré

**Symptôme :** Le pipeline ne récupérait pas les conteneurs et volumes du Pod Template.

**Cause :** Dans cet environnement, la sélection par label n'a pas fonctionné correctement.

**Solution :** Hériter du Pod Template avec `inheritFrom`.

```groovy
pipeline {
    agent {
        kubernetes {
            inheritFrom 'devops-template'
        }
    }
}
```

Les `stages` s'exécutent dans le pod agent, pas dans le controller. Sans `container('node')`, une commande tourne dans le conteneur par défaut, qui ne contient pas forcément Node.js.

<a id="d4"></a>

## D4. `chtimes ... no such file or directory`

**Symptôme :**

```text
failed to get filesystem from image
couldn't modify times
chtimes /usr/bin/chrt: no such file or directory
```

**Cause probable :** Une incompatibilité entre Kaniko et les métadonnées, les liens symboliques ou les fichiers de l'image de base. Cette cause n'a pas été confirmée précisément.

**Solutions possibles :**

- Tester l'option `--snapshot-mode=redo`.
- Utiliser une image de base plus stable.
- Vérifier la version de Kaniko.

<a id="d5"></a>

## D5. Erreurs `symlink` et `chown` à l'extraction des images de base

**Symptôme :**

```text
symlink ... which.debianutils.1.gz ... file exists
chown /etc/apt/trusted.gpg.d/debian-archive-bookworm-automatic.asc: no such file or directory
```

**Cause probable :** Des problèmes d'extraction de certaines images de base avec Kaniko : l'image Nginx pour la première erreur, certaines images `node:22.23-bookworm-slim` pour la seconde.

**Solution :** Changer d'image de base.

```dockerfile
# Nginx : utiliser une base plus légère et plus stable
FROM nginx:1.27-alpine

# Node : si l'image slim Debian échoue, essayer une autre variante
FROM node:22-bookworm
# ou
FROM node:22-bullseye-slim
```

<a id="d6"></a>

## D6. `unknown instruction: API_URL=...`

**Symptôme :**

```text
unknown instruction: API_URL=http://localhost:3000
```

**Cause :** Une ligne du Dockerfile du frontend n'avait pas d'instruction Dockerfile devant elle.

**Solution :**

```dockerfile
ENV API_URL=http://localhost:3000
```

Une variable `ENV` ne modifie pas du JavaScript Angular déjà compilé. Pour une configuration à l'exécution, il faut passer par un template Nginx.

<a id="d7"></a>

## D7. `reading dockerfile at /kaniko/Dockerfile`

**Symptôme :**

```text
reading dockerfile at path /kaniko/Dockerfile: no such file or directory
```

**Cause :** Les chemins `--context` et `--dockerfile` ne correspondaient pas à l'emplacement réel du workspace dans le conteneur.

**Solution :** Baser les deux chemins sur `${WORKSPACE}`.

```groovy
sh """
  /kaniko/executor \\
    --context=\${WORKSPACE}/app/backend \\
    --dockerfile=\${WORKSPACE}/app/backend/Dockerfile \\
    --destination=\${BACKEND_IMAGE}:\${IMAGE_TAG}
"""
```

Pendant le diagnostic, il est utile d'afficher temporairement le contenu du workspace. Une fois le problème réglé, ces commandes sont retirées pour garder des logs propres.

<a id="d8"></a>

## D8. Builds Kaniko en échec en parallèle

**Symptôme :** Plusieurs des erreurs précédentes ([D4](#d4), [D5](#d5), [D7](#d7)) sont apparues quand les stages Kaniko étaient placés dans un bloc `parallel`.

**Cause :** Des interactions possibles entre les builds sur les volumes ou le système de fichiers de l'agent.

**Solution :** Garder en parallèle l'installation des dépendances, les tests et les builds Node (des répertoires indépendants), mais exécuter les builds Kaniko et les déploiements l'un après l'autre. Le diagnostic est aussi plus simple en cas d'erreur.

<a id="d9"></a>

## D9. Namespace bloqué en `Terminating`

**Symptôme :**

```text
unable to retrieve the complete list of server APIs
metrics.k8s.io/v1beta1: stale GroupVersion discovery
Deletion of namespace failed
```

**Cause :** L'APIService du metrics-server était indisponible. Le contrôleur de namespaces ne pouvait pas découvrir toutes les API avant de supprimer les ressources.

**Solution :**

```bash
# Diagnostic
kubectl get apiservice v1beta1.metrics.k8s.io
kubectl get pods -n kube-system | grep metrics

# Redémarrer metrics-server
kubectl rollout restart deployment metrics-server -n kube-system
kubectl top nodes

# Seulement si metrics-server n'est plus utilisé
kubectl delete apiservice v1beta1.metrics.k8s.io
```

Il vaut mieux ne pas retirer directement les finalizers du namespace : l'API indisponible doit être corrigée d'abord.

<a id="d10"></a>

## D10. Nginx `502 Host is unreachable`

**Symptôme :**

```text
connect() failed (113: Host is unreachable)
upstream: http://10.43.98.126:3000/auth/login
```

**Cause :** Plusieurs origines possibles : le backend n'écoute que sur `127.0.0.1`, les labels du Service ne correspondent pas aux pods, le DNS interne est défaillant, ou le frontend pointe vers un mauvais upstream (`localhost` désigne le conteneur frontend lui-même).

**Solution :**

```typescript
// NestJS : écouter sur toutes les interfaces, pas seulement localhost
await app.listen(3000, '0.0.0.0');
```

```nginx
# Nginx du frontend : utiliser le nom DNS du Service backend
proxy_pass http://back-ges-asso-service:3000;
```

```bash
# Vérifications
kubectl -n ges-asso describe svc back-ges-asso-service
kubectl -n ges-asso get endpoints back-ges-asso-service
kubectl -n ges-asso get pods --show-labels
kubectl -n ges-asso exec deploy/front-ges-asso -- getent hosts back-ges-asso-service
```

Un Service sans endpoint indique en général un problème de selectors ou de labels.

---

<a id="domaine-e"></a>

# E. Ansible

<a id="e1"></a>

## E1. `getent` avec une liste dans `key`

**Symptôme :**

```text
One or more supplied key could not be found in the database.
```

**Cause :** Le paramètre `key` de `getent` attend une seule valeur, pas une liste.

**Solution :**

```yaml
- name: Check K3s node names resolution
  ansible.builtin.getent:
    database: hosts
    key: "{{ item }}"
  loop:
    - k3s-master
    - k3s-worker
  register: k3s_host_resolution
  changed_when: false
```

<a id="e2"></a>

## E2. Noms des nœuds non résolus

**Symptôme :** Les VMs ne se résolvent pas l'une l'autre par leur nom. `/etc/hosts` ne contient que l'entrée locale Debian (`127.0.1.1 k3s-worker k3s-worker`), qui doit être conservée.

**Cause :** Les adresses du réseau privé des deux nœuds n'étaient déclarées nulle part.

**Solution :**

```yaml
- name: Add K3s nodes to /etc/hosts
  become: true
  ansible.builtin.blockinfile:
    path: /etc/hosts
    marker: "# {mark} K3S CLUSTER"
    block: |
      {{ hostvars['k3s-master']['ansible_host'] }} k3s-master
      {{ hostvars['k3s-worker']['ansible_host'] }} k3s-worker
    state: present
```

Un redémarrage n'est pas nécessaire. En revanche, il faut une exécution réelle : `--check --diff` montre le changement sans l'appliquer.

<a id="e3"></a>

## E3. Token k3s introuvable sur le worker

**Symptôme :** Le rôle `k3s_agent` ne trouve pas la variable `k3s_node_token`.

**Cause :** `set_fact` crée le fact sur l'hôte qui l'exécute (le master). Il n'existe pas automatiquement sur le worker.

**Solution :**

```yaml
# Sur le master : lire et stocker le token
- name: Read K3s cluster token
  become: true
  ansible.builtin.slurp:
    src: /var/lib/rancher/k3s/server/node-token
  register: k3s_token_file
  no_log: true

- name: Store K3s cluster token as a fact
  ansible.builtin.set_fact:
    k3s_node_token: "{{ k3s_token_file.content | b64decode | trim }}"
  no_log: true

# Sur le worker : le lire via hostvars
- name: Configure K3s agent
  become: true
  ansible.builtin.copy:
    dest: /etc/rancher/k3s/config.yaml
    content: |
      server: "{{ k3s_server_url }}"
      token: "{{ hostvars['k3s-master']['k3s_node_token'] }}"
      node-ip: "{{ k3s_agent_ip }}"
    owner: root
    group: root
    mode: "0600"
  no_log: true
```

<a id="e4"></a>

## E4. Fact du token absent avec `--limit`

**Symptôme :** Le test du rôle agent échoue alors que le serveur est installé.

**Cause :** Avec `--limit k3s_workers --tags k3s_agent`, le rôle serveur n'est pas exécuté pendant ce lancement, donc le fact n'est jamais créé.

**Solution :** Lancer le serveur et l'agent dans la même exécution.

```bash
ansible-playbook playbooks/site.yml --tags k3s_server,k3s_agent
```

Le mode `--check` ne remplace pas un test réel : l'installation via `shell` et le join du worker doivent être validés par une exécution réelle.

<a id="e5"></a>

## E5. Erreurs de syntaxe diverses

**Symptôme :** Plusieurs tâches échouent pour des erreurs de forme.

| Erreur | Correction |
|---|---|
| URL écrite en Markdown dans une commande shell (`[https://get.k3s.io](https://get.k3s.io)`) | Utiliser l'URL brute : `curl -sfL https://get.k3s.io` |
| `create:` au lieu de `creates:` | `creates: /usr/local/bin/helm` rend la commande idempotente |
| `debug` avec `data:` | Utiliser `var:` |
| Clé `handlers:` dans `handlers/main.yml` | Le fichier doit contenir directement une liste de tâches |
| `always: true` sur une tâche | `always` s'utilise avec un `block` et contient une liste de tâches |
| Nom de variable de version en conflit avec le résultat enregistré | Utiliser des noms distincts (`helm_version` et `helm_version_result`) |

```yaml
# Structure correcte pour une tâche qui doit toujours s'exécuter (ex. uncordon)
- name: Deploy Jenkins
  block:
    - name: Install Jenkins
      kubernetes.core.helm:
        name: jenkins
        chart_ref: jenkins/jenkins
        release_namespace: "{{ jenkins_namespace }}"
        state: present
  always:
    - name: Uncordon Kubernetes worker node
      kubernetes.core.k8s_drain:
        name: "{{ k3s_worker_node_name }}"
        state: uncordon
```

Les modules doivent aussi être référencés par leur nom complet de collection : `kubernetes.core.k8s`, `kubernetes.core.helm`, etc.

<a id="e6"></a>

## E6. `Failed to import the required Python library (kubernetes)`

**Symptôme :** Les tâches `kubernetes.core.*` échouent à l'import de la bibliothèque.

**Cause :** Ces modules utilisent le client Python Kubernetes sur l'hôte qui exécute la tâche. Les tâches étant déléguées au master, la bibliothèque doit y être installée.

**Solution :**

```yaml
- name: Install Python dependencies for Kubernetes modules
  become: true
  ansible.builtin.apt:
    name:
      - python3-kubernetes
      - python3-yaml
      - python3-jsonpatch
    state: present
    update_cache: true
```

```bash
# Vérification
ansible k3s_master -b -m ansible.builtin.command \
  -a "/usr/bin/python3 -c 'import kubernetes; print(kubernetes.__version__)'"
```

Si le paquet Debian n'est pas disponible, installer `kubernetes`, `PyYAML` et `jsonpatch` avec `ansible.builtin.pip`.

<a id="e7"></a>

## E7. `src` et `values_files` lus au mauvais endroit

**Symptôme :** Fichier introuvable sur `k3s-master` alors qu'il existe bien dans le rôle.

**Cause :** `src` et `values_files` sont lus sur la machine où le module s'exécute (la VM cible), alors que les fichiers se trouvent sur la machine de contrôle Ansible. `lookup('file', ...)`, lui, lit sur le contrôleur.

**Solution :**

```yaml
# Manifests Kubernetes : charger sur le contrôleur, parser, puis passer en definition
- name: Create Jenkins persistent volume and storage class
  kubernetes.core.k8s:
    definition: >-
      {{
        lookup('ansible.builtin.file', role_path ~ '/files/jenkins-01-volume.yaml')
        | from_yaml_all
        | list
      }}

# Values Helm : injecter le contenu plutôt qu'un chemin local
- name: Install Jenkins
  kubernetes.core.helm:
    name: jenkins
    chart_ref: jenkins/jenkins
    release_namespace: "{{ jenkins_namespace }}"
    release_values: >-
      {{
        lookup('ansible.builtin.file', role_path ~ '/files/jenkins-values.yaml')
        | from_yaml
      }}
```

Pour plusieurs documents YAML séparés par `---`, utiliser `from_yaml_all | list`.

<a id="e8"></a>

## E8. `no repositories found`

**Symptôme :**

```text
Error: no repositories found. You must add one before updating
```

Alors que `helm repo list` en SSH affiche bien les dépôts `jenkins` et `prometheus-community`.

**Cause :** Helm stocke ses dépôts par utilisateur. En SSH, les commandes étaient lancées par `vagrant`, mais certaines tâches Ansible s'exécutaient avec `become: true`, donc en `root`.

**Solution :** Exécuter toutes les tâches Helm avec le même utilisateur.

```yaml
- name: Add Jenkins Helm repository
  become: false
  kubernetes.core.helm_repository:
    name: jenkins
    repo_url: "{{ jenkins_repo_url }}"
    binary_path: "/usr/local/bin/helm"
```

<a id="e9"></a>

## E9. `helm_info` plante sur un caractère `\t`

**Symptôme :** `kubernetes.core.helm_info` échoue avec une erreur YAML qui signale une tabulation interdite.

**Cause :** Le manifeste rendu par Helm pour la release Prometheus contenait lui-même une tabulation invalide, que le parseur Python d'Ansible refusait. Le problème ne venait pas des fichiers du projet.

**Diagnostic :**

```bash
helm get manifest prometheus --namespace monitoring > /tmp/prometheus-manifest.yaml
grep -nP '\t' /tmp/prometheus-manifest.yaml
```

**Solution :** Ne plus utiliser `helm_info` pour vérifier l'état de Prometheus et interroger directement Kubernetes (voir [E11](#e11)).

<a id="e10"></a>

## E10. `helm status -o json` renvoie un stdout vide

**Symptôme :** La commande renvoie `rc=0` mais `stdout` est vide dans Ansible, donc `from_json` échoue.

**Cause :** Dans ce contexte précis, la sortie n'était pas exploitable de façon fiable.

**Solution :** Abandonner le parsing de la sortie Helm. Pour vérifier qu'un composant est prêt, la source de vérité la plus fiable est Kubernetes (`k8s_info`).

<a id="e11"></a>

## E11. Mauvais type de ressource pour Prometheus

**Symptôme :** Les tâches d'attente ne trouvent jamais la ressource attendue.

**Cause :** `kube-prometheus-stack` déploie Prometheus en StatefulSet, pas en Deployment.

**Solution :**

```bash
# Toujours vérifier d'abord les vrais types et noms d'objets
kubectl get deploy,statefulset -n monitoring
```

```yaml
- name: Wait for Prometheus StatefulSet to be ready
  kubernetes.core.k8s_info:
    api_version: apps/v1
    kind: StatefulSet
    name: prometheus-prometheus-kube-prometheus-prometheus
    namespace: "{{ monitoring_namespace }}"
    kubeconfig: "{{ kubeconfig }}"
  register: prometheus_statefulset
  until:
    - prometheus_statefulset.resources | length > 0
    - >
      prometheus_statefulset.resources[0].status.readyReplicas
      | default(0) | int
      ==
      prometheus_statefulset.resources[0].spec.replicas | default(1) | int
  retries: 30
  delay: 10
```

<a id="e12"></a>

## E12. `update_repo_cache` échoue à cause d'un autre dépôt

**Symptôme :** L'installation des CRDs de Prometheus échoue avec une erreur sur le dépôt Jenkins.

```text
Error: failed to update the following repositories: [https://charts.jenkins.io]
```

**Cause :** `update_repo_cache: true` déclenche un `helm repo update` global. Si un dépôt sans rapport est momentanément injoignable (ici, une erreur IPv6 vers `charts.jenkins.io`), l'installation échoue.

**Solution :** Retirer l'option et mettre à jour uniquement le dépôt nécessaire.

```yaml
- name: Update Prometheus Helm repository only
  become: false
  ansible.builtin.command:
    cmd: /usr/local/bin/helm repo update prometheus-community
  changed_when: false
```

---

<a id="domaine-f"></a>

# F. Monitoring (Prometheus et Grafana)

<a id="f1"></a>

## F1. Timeout à l'installation des CRDs

**Symptôme :**

```text
Error: INSTALLATION FAILED: failed to install CRD crds/crd-alertmanagerconfigs.yaml:
server-side apply failed ... Timeout: request did not complete within requested timeout
```

**Cause :** Sur un cluster k3s local, installer toutes les CRDs en même temps que la stack complète prend trop de temps.

**Solution :** Installer d'abord les CRDs avec le chart dédié, puis la stack avec la création des CRDs désactivée.

```bash
helm install prometheus-crds prometheus-community/prometheus-operator-crds \
  --namespace monitoring \
  --create-namespace

kubectl get crd | grep monitoring.coreos.com
```

```yaml
# Values de kube-prometheus-stack : les CRDs sont gérées par la release prometheus-operator-crds
crds:
  enabled: false
```

<a id="f2"></a>

## F2. Réinstallation impossible : CRDs orphelines

**Symptôme :** Le chart `prometheus-operator-crds` ne s'installe plus, car des ressources existent déjà après un échec partiel.

**Cause :** Helm ne supprime jamais les CRDs automatiquement.

**Solution :** Supprimer les releases, puis les CRDs. Cette opération supprime aussi les ressources créées à partir d'elles (`Prometheus`, `Alertmanager`, `ServiceMonitor`, `PrometheusRule`). Elle est donc à réserver à une réinitialisation complète.

```bash
helm uninstall prometheus -n monitoring
helm uninstall prometheus-crds -n monitoring

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

# Ne doit rien renvoyer avant une réinstallation propre
kubectl get crd | grep monitoring.coreos.com
```

<a id="f3"></a>

## F3. `up` vide et `Server time is out of sync`

**Symptôme :** Même avec toutes les cibles `UP`, la requête `up` ne renvoie rien dans Prometheus.

**Cause :** La dérive d'horloge des VMs décrite en [A6](#a6).

**Solution :** Voir [A6](#a6) : `sudo chronyc makestep` sur les deux nœuds, redémarrage des composants de monitoring, puis `makestep 1.0 3` dans la configuration de Chrony. Après quelques cycles de scraping, `up` doit afficher plusieurs séries à `1`.

<a id="f4"></a>

## F4. Grafana ne redémarre pas après `cordon` du worker

**Symptôme :**

```text
0/2 nodes are available:
1 node(s) didn't match PersistentVolume's node affinity,
1 node(s) were unschedulable
```

**Cause :** Grafana utilise un PVC avec la StorageClass `local-path`. Le PV est lié au nœud où il a été créé, ici le worker, qui venait d'être cordonné. Un volume local ne migre pas vers un autre nœud.

**Solution :** Recréer le stockage sur le master. Les données locales de Grafana sont perdues.

```bash
kubectl delete pvc -n monitoring <GRAFANA_PVC_NAME>

helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values values-kube-prometheus-stack.yaml
```

Un `kubectl rollout restart` ne recrée pas un PVC supprimé : il ne recrée que les pods. C'est `helm upgrade` qui réapplique le manifeste.

Pour de la haute disponibilité, il faudrait un stockage partagé ou répliqué (Longhorn, NFS, CSI cloud).

<a id="f5"></a>

## F5. Pods `Pending` par manque de ressources

**Symptôme :** Des pods du namespace `monitoring` restent en `Pending`.

**Cause :** CPU ou mémoire insuffisants sur les VMs (voir [C8](#c8)).

**Solution :**

```bash
kubectl top nodes
kubectl describe pod <POD_NAME> -n monitoring
```

Réduire les `requests` et `limits` de Grafana, Prometheus et Alertmanager dans le fichier de valeurs, puis appliquer avec `helm upgrade`. Si cela ne suffit pas, augmenter les ressources de la VM ([C8](#c8)).

---

<a id="annexe"></a>

# Annexe : méthode de diagnostic

Avant de corriger un symptôme, il vaut mieux isoler la couche concernée.

| Question | Commande |
|---|---|
| Les nœuds ont-ils des IP uniques ? | `kubectl get nodes -o wide` |
| Le DNS de la VM fonctionne-t-il ? | `ping -c 3 google.com` |
| Le DNS du cluster fonctionne-t-il ? | `kubectl run test-dns --image=busybox --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local` |
| L'horloge est-elle synchronisée ? | `chronyc tracking` |
| Les pods sont-ils bloqués, et pourquoi ? | `kubectl describe pod <POD>` et `kubectl get events --sort-by=.lastTimestamp` |
| Les ressources suffisent-elles ? | `kubectl top nodes` |
| Un Service a-t-il des endpoints ? | `kubectl get endpoints <SERVICE> -n <NAMESPACE>` |
| Qui possède un champ d'un objet Kubernetes ? | `kubectl get <KIND> <NAME> --show-managed-fields -o yaml` |
| Dans quel contexte tourne une tâche Ansible ? | Vérifier l'hôte cible, l'utilisateur (`become`) et si le fichier est sur le contrôleur ou sur la cible |

## Règles retenues

- Un même symptôme peut avoir une seule cause racine : sur ce projet, l'IP NAT dupliquée ([B1](#b1)) expliquait [B2](#b2), [B3](#b3), [B5](#b5) et [C1](#c1).
- Garder le même utilisateur pour toutes les commandes Helm.
- Ne pas modifier avec `kubectl apply` un objet géré par Helm.
- Vérifier l'état réel avec Kubernetes (`k8s_info`, `kubectl get`) plutôt que de parser la sortie de Helm.
- Ne jamais écrire un token ou un mot de passe dans un dépôt. Utiliser un Secret Kubernetes, les credentials Jenkins ou Ansible Vault.
- Dimensionner les VMs en tenant compte de l'hôte : une stack Jenkins plus monitoring a un coût réel en mémoire et en CPU.
