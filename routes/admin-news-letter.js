const express = require("express");
const router = express.Router();

// get NewsLetter model
const NewsLetter = require("../models/news-letter");

// get auth
const { isAdmin } = require("../config/auth");

router.get("/", isAdmin, async (req, res) => {
  const users = await NewsLetter.find();

  res.render("admin/news-letter", {
    title: "Newsletter List",
    users
  });
});

// exports
module.exports = router;
