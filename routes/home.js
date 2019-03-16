const express = require("express");
const router = express.Router();

// get NewsLetter model
const NewsLetter = require("../models/news-letter");
const Feedback = require("../models/feedback");

router.get("/", (req, res) => {
  res.render("home");
});

//! this route is at wrong place
router.post("/feedback", async (req, res) => {
  const { name, body } = req.body;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("body", "Please leave a feedback").notEmpty();

  const errors = req.validationErrors();

  if (errors)
    return res.render("home", {
      errors,
      feedback: null
    });

  const review = new Feedback({
    name,
    body
  });

  try {
    await review.save();
    req.flash("success", "Thanks for your feedback");
    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
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
