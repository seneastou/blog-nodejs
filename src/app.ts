import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import argon2 from "argon2";
import cors from "cors";
import path from "path";
import { query } from "./db.js";

const app = express();
const port = 8080;

// Middleware
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, '../public/image')));
app.use(cors());
app.use(express.static(path.join(__dirname, '../Pages')));
app.use('/styles', express.static(path.join(__dirname, '../public/CSS')));


function checkEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkPassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password);
}

// Route : récupérer tous les utilisateurs
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM users");
    if (result.rowCount === 0) {
      return res.status(404).send("No user found");
    }
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// Route : inscription
app.post("/register", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).send("Email, username, and password are required");
  }

  if (!checkEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!checkPassword(password)) {
    return res
      .status(400)
      .send("Password must include uppercase, lowercase, digit, and special character");
  }

  try {
    const userExists = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rowCount && userExists.rowCount > 0) {
      return res.status(409).send("User already exists");
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = await query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, username]
    );

    return res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route : connexion
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const user = await query("SELECT password FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      return res.status(404).send("User not found");
    }

    const validPassword = await argon2.verify(user.rows[0].password, password);
    if (!validPassword) {
      return res.status(400).send("Incorrect password");
    }

    return res.status(200).send("Login successful");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route : créer un article
app.post("/articles", async (req: Request, res: Response) => {
  const { title, content, image, author } = req.body;

  if (!title || !content || !author || !image) {
    return res.status(400).send("Title, content, author, and image are required");
  }

  try {
    
    const userExists = await query("SELECT id FROM users WHERE username = $1", [
      author,
    ]);
    if (userExists.rowCount === 0) {
      return res.status(404).send("Author not found");
    }
   

    const result = await query(
      "INSERT INTO articles (id_user, title, content, image, author) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userExists.rows[0].id, title, content, image, author]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route : récupérer tous les articles
app.get("/articles", async (req: Request, res: Response) => {
  try {
    const result = await query(
      "SELECT a.id, a.image, a.title, a.date_post, u.username AS author FROM articles a JOIN users u ON a.id_user = u.id"
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No articles found" });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route : récupérer un article par ID
app.get("/articles/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid article ID" });
  }

  try {
    const result = await query(
      "SELECT image, title, date_post, u.username AS author, content FROM articles a JOIN users u ON a.id_user = u.id WHERE a.id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../Pages/accueil/index.html"));
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
