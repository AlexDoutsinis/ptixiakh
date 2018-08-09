const mongoose = require('mongoose');

// user shcema
UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  username: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  admin: {
    type: Number
  }

});

const user = module.exports = mongoose.model('user', UserSchema);