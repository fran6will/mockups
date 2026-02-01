---
name: ship
description: Déploie une nouvelle version et la publie (release) sur le Dev Dashboard.
---
1. Exécute `!shopify app deploy`. 
2. Une fois le déploiement réussi, récupère le numéro de version créé.
3. Exécute `!shopify app release --version <NUMERO_VERSION>`.
4. Affiche le lien direct vers le dashboard pour vérification : 
   https://dev.shopify.com/dashboard/203164075/apps/316623978497/