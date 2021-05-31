const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

// get auth
const { isAdmin } = require("../config/auth");

// get product model
const Product = require("../models/product");
// get category model
const Category = require("../models/category");

// get req products index
router.get("/", isAdmin, (req, res) => {
  let count;

  Product.count().then(c => {
    count = c;
  });

  Product.find({}).then(products => {
    res.render("admin/products", {
      products: products,
      count: count
    });
  });
});

// get req add product
router.get("/add-product", isAdmin, (req, res) => {
  let description = "";
  let price = "";
  let availability = "";
  let quantity = "";

  Category.find({}).then(categories => {
    // theloume otan prosthetoume ena proion na prosthetoume kai tin katigoria tou
    res.render("admin/add-product", {
      success: req.session.success,
      errors: req.session.errors,
      categories: categories,
      description: description,
      price: price,
      quantity: quantity,
      availability: availability
    });
  });

  req.session.errors = null;
});

// post req add product
router.post("/add-product", (req, res) => {
  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let description = req.body.description;
  let price = req.body.price;
  let category = req.body.category;
  let availability = req.body.availability;
  let quantity = req.body.quantity;

  //console.log(req.files.image.name);
  let imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : ""; // exoume prosvash sto req.files eksetias toy file upload module. to image einai to name tou input opou mpenei h eikona sti forma mas sto ejs

  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("quantity", "quantity is required").notEmpty();
  req.checkBody("description", "Description is required").notEmpty();
  req.checkBody("price", "Price is required").isDecimal();
  req.checkBody("image", "You must upload an image file").isImage(imageFile); // custom validator

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    Category.find({}).then(categories => {
      res.render("admin/add-product", {
        success: req.session.success,
        errors: req.session.errors,
        title: title,
        description: description,
        categories: categories,
        price: price,
        availability: availability,
        quantity: quantity
      });
    });
  } else {
    // req.session.success = true;

    Product.findOne({ slug: slug }).then(product => {
      if (product) {
        req.flash("danger", "Product title exists, please choose another");
        Category.find({}).then(categories => {
          res.render("admin/add-product", {
            title: title,
            description: description,
            categories: categories,
            price: price,
            availability: availability,
            quantity: quantity
          });
        });
      } else if (!product) {
        let price2 = parseFloat(price).toFixed(2);

        let product = new Product({
          // save data to Product model

          title: title,
          slug: slug,
          description: description,
          price: price2,
          quantity: parseFloat(quantity).toFixed(2),
          category: category,
          availability: availability,
          image: imageFile
        });

        product
          .save()
          .then(result => {
            mkdirp("public/product-images/" + product._id, err => {
              // ftiaxnoume fakelo mesa sto product-images fakelo me onoma to id tou sigkekrimenou fakelou. mkdirp module
              return console.log(err);
            });

            mkdirp("public/product-images/" + product._id + "/gallery", err => {
              return console.log(err);
            });

            mkdirp(
              "public/product-images/" + product._id + "/gallery/thumbs",
              err => {
                return console.log(err);
              }
            );

            if (imageFile !== "") {
              // !edw kati pezei
              let productImage = req.files.image;
              // HERE
              let path =
                "/public/product-images/" + product._id + "/" + imageFile;
              console.log(`Image Path: ${path}`);
              console.log(`Current Directory Path: ${path.dirname(__dirname)}`)

              productImage.mv(path, function(err) {
                console.log("Image Error");
                return console.log(err);
              });
            }

            req.flash("success", "Product added");

            res.redirect("/admin/products");
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  }
});

// get req edit product
router.get("/edit-product/:id", isAdmin, (req, res) => {
  let errors;

  if (req.session.errors) {
    errors = req.session.errors;
  } else {
    errors = null;
  }

  Category.find({}).then(categories => {
    Product.findById(req.params.id).then(product => {
      let galleryDir = "public/product-images/" + product._id + "/gallery";
      let galleryImages = null;

      fs.ensureDir(galleryDir)
        .then(() => {
          fs.readdir(galleryDir, function(err, files) {
            if (err) {
              console.log(err);
            } else {
              galleryImages = files;

              res.render("admin/edit-product", {
                success: req.session.success,
                errors: req.session.errors,
                title: product.title,
                categories: categories,
                category: product.category.replace(/\s+/g, "-").toLowerCase(),
                description: product.description,
                price: parseFloat(product.price).toFixed(2),
                quantity: parseFloat(product.quantity).toFixed(2),
                availability: product.availability,
                image: product.image,
                galleryImages: galleryImages,
                id: product._id
              });
            }
          });
        })
        .catch(err => console.log(err));
    });
  });
});

// put req edit product
router.put("/edit-product/:id", (req, res) => {
  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let description = req.body.description;
  let price = req.body.price;
  let quantity = req.body.quantity;
  let availability = req.body.availability;
  let category = req.body.category;
  let productImage = req.body.productImage;
  let id = req.params.id;

  let imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : ""; // exoume prosvash sto req.files eksetias toy file upload module. to image einai to name tou input opou mpenei h eikona sti forma mas sto ejs

  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("description", "Description is required").notEmpty();
  req.checkBody("price", "Price is required").isDecimal();
  req.checkBody("quantity", "quantity is required").isDecimal();
  // req.checkBody('image', 'You must upload an image file').isImage(imageFile); // costum validator

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.redirect("/admin/products/edit-product/" + id);
  } else {
    Product.findOne({ slug: slug, _id: { $ne: id } }).then(product => {
      if (product) {
        req.flash("danger", "Product title exists, please choose another");
        res.redirect("/admin/products/edit-product/" + id);
      } else {
        Product.findById(id).then(product => {
          product.title = title;
          product.slug = slug;
          product.description = description;
          product.price = parseFloat(price).toFixed(2);
          product.quantity = parseFloat(quantity).toFixed(2);
          product.category = category;
          product.availability = availability;

          if (imageFile !== "" && imageFile !== productImage) {
            product.image = imageFile;
          }

          product
            .save()
            .then(savedProduct => {
              if (imageFile !== "") {
                if (productImage !== "" && productImage !== imageFile) {
                  fs.remove("public/product-images/" + id + "/" + productImage);
                }

                productImage = req.files.image;
                let path = "public/product-images/" + id + "/" + imageFile;

                productImage.mv(path, function(err) {
                  return console.log(err);
                });
              }

              req.flash("success", "Product updated");

              res.redirect("/admin/products/edit-product/" + id);
            })
            .catch(error => {
              console.log(error);
            });
        });
      }
    });
  }
});

// post req product gallery
router.post("/product-gallery/:id", (req, res) => {
  let productImage = req.files.file;

  let id = req.params.id;

  let path = "public/product-images/" + id + "/gallery/" + productImage.name;
  let thumbsPath =
    "public/product-images/" + id + "/gallery/thumbs/" + productImage.name;

  productImage.mv(path, function(err) {
    if (err) {
      console.log(err);
    }

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(buf => {
      fs.writeFileSync(thumbsPath, buf);
    });
  });

  res.sendStatus(200);
});

// get req delete image from gallery
router.get("/delete-image/:image", isAdmin, (req, res) => {
  let originalImage =
    "public/product-images/" + req.query.id + "/gallery/" + req.params.image;
  let thumbImage =
    "public/product-images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fs.remove(originalImage).then(() => {
    fs.remove(thumbImage).then(() => {
      req.flash("success", "Image deleted");
      res.redirect("/admin/products/edit-product/" + req.query.id);
    });
  });
});

// get req delete product
router.get("/delete-product/:id", isAdmin, (req, res) => {
  let id = req.params.id;
  let path = "public/product-images/" + id;

  fs.remove(path, () => {
    Product.findByIdAndRemove(id).then(() => {
      req.flash("success", "Product deleted");
      res.redirect("/admin/products");
    });
  });
});

// exports
module.exports = router;
