const db = require('../config/db');

const Product = {
  // --- Low-level DAO methods ---

  async getAllProducts() {
    const [rows] = await db.query('SELECT * FROM "Product"');
    return rows;
  },

  async getProductById(id) {
    const [rows] = await db.query(
      'SELECT * FROM "Product" WHERE product_id = $1',
      [id]
    );
    return rows; // array
  },

  async createProductRaw({ name, description, price, brand, shop }) {
    const [rows] = await db.query(
      'INSERT INTO "Product" ("name", description, price, brand, shop) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING product_id',
      [name, description, price, brand, shop]
    );
    return rows[0].product_id;
  },

  async deleteProductRaw(id) {
    await db.query(
      'DELETE FROM "Product" WHERE product_id = $1',
      [id]
    );
    return true;
  },

  // --- Business logic methods used by controllers ---
  async getProductDetails(id) {
    const rows = await this.getProductById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }
    return { success: true, product: rows[0] };
  },

  async createProductWithValidation({ name, description, price, brand, shop }) {
    // simple business rules
    if (!name || price == null) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return { success: false, error: 'INVALID_INPUT' };
    }

    const product_id = await this.createProductRaw({
      name,
      description: description || null,
      price: numericPrice,
      brand: brand || null,
      shop: shop || null
    });

    return { success: true, product_id };
  },

  async deleteProductIfExists(id) {
    const rows = await this.getProductById(id);
    if (!rows.length) {
      return { success: false, error: 'NOT_FOUND' };
    }

    await this.deleteProductRaw(id);
    return { success: true };
  }
};

module.exports = Product;