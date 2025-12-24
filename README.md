# ProfessionalSocialNetwork – Web Application (3 Weeks Project)

## 📌 Description
**ProfessionalSocialNetwork** est une application web inspirée des réseaux professionnels comme LinkedIn.
Elle permet aux utilisateurs de s’inscrire, se connecter, gérer leur profil et interagir via un fil d’actualité.

Le projet est réalisé par une équipe de 3 développeurs, avec une organisation orientée interfaces afin d’optimiser le temps de développement.
Chaque membre est responsable d’une interface complète (HTML, CSS, JavaScript et intégration back-end).
---

## 🚀 Fonctionnalités principales
- 🔐 Authentification (Inscription & Connexion)

- 👤 Profil utilisateur (affichage et mise à jour)

- 📰 Fil d’actualité (Feed)

- ✍️ Création de publications

- 👍 Likes

- 💬 Commentaires

- 📱 Interface responsive (Bootstrap)
---

## 🛠️ Technologies utilisées

### **Front-end**
- HTML5
- CSS3
- Bootstrap
- JavaScript

### **Back-end**
- Node.js + Express  
- JSON Web Tokens (JWT)  

### **Base de données**
- MongoDB + Mongoose  

### **Outils**
- Git / GitHub  
- Postman  
- VS Code  
---

## 🗂️ Architecture du projet
```
ProfessionalSocialNetwork
│
├── public/                 # Front-end
│   ├── pages/              # login.html, signup.html, profile.html, feed.html
│   ├── css/                # styles Bootstrap personnalisés
│   ├── js/                 # login.js, signup.js, profile.js, feed.js
│
├── server/
│   ├── routes/             # Routes API
│   ├── controllers/        # Logique métier
│   ├── models/             # Schémas MongoDB
│   ├── middleware/         # Auth middleware
│   └── app.js
│
├── .env
└── README.md
```

---
# 🗓️ Planning du projet
### Phase 1 – Initialisation

Configuration Node.js & Express

Connexion à MongoDB

Mise en place de l’authentification

Structure du projet

### Phase 2 – Développement des interfaces

Login & Signup

Profil utilisateur

Feed (posts, likes, commentaires)

### Phase 3 – Finalisation

Intégration Front / Back

Gestion des erreurs

Responsive design

Tests fonctionnels

Démonstration finale

# ▶️ Installation & exécution

## 1️⃣ Cloner le projet
```bash
git clone https://github.com/your-username/ProfessionalSocialNetwork.git
cd ProfessionalSocialNetwork
```

## 2️⃣ Installer les dépendances

### Front-end
```bash
cd client
npm install
```

### Back-end
```bash
cd server
npm install
```

## 3️⃣ Configurer l'environnement

Créer un fichier `.env` dans `server/` :

```env
MONGO_URI=your_mongo_cluster_url
JWT_SECRET=your_secret_key
PORT=5000
```

## 4️⃣ Lancer le projet

### Back-end
```bash
cd server
npm run dev
```

### Front-end
```bash
cd client
npm start
```

---

## 📘 Documentation API (exemple)

### Authentification
- `POST /auth/register`
- `POST /auth/login`

### Utilisateurs
- `GET    /users/:id`
- `PUT    /users/:id`

### Posts
- `GET    /posts`
- `POST   /posts`
- `PUT    /posts/:id`
- `DELETE /posts/:id`

### Connexions
- `POST /connections/send/:id`
- `POST /connections/accept/:id`
- `GET  /connections/me`

---

## 🎥 Démonstration finale

La démo comprend :

- création de compte
- connexion
- édition du profil
- création d'un post
- like / commentaire
- gestion des connexions
- navigation sur le feed

---

## 📄 Licence

Projet académique – utilisation pédagogique uniquement.
