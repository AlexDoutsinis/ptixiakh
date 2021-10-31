const mongoose = require('mongoose');

// get product model
const Product = require('../models/product');

const orderedProducts = module.exports = mongoose.model('ordered-products', new mongoose.Schema({

  sales: {
    type: Number,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }

}))


