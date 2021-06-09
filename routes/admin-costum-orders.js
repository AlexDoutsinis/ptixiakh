const express = require('express');
const router = express.Router();

const fs = require('fs-extra');

// get auth
const { isAdmin } = require('../config/auth');

// get costum order model
const CostumOrder = require('../models/costum-order');

// get req to show orders in wating
router.get('/', isAdmin, (req, res) => {

  CostumOrder.count().then(c => {
    CostumOrder.find({}).then(orders => {
      res.render('admin/costum-orders', {
        count: c,
        orders: orders
      });
    })
  })
})

// get req to delete an order
router.get('/delete/:id', isAdmin, (req, res) => {

  CostumOrder.findOne({ _id: req.params.id }).then(order => {
    let fileName = order.productImage;

    // HERE
    let path = `/public/custom-orders/${fileName}`

    fs.remove(path, () => {
      CostumOrder.findByIdAndRemove(req.params.id).then(result => {

        req.flash('success', 'Order deleted');
        res.redirect('/admin/costum-orders');

      })
    })
  })
})

// exports
module.exports = router;