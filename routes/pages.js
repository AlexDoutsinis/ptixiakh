const express = require('express');
const router = express.Router();

// get page model
const Page = require('../models/page');

// get req to home page
router.get('/', (req, res) => {

  Page.findOne({ slug: 'home' }).then(page => {

    res.render('index', {
      title: page.title,
      content: page.content,
      // success: req.session.success,
      // errors: req.session.errors

    });

    // req.session.errors = null;
  })

});

// get req to other CMS pages
router.get('/nav/:slug', (req, res) => {

  let slug = req.params.slug;

  Page.findOne({ slug }).then(page => {

    if (!page) {
      res.send('Page could not be found');
    } else {
      res.render('index', {
        title: page.title,
        content: page.content
      });
    }
  })

});

// exports
module.exports = router;