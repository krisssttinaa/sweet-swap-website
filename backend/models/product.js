const db = require('../config/db');

const Product = {
  async getAllProducts() {
    const [rows] = await db.query('SELECT * FROM "Product"');
    return rows;
  },

  async getProductById(id) {
    const [rows] = await db.query('SELECT * FROM "Product" WHERE product_id = $1', [id]);
    return rows; // array
  },

  async createProduct({ name, description, price, brand, shop }) {
    const [rows] = await db.query(
      'INSERT INTO "Product" ("name", description, price, brand, shop) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING product_id',
      [name, description, price, brand, shop]
    );
    return rows[0].product_id;
  },

  async deleteProduct(id) {
    await db.query('DELETE FROM "Product" WHERE product_id = $1', [id]);
    return true;
  }
};

module.exports = Product;
