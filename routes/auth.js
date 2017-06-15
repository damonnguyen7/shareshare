const express = require('express'),
      router = express.Router(),
      passport = require('passport');

router.get('/google/', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/drive'
  ]
}));

router.get('/google/callback/', passport.authenticate('google', {failureRedirect: '/login'}),
function (req, res) {
  res.redirect('/');
});

module.exports = router;
