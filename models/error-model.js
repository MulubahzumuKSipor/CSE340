const database = require("../database/");

async function trigger500Error() {
  try {
    // Intentionally cause an error by querying a non-existent table
    await database.query("SELECT * FROM non_existent_table");
  } catch (error) {
    console.error("Error in trigger500Error:", error);
    throw error;
  }
}

module.exports = {
  trigger500Error,
};
