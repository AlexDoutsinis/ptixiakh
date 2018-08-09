const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// get auth
const { isAdmin } = require('../config/auth');

// get category model
const Category = require('../models/category');

// get req category index
router.get('/', isAdmin, (req, res) => {

  Category.find({}).then(categories => {
    res.render('admin/categories', {
      categories: categories // stelnoume ti metavlith categories sto categories view
    })
  })

});

// get req add category
router.get('/add-category', isAdmin, (req, res) => {

  res.render('admin/add-category', {
    success: req.session.success,
    errors: req.session.errors
  });

  req.session.errors = null;

});

// post req add category
router.post('/add-category', (req, res) => {
  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();

  let content = req.body.content;

  req.checkBody('title', 'Title is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.render('admin/add-category', {
      success: req.session.success,
      errors: req.session.errors,
      title: title

    });

  } else {
    // req.session.success = true;

    Category.findOne({ slug: slug }).then(category => {

      if (category) {
        req.flash('danger', 'Category title exists, please choose another');
        res.render('admin/add-category', {
          title: title
        });
      } else if (!category) {

        let category = new Category({ // save data to Category model

          title: title,
          slug: slug
        });

        category.save().then(result => {

          Category.find({}).then(categories => {
            req.app.locals.categories = categories;

          });

          req.flash('success', 'Category added');
          res.redirect('/admin/categories');

        }).catch(err => {
          console.log(err);
        });

      }
    })

  }

});

// get req edit category
router.get('/edit-category/:id', isAdmin, (req, res) => {


  Category.findById(req.params.id).then(category => {


    res.render('admin/edit-category', {
      title: category.title,
      id: category.id
    });

  });

});


// put req edit category
router.put('/edit-category/:id', (req, res) => {
  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();

  let id = req.params.id;

  req.checkBody('title', 'Title is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.render('admin/edit-category', {
      success: req.session.success,
      errors: req.session.errors,
      title: title,
      id: id

    });

  } else {
    // req.session.success = true;

    Category.findOne({ slug: slug, _id: { '$ne': id } }).then(category => { // h defterh parametros ekserei to slug tis sigkekrimenhs katigorias pou pame na kanoume edit

      if (category) { // if category already exists
        req.flash('danger', 'Category slug exists, please choose another');
        res.render('admin/edit-category', {
          title: title,
          id, id
        });
      } else if (!category) { // if category is unique

        Category.findById(id).then(category => {
          category.title = title;
          category.slug = slug;

          category.save().then(updatedCategory => {

            Category.find({}).then(categories => {
              req.app.locals.categories = categories;

            });

            req.flash('success', 'Category updated');
            res.redirect('/admin/categories/edit-category/' + id);

          }).catch(err => {
            console.log(err);
          });
        }).catch(err => {
          console.log(err);
        });
      }
    })
  }
});

// get req delete category
router.get('/delete-category/:id', isAdmin, (req, res) => {

  Category.findByIdAndRemove(req.params.id).then(category => {

    Category.find({}).then(categories => {
      req.app.locals.categories = categories;

    });

    req.flash('success', 'Category deleted');
    res.redirect('/admin/categories/');
  })

});




// exports
module.exports = router;