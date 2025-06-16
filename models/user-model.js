const pool = require("../database/index");

async function getAllAccounts() {
  try {
    const accounts = await pool.query(
      "SELECT account_first_name, account_last_name, account_email, account_type FROM account"
    );
    return accounts.rows;
  } catch (error) {
    console.error("Get all Users error " + error);
  }
}

module.exports = { getAllAccounts };
