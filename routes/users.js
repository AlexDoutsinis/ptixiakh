const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

// get users model
const User = require('../models/user');

// get auth
const { isUser } = require('../config/auth');

// get req register
router.get('/register', (req, res) => {

  res.render('register', {
    title: 'Register'
  })
});

// post req register
router.post('/register', (req, res) => {

  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors,
      user: null,
      title: 'Register'
    })
  } else {
    User.findOne({ username: username }).then(user => {

      if (user) {
        req.flash('danger', 'Username exists, please choose another');

        res.redirect('/users/register');

      }



      if (!user) {

        let user = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 0

        })

        bcrypt.genSalt(10).then(salt => {
          bcrypt.hash(user.password, salt).then(hash => {
            user.password = hash;

            user.save().then(() => {
              req.flash('success', 'You are know registered');
              res.redirect('/users/login');
            }).catch(err => {
              console.log(err);
            })
          }).catch(err => {
            console.log(err);
          })
        }).catch(err => {
          console.log(err);
        })

      }
    }).catch(err => {
      console.log(err);
    })
  }
});

// get req login
router.get('/login', (req, res) => {

  if (res.locals.user) {
    res.redirect('/');
  } else {
    res.render('login', {
      title: 'Log in'
    })
  }

});

// post req login
router.post('/login', (req, res, next) => {

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true

  })(req, res, next);

});

// get req logout
router.get('/logout', isUser, (req, res) => {

  delete req.session.cart;

  req.logout();

  req.flash('success', 'You are logged out');

  res.redirect('/users/login');

});


// exports
module.exports = router;