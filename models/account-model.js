const pool = require("../database/index");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_first_name,
  account_last_name,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_first_name, account_last_name, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Admin') RETURNING *";
    return await pool.query(sql, [
      account_first_name,
      account_last_name,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Check for existing email
 * *************************** */
async function checkExistingEmail(account_email) {
  try {
    const email = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [account_email]
    );
    return email.rowCount > 0;
  } catch (error) {
    console.error("Error getting account by email:", error.message);
    throw new Error("Database query failed.");
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_first_name, account_last_name, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_first_name, account_last_name, account_email, account_type, account_password FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching ID found");
  }
}

async function updateAccount(first, last, email, id) {
  return await pool.query(
    "UPDATE account SET account_first_name=$1, account_last_name=$2, account_email=$3 WHERE account_id=$4",
    [first, last, email, id]
  );
}

async function updatePassword(hash, id) {
  return await pool.query(
    "UPDATE account SET account_password=$1 WHERE account_id=$2",
    [hash, id]
  );
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
