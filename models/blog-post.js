const mongoose = require('mongoose');

// blog post shcema
BlogPostSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  image: {
    type: String
  },

  date: {
    type: Date,
    default: Date.now()
  },

  faker: {
    type: String,
    default: 'NO'
  }

});

const blogPost = module.exports = mongoose.model('blogpost', BlogPostSchema);