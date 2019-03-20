const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now()
  }
});

const Feedback = (module.exports = mongoose.model("feedback", FeedbackSchema));
