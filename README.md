# ProfessionalSocialNetwork – Web Application (3 Weeks Project)

## 📌 Description
**ProfessionalSocialNetwork** est une application web inspirée des plateformes professionnelles comme LinkedIn.  
Elle permet aux utilisateurs de créer un profil, partager des publications, interagir via un fil d’actualité et gérer leur réseau professionnel.

Ce projet a été réalisé en **3 semaines** par une équipe de **3 développeurs**, en s'appuyant sur l’expérience d’un précédent projet Java/JavaFX, ce qui a permis de réduire la phase de conception.

---

## 🚀 Fonctionnalités principales
- 🔐 Authentification (inscription, connexion via JWT)  
- 👤 Gestion de profil (photo, bio, compétences, expérience)  
- 📰 Fil d’actualité (posts avec texte ou image)  
- 👍 Likes & commentaires  
- 🤝 Réseau (envoi et acceptation de connexions)  
- 📱 Interface responsive  

---

## 🛠️ Technologies utilisées

### **Front-end**
- React  
- React Router  
- Axios  
- CSS / Tailwind CSS *(optionnel)*  

### **Back-end**
- Node.js + Express  
- JSON Web Tokens (JWT)  
- Multer *(pour upload photo si nécessaire)*  

### **Base de données**
- MongoDB + Mongoose  

### **Outils**
- Git / GitHub  
- Postman  
- Trello / Notion  
- VS Code  
- Figma (maquettes simples)  

---

## 🗂️ Architecture du projet
```
/client              → Front-end React
/server              → Back-end Node.js + Express
/server/routes       → Routes API
/server/controllers → Logique métier
/server/models       → Schémas MongoDB (User, Post, Connection)
.env                 → Variables d'environnement
README.md
```

---

# 🗓️ Planning du projet (3 semaines)

### 👥 Répartition de l’équipe
- **Dev A – Back-end**
- **Dev B – Front-end**
- **Dev C – Base de données + intégration + tests**

---

## 🔵 Semaine 1 – Initialisation & Fondations

### Dev A (Back-end)
- Setup Node.js + Express  
- Authentification (register/login + JWT)  
- Middleware d’authentification  

### Dev B (Front-end)
- Création projet React  
- Pages Login & Register  
- Routing + connexion API  

### Dev C (BDD & intégration)
- Modèles Mongoose (User, Post, Connection)  
- Configuration MongoDB + .env  
- Tests initiaux API via Postman  

---

## 🔵 Semaine 2 – Fonctionnalités principales

### Dev A (Back-end)
- CRUD Profil  
- CRUD Posts  
- Routes Connexions (envoyer / accepter)  

### Dev B (Front-end)
- Page Profil  
- Page Feed  
- Composants : PostCard, Navbar  
- Formulaire création de post  

### Dev C (Intégration)
- Intégration front/back (axios)  
- Ajustements BD  
- Debug & cohérence data  

---

## 🔵 Semaine 3 – Finalisation & Qualité

### Dev A (Back-end)
- Ajout likes & commentaires  
- Pagination du feed  
- Documentation API  

### Dev B (Front-end)
- Responsive design  
- UI/UX final  
- Intégration like + commentaire  

### Dev C (Tests & Déploiement)
- Tests fonctionnels  
- Gestion erreurs front/back  
- Préparation de la démo  
- (Optionnel) Déploiement :
  - Front → Vercel  
  - Back → Render  
  - DB → MongoDB Atlas  

---

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
