const express = require("express");
const router = express.Router();

const Feedback = require("../models/feedback");

const { isAdmin } = require("../config/auth");

router.get("/", isAdmin, async (req, res) => {
  const reviews = await Feedback.find();

  res.render("admin/feedback", {
    title: "Reviews",
    reviews
  });
});

router.get("/:id", async (req, res) => {
  const review = await Feedback.findById(req.params.id);

  res.render("admin/review", {
    title: `${review.name}'s review`,
    review
  });
});

router.get("/approve/:id", async (req, res) => {
  await Feedback.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { approved: true } }
  );

  req.flash("success", "Review approved");
  res.redirect("/admin/feedback");
});

router.get("/delete/:id", async (req, res) => {
  const review = await Feedback.findById(req.params.id);

  review.remove();

  req.flash("success", "Review deleted");
  res.redirect("/admin/feedback");
});

module.exports = router;
