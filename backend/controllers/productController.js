const Product = require('../models/product');

exports.getAllProducts = async (_req, res) => {
  try {
    const rows = await Product.getAllProducts();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const rows = await Product.getProductById(req.params.id);
    if (!rows.length) return res.status(404).json({ msg: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, brand, shop } = req.body; // name (not product_name)
  try {
    const id = await Product.createProduct({ name, description, price, brand, shop });
    res.json({ product_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};