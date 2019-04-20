const express = require("express");
const router = express.Router();

const Feedback = require("../models/feedback");

router.get("/review", (req, res) => {
  res.render("feedback", { title: "Feedback" });
});

router.post("/review", async (req, res) => {
  const { name, body, email } = req.body;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("body", "Please leave a feedback").notEmpty();

  const errors = req.validationErrors();

  if (errors)
    return res.render("feedback", {
      errors,
      title: "Feedback",
      user: null
    });

  const feedback = new Feedback({
    name,
    email,
    body
  });

  try {
    await feedback.save();
    req.flash("success", "Thanks for your feedback");
    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
