const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");

// get product model
const Product = require("../models/product");

// get costum order model
const CostumOrder = require("../models/costum-order");

// get category model
Category = require("../models/category");

const { escapeRegex } = require("../helpers/upload-helper");

// get req to all products - shop
router.get("/", (req, res) => {
  if (req.query.search) {
    // console.log(req.query.search);

    const regex = new RegExp(escapeRegex(req.query.search), "gi");

    // console.log(regex);

    Product.find({ title: regex }).then(products => {
      let noMatch;
      if (products.length < 1) {
        noMatch = "No product match that query";
      }

      res.render("all-products", {
        title: "All products",
        products: products,
        noMatch: noMatch
      });
    });
  } else {
    Product.find({}).then(products => {
      let noMatch;
      if (products.length < 1) {
        noMatch = "Shop is empty";
      }

      res.render("all-products", {
        title: "All products",
        products: products,
        noMatch: noMatch
      });
    });
  }
});

// get req products by category
router.get("/:category", (req, res) => {
  // console.log(req.query.currentCat);

  //console.log(req.url);

  // const catIndex = req.url.indexOf("?");
  // const cate = req.url.slice(1, catIndex);
  //console.log(cate);

  let categorySlug = req.params.category;

  if (req.query.search) {
    // console.log(req.query.search);

    const regex = new RegExp(escapeRegex(req.query.search), "gi");

    // console.log(regex);

    Category.findOne({ slug: categorySlug }).then(category => {
      Product.find({ $and: [{ category: categorySlug }, { title: regex }] })
        .then(products => {
          let noMatch;
          if (products.length < 1) {
            noMatch = `No product match that query for '${
              category.title
            }' category `;
          }

          res.render("categories-products", {
            title: category.title,
            products: products,
            noMatch: noMatch
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  } else {
    Category.findOne({ slug: categorySlug }).then(category => {
      Product.find({ category: categorySlug }).then(products => {
        res.render("categories-products", {
          title: category.title,
          products: products
        });
      });
    });
  }
});

// get req to sort products by ascending for each category - NOT IMPLEMENT YET (UI MISSING)
router.get("/asc/:category", async (req, res) => {
  let slug = req.params.category;

  const catIndex = req.url.lastIndexOf("/");
  const cat = req.url.slice(catIndex + 1);

  const category = await Category.findOne({ slug });

  const products = await Product.find({ category: slug }).sort({ price: 1 });

  res.render("categories-products", {
    title: `Ascending Order for ${category.title} category`,
    products,
    cat
  });
});

// get req to sort products by descending for each category - NOT IMPLEMENT YET (UI MISSING)
router.get("/des/:category", async (req, res) => {
  const slug = req.params.category;

  const catIndex = req.url.lastIndexOf("/");
  const cat = req.url.slice(catIndex + 1);

  const category = await Category.findOne({ slug });

  const products = await Product.find({ category: slug }).sort({ price: -1 });

  res.render("categories-products", {
    title: `Descending Order for ${category.title} category`,
    products,
    cat
  });
});

// get req product details
router.get("/:category/:product", (req, res) => {
  let galleryImages = null;

  let loggedIn = req.isAuthenticated() ? true : false; // to isAuthenticated yparxei otan xrisimopieite to passport

  Product.findOne({ slug: req.params.product })
    .then(product => {
      let galleryDir = "public/product-images/" + product._id + "/gallery";
			
		fs.ensureDir(galleryDir)
			.then(() => {
				fs.readdir(galleryDir).then(files => {
        galleryImages = files;

        res.render("product", {
          title: "Details",
          product: product,
          galleryImages: galleryImages,
          loggedIn: loggedIn,
          availability: product.availability
        });
      });
			})
			.catch(err => {
				console.error(err);
			});
			
    })
    .catch(err => {
      console.log(err);
    });
});

// post req to costum orders
router.post("/costum-orders", (req, res) => {
  let imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";

  let name = req.user.name;

  req.checkBody("image", "You must upload an image file").isImage(imageFile);

  let errors = req.validationErrors();

  if (errors) {
    // den doulevei
    req.session.errors = errors;
    req.session.success = false;

    req.flash("danger", "You must upload an image file"); // den emfanizw to minima me to express validator gt to menei meta to refresh. afto ginete dioti se afth tin periptosh den kanw render se kapoia selida alla redirect kai prepei na valw to success kai error session sto get request tou home page opote to error tha emfanizete sinexia otan kanoume request sto home page. ean eixa edw render kai evaza ta succes kai error seassons tote to minima tha emfanizotan mono otan o xristis stilei post request kai perastoun sto view pou ginete render (home page), opote meta sto refresh to get request den exei ta sessions opote den emfanizete to minima

    res.redirect("back");
  } else {
    req.session.success = true;

    let order = new CostumOrder({
      productImage: imageFile,
      costumerName: name
    });

    order
      .save()
      .then(result => {
        mkdirp("public/costum-orders", err => {
          return console.log(err);
        });

        if (imageFile !== "") {
          let orderImg = req.files.image;

          let path = "public/costum-orders/" + imageFile;

          orderImg.mv(path, function(err) {
            return console.log(err);
          });
        }

        req.flash("success", "Your order has been sent");

        res.redirect("back");
      })
      .catch(err => {
        console.log(err);
      });
  }
});

// get req to most popular products
router.get("/popular-products", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sales: 1 })
      .limit(4);

    res.render("all-products", {
      title: "Most Popular Products",
      products
    });
  } catch (e) {
    req.flash("danger", "Error");
    res.redirect("/");
    console.log(e);
  }
});

// exports
module.exports = router;
