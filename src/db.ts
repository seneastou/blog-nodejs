import dotenv from "dotenv";
import { Pool, QueryResult, QueryResultRow } from "pg";

dotenv.config({ path: ".secrets" });

const pool = new Pool({
  user: "postgres",
  password: "Scorpion",
  host: "localhost",
  port: 5432,
  database: "blog",
});

// Fonction de requête à la base de données
export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>>{
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("Erreur lors de l'exécution de la requête :", err);
    throw err; 
  }
}
