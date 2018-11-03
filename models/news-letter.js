const mongoose = require("mongoose");

NewsLetterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  }
});

const newsLetter = (module.exports = mongoose.model(
  "news-letter",
  NewsLetterSchema
));
