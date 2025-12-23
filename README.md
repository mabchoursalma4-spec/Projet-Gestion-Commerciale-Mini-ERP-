#  Projet Gestion Commerciale – Mini ERP
# Contexte du Projet
Ce projet a été réalisé dans le cadre d’un travail académique.  
L’objectif est de développer une application **Backoffice de Gestion Commerciale** en utilisant **JavaScript natif (VanillaJS)**, **HTML5** et **CSS3**, sans utiliser de frameworks modernes comme React ou Angular.
# Objectifs
- Implémenter des fonctionnalités **CRUD** (Créer, Lire, Mettre à jour, Supprimer)
- Gérer au minimum **5 entités**
- Utiliser des **APIs publiques** ou des données simulées
- Créer un **tableau de bord (Dashboard)** avec des statistiques
- Appliquer les notions de manipulation du **DOM**, **Fetch API** et **Async/Await**
- Concevoir une interface **responsive** et simple à utiliser
#  Entités Gérées
L’application permet de gérer les entités suivantes :

- Utilisateurs  
- Clients  
- Produits  
- Commandes  
- Factures  

Pour chaque entité, les fonctionnalités suivantes sont disponibles :
- Ajout d’un élément via un formulaire
- Affichage sous forme de tableau
- Modification des données
- Suppression avec confirmation
- Consultation des détails
- Export des données (CSV / PDF)
#  Dashboard
Le tableau de bord affiche :
- Le nombre total d’utilisateurs
- Le nombre de clients
- Les commandes en attente
- Le chiffre d’affaires
- Les factures payées et impayées

Il contient au moins 5 graphiques, par exemple :
- Bar chart
- Pie chart
- Line chart
- Doughnut chart
- Histogram

Les graphiques sont réalisés à l’aide de la bibliothèque Chart.js.


# Technologies Utilisées
- HTML5  
- CSS3  
- JavaScript

# Bibliothèques
- Bootstrap / Tailwind CSS (design et responsive)
- Chart.js (graphiques)
- jQuery (manipulation du DOM)

#  Interface Utilisateur
- Interface responsive (mobile, tablette, ordinateur)
- Menu latéral pour la navigation
- Barre de navigation avec bouton de déconnexion
- Page de connexion avec un utilisateur statique :
  - Login : admin
  - Mot de passe : admin
- Support de plusieurs langues :
  - Français
  - Anglais
  - Arabe
