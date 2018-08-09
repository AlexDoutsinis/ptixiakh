const express = require('express');
const router = express.Router();

// load blog post model
const BlogPost = require('../models/blog-post');

const { escapeRegex } = require('../helpers/upload-helper')

// get req to blog
router.get('/', (req, res) => {

  // console.log(req.query.search);

  if (req.query.search) {

    const regex = new RegExp(escapeRegex(req.query.search), 'gi');

    BlogPost.find({ title: regex }).then(posts => {

      let noMatch;
      if (posts.length < 1) {
        noMatch = 'No posts match that query';
      }

      res.render('blog', {
        posts: posts,
        noMatch: noMatch
      });

    })

  } else {
    // query our database to grap blog posts to show them dinamically to blog page
    BlogPost.find({}).then(posts => {
      let noMatch;

      if (posts.length < 1) {
        noMatch = 'No blog post available';
      }

      res.render('blog', {
        posts: posts,
        noMatch: noMatch
      });
    })

  }


});

router.get('/post/:id', (req, res) => {

  BlogPost.findOne({ _id: req.params.id }).then(post => {
    res.render('single-blog-post', {
      post: post
    });
  })
})



// exports
module.exports = router;