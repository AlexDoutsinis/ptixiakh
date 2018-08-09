const express = require('express');
const router = express.Router();

// get product model
const Product = require('../models/product');


// get req to most popular products
router.get('/', async (req, res) => {

  const products = await Product.find().sort({ sales: -1 }).limit(4)

  res.render('all-products', {
    title: 'Most Popular Products',
    products
  });
})

// exports
module.exports = router;