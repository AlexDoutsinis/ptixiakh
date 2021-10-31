const mongoose = require("mongoose");

// custom orders schema
CostumOrderSchema = new mongoose.Schema({
  productImage: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now()
  },

  costumerName: {
    type: String,
    required: true
  },

  costumerEmail: {
    type: String,
    required: true
  }
});

const costumOrder = (module.exports = mongoose.model(
  "costum-order",
  CostumOrderSchema
));
