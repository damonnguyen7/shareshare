const express = require('express'),
      router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', {
    title: 'Login Page',
    layout: 'layout-no-footer-no-header'
  });
});

module.exports = router;
