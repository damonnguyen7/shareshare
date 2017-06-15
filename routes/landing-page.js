const express = require('express'),
      router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()){
    return res.render('list-all-classes',{
      layout: 'layout-logged-in-classes-notes-list'
    });
  }
  res.render('landing-page');
});

module.exports = router;
