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

module.exports = router;
