const express = require("express");
const router = express.Router();

// get product model
const Product = require("../models/product");

// get auth
const { isUser } = require("../config/auth");

// get req add product to cart
router.get("/add/:product", isUser, (req, res) => {
  let slug = req.params.product;

  Product.findOne({ slug: slug })
    .then(product => {
      if (product.availability == "OFF") {
        req.flash("danger", "Product is not available");
        res.redirect("/products");
      } else {
        if (typeof req.session.cart == "undefined") {
          // if its first product
          req.session.cart = [];

          req.session.cart.push({
            title: slug,
            quantity: 1,
            price: parseFloat(product.price).toFixed(2),
            image: "/product-images/" + product._id + "/" + product.image
          });
        } else {
          let cart = req.session.cart;

          let newItem = true;

          for (let i = 0; i < cart.length; i++) {
            if (cart[i].title == slug) {
              cart[i].quantity++;
              newItem = false;
              break;
            }
          }

          if (newItem) {
            // ean einai neo item
            cart.push({
              title: slug,
              quantity: 1,
              price: parseFloat(product.price).toFixed(2),
              image: "/product-images/" + product._id + "/" + product.image
            });
          }
        }

        // console.log(req.session.cart);

        req.flash("success", "Product added");
        res.redirect("back");
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// get req checkout page
router.get("/checkout", isUser, (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;

    res.redirect("/cart/checkout");
  } else {
    //console.log(req.session.cart);
    res.render("checkout", {
      title: "Checkout",
      cart: req.session.cart
    });
  }
});

// get req update product
router.get("/update/:product", isUser, async (req, res) => {
  let slug = req.params.product;

  let cart = req.session.cart;
  let action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      const product = await Product.findOne({ slug });
      switch (action) {
        case "add":
          cart[i].quantity + 1 <= product.quantity
            ? cart[i].quantity++
            : cart[i].quantity;
          break;
        case "remove":
          cart[i].quantity--;
          if (cart[i].quantity < 1) {
            cart.splice(i, 1);
          }
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) {
            delete req.session.cart;
          }
          break;
        default:
          console.log("update problem");
          break;
      }

      break;
    }
  }

  req.flash("success", "Cart updated");
  res.redirect("/cart/checkout");
});

// get req clear cart
router.get("/clear", isUser, (req, res) => {
  delete req.session.cart;

  req.flash("success", "Cart cleared");
  res.redirect("/cart/checkout");
});

// post req buy now
router.post("/buy-now", isUser, (req, res) => {
  // const slugs = req.session.cart.map(n => n.title);

  try {
    req.session.cart.forEach(async item => {
      await Product.update(
        {
          slug: item.title
        },
        {
          $inc: { sales: 1, quantity: -item.quantity }
        }
      );
    });
    // const { quantity: qu } = req.session.cart;
    // console.log(req.session.cart);
    // console.log(slugs);
    // await Product.update(
    //   {
    //     slug: { $in: slugs }
    //   },
    //   {
    //     $inc: { sales: 1, quantity: -1 }
    //   },
    //   { multi: true }
    // );

    delete req.session.cart;

    req.flash("success", "Thanks for your order");
    res.redirect("/products");
  } catch (e) {
    req.flash("danger", "Something gone wrong");
    res.redirect("/products");
  }
});

// exports
module.exports = router;
