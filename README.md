# ProfessionalSocialNetwork – Carrers Web Application 

## Description
c'est une application web inspirée de réseau professionnel LinkedIn.
Elle permet aux utilisateurs de s’inscrire (register), se connecter(login), gérer leurs profils et interagir via un fil d’actualité, créer un réseau et postuler ou publier des posts.

Le projet est réalisé par nous  trois , avec une organisation orientée interfaces afin d’optimiser le temps de développement.
Chaque membre est responsable d’une interface complète (HTML, CSS, JavaScript et intégration back-end).
---

## Fonctionnalités principales
- **Authentification** : Inscription, Connexion, Vérification d'email
- **Profil utilisateur** : Affichage, édition, gestion des expériences, éducation, compétences, certifications
- **Profil entreprise** : Création et gestion de profils d'entreprise
- **Fil d'actualité (Feed)** : Affichage des posts, suggestions d'utilisateurs et offres d'emploi
- **Publications** : Création de posts (texte, image, vidéo, article, événement), likes et commentaires
- **Réseau professionnel** : Suggestions de connexions, invitations, gestion des connexions
- **Offres d'emploi** : Création, édition, suppression d'offres d'emploi, postulation
- **Candidatures** : Gestion des candidatures, mise à jour du statut (Accepté, En entretien, Rejeté)
- **Recherche globale** : Recherche de profils, offres d'emploi et entreprises
- **Notifications** : Système de notifications pour connexions, candidatures et mises à jour
---

## Technologies utilisées

### **Front-end**
- HTML
- CSS
- Bootstrap
- JavaScript

