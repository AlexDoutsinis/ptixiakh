const mongoose = require("mongoose");

// blog post schema
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
  }
});

const blogPost = (module.exports = mongoose.model("blogpost", BlogPostSchema));
