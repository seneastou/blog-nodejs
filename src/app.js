const express = require("express");
const bodyParser = require("body-parser");
const argon2 = require("argon2");
const query = require("./db.js");
const router = express();
const cors = require("cors");
const port = 8080;

// Middleware body-parser pour traiter les requêtes JSON
router.use(bodyParser.json());
router.use('/images', express.static('public/image'));
router.use(cors());

// Fonction pour valider l'adresse e-mail
function checkEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour valider le mot de passe
function checkPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password);
}

// get all users
router.get("/users", async (req, res) => {
  const result = await query("SELECT * FROM users");
  try {
    if (result.rowCount === 0) {
      return res.status(404).send("No user found");
    } else {
      return res.send(result.rows);
    }
  } catch (err) {
    console.log(err);
  }
});

// Route pour l'inscription
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .send(
        "L'email, le nom d'utilisateur et le mot de passe sont obligatoires"
      );
  } else if (!checkEmail(email)) {
    return res.status(400).send("Adresse e-mail invalide");
  } else if (!checkPassword(password)) {
    return res
      .status(400)
      .send(
        "Le mot de passe doit contenir au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial"
      );
  }

  try {
    const userExists = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rowCount > 0) {
      return res.status(409).send("L'utilisateur existe déjà");
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = await query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, username]
    );

    return res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour la connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("L'email et le mot de passe sont obligatoires");
  } else if (!checkEmail(email)) {
    return res.status(400).send("Adresse e-mail invalide");
  } else if (!checkPassword(password)) {
    return res.status(400).send("Le mot de passe est invalide");
  }

  try {
    const user = await query("SELECT password FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    const validPassword = await argon2.verify(user.rows[0].password, password);
    if (!validPassword) {
      return res.status(400).send("Mot de passe incorrect");
    }

    return res.status(200).send("Connexion réussie");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour créer un article
router.post("/articles", async (req, res) => {
  const { title, content, image, author } = req.body;

  if (!title || !content || !author || !image) {
    return res
      .status(400)
      .send("Le titre, le contenu, l'auteur et l'image sont obligatoires");
  }
  try {
    const userExists = await query("select id from users where username = $1", [
      author,
    ]);
    if (userExists.rowCount === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    } else {
      const result = await query(
        "INSERT INTO articles (id_user, title, content, image) VALUES ($1, $2, $3, $4) RETURNING *",
        [userExists.rows[0].id, title, content, image]
      );
      return res.status(201).send(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
  }
});

// Route pour récupérer tous les articles
router.get("/articles", async (req, res) => {
  try {
    const result = await query(`
      SELECT a.id, a.image, a.title, a.date_post, u.username AS author 
      FROM articles a
      JOIN users u ON a.id_user = u.id
    `);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aucun article trouvé" });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des articles:", err);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Route pour récupérer un article spécifique par son ID
router.get("/articles/:id", async (req, res) => {
  const { id } = req.params;

  // Vérification de base pour s'assurer que l'ID est un nombre entier
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const result = await query(
      `
      SELECT image, title, date_post, users.username AS author, content
      FROM articles
      JOIN users ON articles.id_user = users.id
      WHERE articles.id = $1
    `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'article:", err);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Démarrer le serveur
router.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
