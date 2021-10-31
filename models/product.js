const mongoose = require('mongoose');

// product schema
ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  slug: {
    type: String,
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  price: {
    type: Number
  },

  availability: {
    type: String
  },

  image: {
    type: String
  },

  sales: {
    type: Number,
    default: 0
  },

  quantity: {
    type: Number,
    required: true
  }

});

const product = module.exports = mongoose.model('product', ProductSchema);