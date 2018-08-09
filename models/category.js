const mongoose = require('mongoose');

// category shcema
CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  slug: {
    type: String,
  }

});

const page = module.exports = mongoose.model('category', CategorySchema);