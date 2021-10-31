const express = require("express");
const router = express.Router();

// get NewsLetter model
const NewsLetter = require("../models/news-letter");
const Feedback = require("../models/feedback");

router.get("/", async (req, res) => {
  const reviews = (await Feedback.find({ approved: true })) || null;

  res.render("home", { reviews });
});

router.post("/news-letter", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  
  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();

  const errors = req.validationErrors();

  if (errors)
    return res.render("home", {
      errors,
      user: null
    });

  let user = new NewsLetter({
      name: req.body.name,
      email: req.body.email
  });

  user
    .save()
    .then(() => {
      req.flash("success", "You are in our list");
      res.redirect("back");
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
