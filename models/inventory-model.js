const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

module.exports = { getClassifications };

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */

async function getClassificationNameById(classification_id) {
  // Returns the classification name even if no inventory items are found
  try {
    const result = await pool.query(
      "SELECT classification_name FROM classification WHERE classification_id = $1",
      [classification_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getClassificationNameById error: " + error);
    return null;
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ********************************
 * Get details of Inventory
 * ******************************** */
async function getInventoryDetails(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryDetails error " + error);
  }
}

async function addInventory(data) {
  const sql = `
    INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;
  const values = [
    data.inv_make,
    data.inv_model,
    data.inv_year,
    data.inv_description,
    data.inv_image,
    data.inv_thumbnail,
    data.inv_price,
    data.inv_miles,
    data.inv_color,
    data.classification_id,
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rowCount;
  } catch (err) {
    console.error("Error inserting inventory", err);
    return null;
  }
}

async function addClassification(data) {
  const sql = `
    INSERT INTO classification (classification_name)
    VALUES ($1)
  `;
  const values = [data.classification_name];
  try {
    const result = await pool.query(sql, values);
    return result.rowCount;
  } catch (err) {
    console.error("Error inserting classification", err);
    return null;
  }
}
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryDetails,
  addInventory,
  addClassification,
  getClassificationNameById,
};
