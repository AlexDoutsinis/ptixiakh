const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const passport = require('passport')
const moment = require('moment')
const cookieParser = require('cookie-parser')

const { database } = require('./config/database')

// init app
const app = express()

// connect to mongo
mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connected to Mongo')
})

//  view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

// express fileupload middleware
app.use(fileUpload())

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 1
app.use(cookieParser())

// 2
// app.use(session({ secret: 'krunal', saveUninitialized: true, resave: false }));

// express session middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }),
)

// express validator middleware
app.use(
  expressValidator({
    customValidators: {
      isImage: function (value, filename) {
        let extension = path.extname(filename).toLowerCase()

        // return extension == '.jpg'
        switch (extension) {
          case '.jpg':
            return '.jpg'
          case '.jpeg':
            return '.jpeg'
          case '.png':
            return '.png'
          // case '':
          //   return '.jpg';
          default:
            return false
        }
      },
    },
  }),
)

// express messages middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// passport config
require('./config/passport')(passport)

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// method-override middleware - override with POST having ?_method=PUT
app.use(methodOverride('_method'))

// local variables - ta local variables xononte san parametroi sta views
app.use('/', (req, res, next) => {
  app.locals.errors = null
  app.locals.title = null
  app.locals.slug = null
  app.locals.content = null
  app.locals.body = null
  app.locals.noMatch = null
  app.locals.display = false
  // app.locals.errorImg = req.session.errors;

  app.locals.generateDate = function (date, format) {
    return moment(date).format(format)
  }

  next()
})

// get page model
let Page = require('./models/page')

// get all pages to pass to header.ejs
app.use('/', (req, res, next) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec()
    .then(pages => {
      app.locals.pages = pages

      next()
    })
})

// get category model
let Category = require('./models/category')

// get all categories to pass to header.ejs
app.use('/', (req, res, next) => {
  Category.find({}).then(categories => {
    app.locals.categories = categories

    next()
  })
})

// local variables
app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart

  res.locals.user = req.user || null // ean o xristis kanei log in tha exoume prosvash sto req.user, allios tha einai null

  res.locals.pAvailability = 'YES'

  // gia to search sti kathe katigoria proionton
  res.locals.currentCat = req.query.currentCat
  res.locals.cat = null
  res.locals.cate = null

  next()
})

// set routes
const home = require('./routes/home.js')
const pages = require('./routes/pages.js')
const adminPages = require('./routes/admin-pages.js')
const adminCategories = require('./routes/admin-categories.js')
const adminProducts = require('./routes/admin-products.js')
const adminBlogPosts = require('./routes/admin-blog-posts.js')
const adminCostumOrders = require('./routes/admin-costum-orders')
const adminNewsLetter = require('./routes/admin-news-letter')
const adminFeedback = require('./routes/admin-feedback.js')
const products = require('./routes/products.js')
const blog = require('./routes/blog.js')
const cart = require('./routes/cart.js')
const users = require('./routes/users.js')
const contact = require('./routes/contact.js')
const feedback = require('./routes/feedback.js')
const popularProducts = require('./routes/popular-products')
const sortByPrice = require('./routes/sortByPrice')

// load routes
// comment
app.use('/', home)
app.use('/nav', pages)
app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/admin/blog-posts', adminBlogPosts)
app.use('/admin/costum-orders', adminCostumOrders)
app.use('/admin/news-letter', adminNewsLetter)
app.use('/admin/feedback', adminFeedback)
app.use('/products', products)
app.use('/blog', blog)
app.use('/cart', cart)
app.use('/users', users)
app.use('/contact', contact)
app.use('/feedback', feedback)
app.use('/popular-products', popularProducts)
app.use('/sort', sortByPrice)

// start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
