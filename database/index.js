const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * SSL Object needed for production environment (e.g., Render)
 * No SSL for local development
 * *************** */

let pool;
if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local development (no SSL)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

// Export a query helper for better error handling and logging
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error: error.message });
      throw error;
    }
  },
};
