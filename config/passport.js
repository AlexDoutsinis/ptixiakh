const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = passport => {
  passport.use(new LocalStrategy((username, password, done) => {

    User.findOne({ username: username }).then(user => {

      if (!user) {
        return done(null, false, { message: 'No user found' });
      } else {

        bcrypt.compare(password, user.password).then(isMatch => {

          if (!isMatch) {

            return done(null, false, { message: 'Wrong password' });
          } else {

            return done(null, user);
          }
        }).catch(err => {
          console.log(err);
        })
      }
    }).catch(err => {
      console.log(err);
    })
  }))

  passport.serializeUser((user, done) => {

    done(null, user.id);
  })

  passport.deserializeUser((id, done) => {

    User.findById(id).then(user => {

      done(null, user);
    })
  })

  /* passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  }) */
}