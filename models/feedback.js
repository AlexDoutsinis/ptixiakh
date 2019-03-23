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
  },

  approved: {
    type: Boolean,
    default: false
  }
});

const Feedback = (module.exports = mongoose.model("feedback", FeedbackSchema));
