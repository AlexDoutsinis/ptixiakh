const express = require("express");
const router = express.Router();

// get product model
const Product = require("../models/product");

// get req to sort by lowest price
router.get("/lowest", async (req, res) => {
  const products = await Product.find().sort({ price: -1 });

  res.render("all-products", {
    title: "Descending Order For All Products Category",
    products
  });
});

// get req to sort by highest price
router.get("/highest", async (req, res) => {
  const products = await Product.find().sort({ price: 1 });

  res.render("all-products", {
    title: "Ascending Order For All Products Category",
    products
  });
});

// exports
module.exports = router;
