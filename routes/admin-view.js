var express = require('express');
var router = express.Router();
var db = require('../db');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var ClassModel = mongoose.model('Classes', db.schemas.Class);
var NoteModel = mongoose.model('Notes', db.schemas.Note);
var CommentModel = mongoose.model('Comments', db.schemas.Comment);

var async = require('async');
var waterfall = async.waterfall;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin-view', { title: 'Admin View Page' });
});

//Clear all database
router.get('/clear-all-db-data', function(req, res, next) {
  function removeEverything() {
    ClassModel.remove({}, function(err) {
      if (err) {
        console.log('error: ', err);
      } else {
        console.log('successfully delete document from class collection');
      }
    });

    NoteModel.remove({}, function(err) {
      if (err) {
        console.log('error: ', err);
      } else {
        console.log('successfully delete document from note collection');
      }
    });

    CommentModel.remove({}, function(err) {
      if (err) {
        console.log('error: ', err);
      } else {
        console.log('successfully delete document from comment collection');
      }
    });
  };

  removeEverything();
  res.send('removed all documents');
});

module.exports = router;
