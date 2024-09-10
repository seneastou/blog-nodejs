const express = require("express");
const bodyParser = require("body-parser");
const router = express();
const port = 8080;
const query = require("./db.js");
const  argon2  =  require ( 'argon2' ) ;
const e = require("express");

// middleware bodyparser
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.send("Hello world");
});

function checkPassword(motDePasse) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(motDePasse);
 }

// Création d'un utilisateur avec hachage de mot de passe
router.post("/users", async (req, res) => { 
  const { email, password, username } = req.body;

  // Validation des champs obligatoires
  if (!email || !password) {
    return res.status(400).send("L'email et le mot de passe sont obligatoires");
  } else if (email.length < 2 || email.length > 25) {
    return res.status(400).send("L'email doit contenir entre 2 et 25 caractères");
  }  else if (password.length < 6) {
    return res.status(400).send("Le mot de passe doit contenir au moins 6 caractères");
  } else if (username.length < 2 || username.length > 25) {
    return res.status(400).send("Le nom d'utilisateur doit contenir entre 2 et 25 caractères");
  } 
  else if (!checkPassword(password)) {
    return res.status(400).send("Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial");
  }

  try {
    // Vérification si l'utilisateur existe déjà
    const userExists = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rowCount > 0) {
      return res.status(409).send("Cet utilisateur existe déjà");
    }

    // Hachage du mot de passe avec argon2
    const hashedPassword = await argon2.hash(password);

    // Insertion de l'utilisateur avec le mot de passe haché
    const result = await query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    return res.status(201).send(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err);
    
  }
});

// Endpoint pour la connexion d'un utilisateur
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("L'email et le mot de passe sont obligatoires");
  } 

  try {
    // Recherche de l'utilisateur par email 
    const user = await query("SELECT * FROM users WHERE email = $1," [email]);

    if (user.rowCount === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Vérification du mot de passe avec argon2
    const validPassword = await argon2.verify(user.rows[0].password, password);

    if (!validPassword) {
      return res.status(401).send("Mot de passe incorrect");
    }

    return res.status(200).send("Connexion réussie");
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
  }
});



// Récupérer tous les articles
router.get("/articles", async (req, res) => {
  try {
    const result = await query(`SELECT * FROM articles`);
    
    // Si aucun article n'est trouvé
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aucun article trouvé" });
    }
    
    // Retourner les articles si trouvés
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des articles:", err);
  }
});


// Créer un nouvel article
router.post("/articles", async (req, res) => {
  const { title, content } = req.body;

  // Validation des champs obligatoires
  if (!title || !content) {
    return res.status(400).json({ message: "Le titre et le contenu sont obligatoires" });
  } else if (title.length < 5 || title.length > 100) {
    return res.status(400).json({ message: "Le titre doit contenir entre 5 et 100 caractères" });
  } else if (content.length < 10) {
    return res.status(400).json({ message: "Le contenu doit contenir au moins 10 caractères" });
  }

  try {
    // Insertion de l'article dans la base de données
    const result = await query(
      "INSERT INTO articles (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    
    // Retourner l'article créé avec un statut 201 (Created)
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la création de l'article:", err);
  }
});


router.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});