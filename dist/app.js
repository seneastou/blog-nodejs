"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const argon2_1 = __importDefault(require("argon2"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_js_1 = require("./db.js");
const app = (0, express_1.default)();
const port = 8080;
// Middleware
app.use(body_parser_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, '../public/image')));
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../Pages')));
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '../public/CSS')));
function checkEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function checkPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    return regex.test(password);
}
// Route : récupérer tous les utilisateurs
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_js_1.query)("SELECT * FROM users");
        if (result.rowCount === 0) {
            return res.status(404).send("No user found");
        }
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }
}));
// Route : inscription
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userExists = yield (0, db_js_1.query)("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (userExists.rowCount && userExists.rowCount > 0) {
            return res.status(409).send("User already exists");
        }
        const hashedPassword = yield argon2_1.default.hash(password);
        const newUser = yield (0, db_js_1.query)("INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *", [email, hashedPassword, username]);
        return res.status(201).json(newUser.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Route : connexion
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }
    try {
        const user = yield (0, db_js_1.query)("SELECT password FROM users WHERE email = $1", [
            email,
        ]);
        if (user.rowCount === 0) {
            return res.status(404).send("User not found");
        }
        const validPassword = yield argon2_1.default.verify(user.rows[0].password, password);
        if (!validPassword) {
            return res.status(400).send("Incorrect password");
        }
        return res.status(200).send("Login successful");
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Route : créer un article
app.post("/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, image, author } = req.body;
    if (!title || !content || !author || !image) {
        return res.status(400).send("Title, content, author, and image are required");
    }
    try {
        const userExists = yield (0, db_js_1.query)("SELECT id FROM users WHERE username = $1", [
            author,
        ]);
        if (userExists.rowCount === 0) {
            return res.status(404).send("Author not found");
        }
        const result = yield (0, db_js_1.query)("INSERT INTO articles (id_user, title, content, image, author) VALUES ($1, $2, $3, $4, $5) RETURNING *", [userExists.rows[0].id, title, content, image, author]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Route : récupérer tous les articles
app.get("/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_js_1.query)("SELECT a.id, a.image, a.title, a.date_post, u.username AS author FROM articles a JOIN users u ON a.id_user = u.id");
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No articles found" });
        }
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}));
// Route : récupérer un article par ID
app.get("/articles/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid article ID" });
    }
    try {
        const result = yield (0, db_js_1.query)("SELECT image, title, date_post, u.username AS author, content FROM articles a JOIN users u ON a.id_user = u.id WHERE a.id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        return res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../Pages/accueil/index.html"));
});
// Démarrer le serveur
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