### **Back-end**
- Node.js + Express  
- Express Session (pour l'authentification)
- Multer (pour l'upload de fichiers)  

### **Base de données**
- MongoDB + Mongoose  

### **Outils**
- Git / GitHub  
- VS Code  
- bootstrap icons
---

## Architecture du projet
```
ProfessionalSocialNetwork
│
├── public/                      # Front-end
│   ├── pages/                   # Pages HTML
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── acceuil.html         # Page d'accueil (feed)
│   │   ├── myProfile.html       # Profil utilisateur
│   │   ├── otherProfile.html    # Profil d'autres utilisateurs
│   │   ├── network.html         # Réseau professionnel
│   │   ├── companyProfile.html  # Profil entreprise
│   │   ├── otherCompanyProfile.html
│   │   ├── createCompany.html
│   │   ├── settings.html
│   │   └── navbar.html
│   ├── css/                     # Styles personnalisés
│   │   ├── style.css
│   │   ├── acceuil.css
│   │   ├── network.css
│   │   └── profile_style.css
│   ├── js/                      # Scripts JavaScript
│   │   ├── login.js
│   │   ├── acceuil.js
│   │   ├── myProfile.js
│   │   ├── otherProfile.js
│   │   ├── network.js
│   │   ├── navbar.js
│   │   ├── notifications.js
│   │   ├── searchResults.js
│   │   └── imageUtils.js
│   ├── jq/                      # Scripts jQuery
│   │   ├── register.js
│   │   ├── createCompany.js
│   │   └── job_post.js
│   ├── images/                  # Images statiques
│   └── uploads/                 # Fichiers uploadés
│
├── server/
│   ├── routes/                  # Routes API
│   │   ├── authRoute.js
│   │   ├── profileRoutes.js
│   │   ├── postRoutes.js
│   │   ├── networkRoutes.js
│   │   ├── postJobRoutes.js
│   │   ├── jobApplicationRoutes.js
│   │   ├── companyRoute.js
│   │   ├── companyProfileRoutes.js
│   │   ├── otherProfileRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── searchRoutes.js
│   │   └── notificationRoutes.js
│   ├── controllers/             # Logique métier
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── postController.js
│   │   ├── networkController.js
│   │   ├── jobPostController.js
│   │   ├── jobApplicationController.js
│   │   ├── createCompanyController.js
│   │   ├── companyProfileController.js
│   │   ├── otherProfileController.js
│   │   ├── settingsController.js
│   │   ├── searchController.js
│   │   └── notificationController.js
│   ├── models/                  # Schémas MongoDB
│   │   ├── Employees.js
│   │   ├── post.js
│   │   ├── connection.js
│   │   ├── jobSchema.js
│   │   ├── jobApplicationSchema.js
│   │   ├── companySchema.js
│   │   └── notificationSchema.js
│   ├── middleware/              # Middleware
│   │   └── upload.js            # Configuration Multer
│   ├── database.js              # Configuration MongoDB
│   └── app.js                   # Point d'entrée Express
│
├── views/                       # Templates EJS
│   ├── job_post.ejs
│   ├── jobOfferDetails.ejs
│   ├── applicants-list.ejs
│   ├── searchResults.ejs
│   └── notifications.ejs
│
├── .env                         # Variables d'environnement
├── package.json
└── README.md
```

---


# Installation & exécution

## 1- Cloner le projet
```bash
git clone https://github.com/Nour177/ProfessionalSocialNetwork.git
cd ProfessionalSocialNetwork
```

## 2- Installer les dépendances
```bash
npm install
```

## 3- Configurer l'environnement

Créer un fichier `.env` dans `server/` :

```env
MONGO_URI=your_mongo_cluster_url
JWT_SECRET=your_secret_key
PORT=3000
RECAPTCHA_SECRET_KEY = captcha key
```

## 4- Lancer le projet

### Back-end
```bash

npm start
```

---

## Documentation API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/login` | Redirige vers la page de connexion |
| `GET` | `/register` | Redirige vers la page d'inscription |
| `POST` | `/register` | Inscription d'un nouvel utilisateur (avec upload d'image) |
| `POST` | `/login` | Connexion d'un utilisateur |
| `POST` | `/check-email` | Vérifie si un email existe déjà |

### Profil Utilisateur
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/myProfile` | Redirige vers la page de profil |
| `GET` | `/api/myProfile` | Récupère les données du profil utilisateur |
| `PUT` | `/edit/editInfos` | Met à jour la description du profil |
| `PUT` | `/edit/addExperience` | Ajoute une expérience professionnelle |
| `PUT` | `/edit/editExperience` | Modifie une expérience |
| `DELETE` | `/edit/deleteExperience` | Supprime une expérience |
| `PUT` | `/edit/addEducation` | Ajoute une formation |
| `PUT` | `/edit/editEducation` | Modifie une formation |
| `DELETE` | `/edit/deleteEducation` | Supprime une formation |
| `PUT` | `/edit/addSkill` | Ajoute une compétence |
| `DELETE` | `/edit/deleteSkill` | Supprime une compétence |
| `PUT` | `/edit/addCertification` | Ajoute une certification |
| `PUT` | `/edit/editCertification` | Modifie une certification |
| `DELETE` | `/edit/deleteCertification` | Supprime une certification |

### Profils Autres Utilisateurs
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/otherProfile` | Redirige vers la page de profil d'un autre utilisateur |
| `GET` | `/api/profile` | Récupère les données d'un profil (par email ou ID) |
| `GET` | `/profile/:id` | Redirige vers le profil d'un utilisateur par ID |

### company
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/company/create-company` | Redirige vers la page de création d'entreprise |
| `POST` | `/company/create-company` | Crée une nouvelle entreprise (avec upload de logo) |
| `GET` | `/companyProfile` | Redirige vers la page de profil entreprise |
| `GET` | `/api/companies/admin/:adminId` | Récupère l'entreprise par ID administrateur |
| `GET` | `/api/companies/:id` | Récupère une entreprise par ID (API) |
| `GET` | `/company/:id` | Redirige vers le profil d'une entreprise |
| `PUT` | `/api/companies/description` | Met à jour la description de l'entreprise |
| `PUT` | `/api/companies/cover` | Met à jour l'image de couverture (upload) |
| `PUT` | `/api/companies/logo` | Met à jour le logo (upload) |
| `PUT` | `/api/companies/details` | Met à jour les détails de l'entreprise |

### posts
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/posts` | Récupère tous les posts |
| `GET` | `/api/posts/:id` | Récupère un post par ID |
| `POST` | `/api/posts` | Crée un nouveau post (avec upload d'image optionnel) |
| `PUT` | `/api/posts/:id` | Met à jour un post (avec upload d'image optionnel) |
| `DELETE` | `/api/posts/:id` | Supprime un post |
| `POST` | `/api/posts/:id/like` | Like/Unlike un post |
| `POST` | `/api/posts/:id/comment` | Ajoute un commentaire à un post |

### Network
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/network/suggestions` | Récupère les suggestions de connexions (max 5) |
| `GET` | `/api/network/invitations` | Récupère les invitations en attente |
| `GET` | `/api/network/connections` | Récupère les connexions acceptées |
| `POST` | `/api/network/connect` | Envoie une demande de connexion |
| `POST` | `/api/network/accept` | Accepte une demande de connexion |
| `POST` | `/api/network/decline` | Refuse une demande de connexion |

### jobs
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/jobs/api/jobs` | Récupère toutes les offres d'emploi |
| `GET` | `/jobs/post-job` | Affiche la page de création d'offre d'emploi |
| `POST` | `/jobs/post-job` | Crée une nouvelle offre d'emploi |
| `GET` | `/jobs/:id` | Affiche les détails d'une offre d'emploi |
| `GET` | `/jobs/edit/:id` | Affiche la page d'édition d'une offre |
| `POST` | `/jobs/update/:id` | Met à jour une offre d'emploi |
| `DELETE` | `/jobs/delete/:id` | Supprime une offre d'emploi |

### Job Applications
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/applications/apply` | Postule à une offre d'emploi |
| `GET` | `/applications/job/:jobId` | Récupère la liste des candidats pour un job |
| `POST` | `/applications/update-status` | Met à jour le statut d'une candidature |

### Recherche
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/search` | Affiche la page de résultats de recherche |
| `GET` | `/api/search` | Recherche globale (profils, jobs, entreprises) |

### Notifications
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/notifications` | Affiche la page des notifications |
| `GET` | `/api/notifications` | Récupère les notifications de l'utilisateur |
| `GET` | `/api/notifications/count` | Récupère le nombre de notifications non lues |
| `PUT` | `/api/notifications/:notificationId/read` | Marque une notification comme lue |
| `PUT` | `/api/notifications/read-all` | Marque toutes les notifications comme lues |

### Settings
| Méthode | Route | Description |
|---------|-------|-------------|
| `PUT` | `/api/settings/profile` | Met à jour les informations du profil |
| `PUT` | `/api/settings/profile-photo` | Met à jour la photo de profil (upload) |
| `PUT` | `/api/settings/cover-photo` | Met à jour la photo de couverture (upload) |
| `PUT` | `/api/settings/account` | Met à jour les informations du compte |
| `PUT` | `/api/settings/privacy` | Met à jour les paramètres de confidentialité |
| `PUT` | `/api/settings/profile-video` | Upload une vidéo de présentation (profil) |
| `PUT` | `/api/settings/company-video` | Upload une vidéo de présentation (entreprise) |

---

## Modèles de Données

### Employee (Utilisateur)
- Informations personnelles (nom, prénom, email, téléphone)
- Description, localisation
- Expériences professionnelles
- Formations
- Compétences
- Certifications
- Images (profil, couverture, vidéo)

### Post
- Auteur et avatar
- Type (texte, image, vidéo, article, événement)
- Contenu
- Likes et commentaires
- Timestamps

### Connection
- User1 et User2
- Statut (pending, accepted)
- RequestedBy
- Timestamps

### Job
- Titre, description, localisation
- Type (temps plein, temps partiel, etc.)
- Salaire
- Entreprise (référence)
- PostedBy (utilisateur)
- Timestamps

### JobApplication
- JobId (référence)
- ApplicantId (référence)
- Statut (Pending, Accepted, Interviewing, Rejected)
- Timestamps

### Company
- Nom, description, secteur
- Logo, image de couverture
- AdminId (utilisateur administrateur)
- Détails (site web, taille, etc.)
- Timestamps

### Notification
- Recipient (destinataire)
- Sender (expéditeur, optionnel)
- Type (connection_request, connection_accepted, job_application, etc.)
- Title, Message
- Link (lien de redirection)
- Read (lu/non lu)
- Metadata
- Timestamps

#### Types de Notifications
- **`connection_request`** : Demande de connexion reçue
- **`connection_accepted`** : Demande de connexion acceptée
- **`job_application`** : Nouvelle candidature ou mise à jour de statut
---


## Licence

Projet académique – utilisation pédagogique uniquement.
