const express = require("express");
const router = express.Router();

// get page model
const Page = require("../models/page");

// get req to mini pages
router.get("/:slug", (req, res) => {
  let slug = req.params.slug;

  Page.findOne({ slug }).then(page => {
    if (!page) {
      res.send("Page could not be found");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content
      });
    }
  });
});

// exports
module.exports = router;
