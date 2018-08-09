const { isAdmin } = require('../config/auth');

const express = require('express');
const router = express.Router();

// load modules
const fs = require('fs');
const faker = require('faker');

// load models
const BlogPost = require('../models/blog-post');

// load helpers
const { isEmpty, uploadDir } = require('../helpers/upload-helper');

// get req to all blog posts
router.get('/', isAdmin, (req, res) => {

  // psaxnei sto BlogPost model kai stelnei ta posts sto view
  BlogPost.find({}).then(posts => {

    res.render('admin/blog-posts', {
      posts: posts
    });

  })


})

// get req to create posts
router.get('/create', isAdmin, (req, res) => {

  res.render('admin/blog-posts-create');

})

// post req to create posts
router.post('/create', (req, res) => { // to edit koumpi pou yparxei sto kathe post me petaei sto get edit request

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('body', 'Description is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.render('admin/blog-posts-create', {
      success: req.session.success,
      errors: req.session.errors,
      title: req.body.title,
      body: req.body.body
    });

  } else {

    let fileName = 'noImage';


    if (!isEmpty(req.files)) {
      // console.log(req.files);
      let file = req.files.image;
      fileName = Date.now() + '-' + file.name;

      file.mv('./public/blog-posts-images/' + fileName, (err) => {
        if (err) {
          throw err;
        }
      })

    }


    // console.log(req.files);
    // let allowComments = true;

    // if (req.body.allowComments) {
    //   allowComments = true
    // } else {
    //   allowComments = false;
    // }

    const newPost = new BlogPost({
      title: req.body.title,
      body: req.body.body,
      image: fileName
    })

    newPost.save().then(savedPost => {

      req.flash('success', `Post "${savedPost.title}" created`);

      res.redirect('/admin/blog-posts');
    }).catch(err => {
      console.log(err);
    })

  }

})

// get req to edit each post
router.get('/edit/:id', isAdmin, (req, res) => {

  // psaxnoume sto colection gia to sigkekrimeno post
  BlogPost.findOne({ _id: req.params.id }).then(post => {

    res.render('admin/blog-posts-edit', {
      post: post
    });
  })

})

// put req to save each edited post
router.put('/edit/:id', (req, res) => {

  BlogPost.findById(req.params.id).then(post => {

    // console.log(req.files);
    // if (req.body.allowComments) {
    //   allowComments = true
    // } else {
    //   allowComments = false;
    // }

    post.title = req.body.title;
    // post.status = req.body.status;
    // post.allowComments = allowComments;
    post.body = req.body.body;

    post.save().then(editedPost => {

      req.flash('success', 'Post updated');

      res.redirect('/admin/blog-posts/edit/' + req.params.id);

    })

  })

})

// get req to delete each post
router.delete('/delete/:id', (req, res) => {

  // psaxnoume sto colection gia to sigkekrimeno post
  BlogPost.findOne({ _id: req.params.id }).then(post => {

    fs.unlink(uploadDir + post.file, (err) => {

      post.remove();

      req.flash('success', 'Post deleted');
      res.redirect('/admin/blog-posts');
    })


  })

})



module.exports = router;