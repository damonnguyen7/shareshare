const express = require('express'),
      router = express.Router(),
      db = require('../db'),
      mongoose = require('mongoose'),
      ObjectId = require('mongoose').Types.ObjectId,
      ClassModel = mongoose.model('Classes', db.schemas.Class);

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(process.env.GOOG_ID, process.env.GOOG_SECRET, 'https://shareshare.herokuapp.com/auth/google/callback');
var service = google.drive('v2');

/* GET render html page about class details. */
router.get('/files', function(req, res, next) {
  oauth2Client.credentials = {
    access_token: req.user.accessToken
  };
  service.files.list({
    auth: oauth2Client,
    pageSize: 10,
    fields: "file(name)"
  }, function(err, response) {
    // insert stuff
    var files = response.items;
    res.render('list-all-drive-files', {
      files: files,
      layout: 'layout-no-footer'
    });
  });
});

module.exports = router;
