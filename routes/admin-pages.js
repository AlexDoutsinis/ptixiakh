const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// get auth
const { isAdmin } = require('../config/auth');

// get page model
const Page = require('../models/page');

// get req pages index
router.get('/', isAdmin, (req, res) => {

  Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {

    res.render('admin/pages', {
      pages: pages
    });

  })

});

// get req add page
router.get('/add-page', isAdmin, (req, res) => {

  res.render('admin/add-page', {
    success: req.session.success,
    errors: req.session.errors
  });

  req.session.errors = null;

});

// post req add page
router.post('/add-page', (req, res) => {
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

  if (slug == '') {
    slug = title.replace(/\s+/g, '-').toLowerCase();
  }

  let content = req.body.content;

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('content', 'Content is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.render('admin/add-page', {
      success: req.session.success,
      errors: req.session.errors,
      title: title,
      content: content

    });

  } else {
    // req.session.success = true;

    Page.findOne({ slug: slug }).then(page => {
      /* console.log(page);
      console.log('find')
      console.log(slug); */

      if (page) {
        req.flash('danger', 'Page slug exists, please choose another');
        res.render('admin/add-page', {
          title: title,
          content: content
        });
      } else if (!page) {

        let page = new Page({ // save data to Page model

          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });

        page.save().then(result => {

          Page.find({}).sort({ sorting: 1 }).exec().then(pages => {
            req.app.locals.pages = pages;
          });

          req.flash('success', 'Page added');
          res.redirect('/admin/pages');

        }).catch(err => {
          console.log(err);
        });

        // console.log('unique page');

      }
    })

  }

});

// sort pages function. Ta xonw mesa se sinartish giati h node einai asixronh kai stin prokimenh periptosh den mas voithaei afto
let sortPages = (ids, callback) => {

  let count = 0;

  for (let i = 0; i < ids.length; i++) {

    let id = ids[i];
    count++;

    (function (count) {
      Page.findById(id).then(page => {
        page.sorting = count;

        page.save().then(pageSorted => {
          ++count;
          if (count >= ids.length) {
            callback();
          }
        }).catch(err => {
          console.log(err);
        });

      });
    })(count);
  }
}

// post req reorder-pages
router.post('/reorder-pages', (req, res) => {

  let ids = req.body['id[]'];

  sortPages(ids, () => {
    Page.find({}).sort({ sorting: 1 }).exec().then(pages => {
      req.app.locals.pages = pages;
    });
  });

});

// get req edit page
router.get('/edit-page/:id', isAdmin, (req, res) => {


  Page.findById(req.params.id).then(page => {


    res.render('admin/edit-page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page.id
    });

  });

});


// put req edit page
router.put('/edit-page/:id', (req, res) => {
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

  if (slug == '') {
    slug = title.replace(/\s+/g, '-').toLowerCase();
  }

  let content = req.body.content;
  let id = req.params.id;

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('content', 'Content is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    req.session.success = false;

    res.render('admin/edit-page', {
      success: req.session.success,
      errors: req.session.errors,
      title: title,
      content: content,
      slug: slug,
      id: id

    });

  } else {
    // req.session.success = true;

    Page.findOne({ slug: slug, _id: { '$ne': id } }).then(page => { // h defterh parametros ekserei to slug tis sigkekrimenhs selidas pou pame na kanoume edit

      if (page) { // if page already exists
        req.flash('danger', 'Page slug exists, please choose another');
        res.render('admin/edit-page', {
          title: title,
          content: content,
          slug: slug,
          id, id
        });
      } else if (!page) { // if page is unique

        Page.findById(id).then(page => {
          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save().then(updatedPage => {

            Page.find({}).sort({ sorting: 1 }).exec().then(pages => {
              req.app.locals.pages = pages;
            });

            req.flash('success', 'Page updated');
            res.redirect('/admin/pages/edit-page/' + id);

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

// get req delete page
router.get('/delete-page/:id', isAdmin, (req, res) => {

  Page.findByIdAndRemove(req.params.id).then(page => {

    Page.find({}).sort({ sorting: 1 }).exec().then(pages => {
      req.app.locals.pages = pages;
    });

    req.flash('success', 'Page deleted');
    res.redirect('/admin/pages/');
  })

});




// exports
module.exports = router;