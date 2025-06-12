                    Blog Node.js

Un projet de blog développé avec Node.js, TypeScript, Express, PostgreSQL et pgAdmin, avec gestion des utilisateurs et des articles. Le tout est conteneurisé avec Docker. 
J'ai implémenté un modèle CRUD (Create, Read, Update, Delete) complet pour gérer les utilisateurs dans une application avec Express. Ce modèle permet de créer, lire, mettre à jour et supprimer des utilisateurs, en suivant des bonnes pratiques de développement, notamment en matière de sécurité et de gestion des erreurs.

j'ai mis en place des composants d'accès aux données permettant une interaction fluide entre l'application et la base de données. Ces composants ont été conçus pour exécuter les opérations CRUD de manière efficace et sécurisée via le package pg.

J'ai configuré un pool de connexions dans un fichier dédié (db.ts), garantissant une gestion optimisée des connexions multiples.



---

  Fonctionnalités

-  Authentification : inscription et connexion des utilisateurs
-  Création, affichage et récupération d’articles
-  Base de données PostgreSQL
-  Déploiement local via Docker + pgAdmin
-  Interface front-end simple avec pages statiques

---

  Structure du projet


blog-nodejs/
│
├── src/                  Code source (TypeScript)
│   ├── app.ts            Point d’entrée de l’application
│   └── db.ts             Connexion à PostgreSQL
│
├── Pages/                Pages front-end HTML
│   ├── accueil/
│   ├── article/
│   ├── create-article/
│   ├── login/
│   └── register/
│
├── public/                Ressources statiques (CSS, images)
│
├── dist/                  Code compilé en JavaScript
│
├── docker-compose.yml     Configuration Docker
├── package.json
├── tsconfig.json
└── README.md


---

  Installation et utilisation

  1. Cloner le dépôt

```bash
git clone https://github.com/seneastou/blog-nodejs.git
cd blog-nodejs
```

 2. Lancer les services avec Docker

```bash
docker-compose up -d
```

- PostgreSQL sera disponible sur le port `5432`
- pgAdmin sera accessible sur : [http://localhost:5050](http://localhost:5050)

 Une fois dans pgAdmin, ajoute un serveur avec :
- **Nom** : `blog`
- **Host** : `db`
- **Port** : `5432`
- **Username** : `postgres`
- **Password** : `Scorpion`

 3. Installer les dépendances

```bash
npm install
```
 4. Compiler le code TypeScript

```bash
npm run build
```

 5. Lancer l’application

```bash
npm start
```

 L’application sera accessible sur : [http://localhost:8080](http://localhost:8080)

---

 Variables par défaut

Dans `docker-compose.yml` :
```yaml
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Scorpion
POSTGRES_DB=blog
```

---

 Routes API

- `POST /register` – Inscription utilisateur
- `POST /login` – Connexion utilisateur
- `GET /users` – Liste des utilisateurs
- `POST /articles` – Création d’un article
- `GET /articles` – Liste des articles
- `GET /articles/:id` – Article par ID

---

 Auteur

Projet réalisé par Astou Fall SENE 
