const Product = require('../models/product');

exports.getAllProducts = async (_req, res) => {
  try {
    const rows = await Product.getAllProducts();
    res.json(rows);
  } catch (err) {
    console.error('getAllProducts controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const result = await Product.getProductDetails(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Product not found' });
      }
      console.error('getProductById model error:', result.error);
      return res.status(500).json({ msg: 'Could not fetch product' });
    }

    res.json(result.product);
  } catch (err) {
    console.error('getProductById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, brand, shop } = req.body;

  try {
    const result = await Product.createProductWithValidation({
      name,
      description,
      price,
      brand,
      shop
    });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Invalid product data' });
      }
      console.error('createProduct model error:', result.error);
      return res.status(500).json({ msg: 'Could not create product' });
    }

    res.status(201).json({ product_id: result.product_id });
  } catch (err) {
    console.error('createProduct controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteProductIfExists(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Product not found' });
      }
      console.error('deleteProduct model error:', result.error);
      return res.status(500).json({ msg: 'Could not delete product' });
    }

    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct controller error:', err);
    res.status(500).send('Server error');
  }
};