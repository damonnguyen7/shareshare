const express = require('express'),
      router = express.Router(),
      db = require('../db'),
      mongoose = require('mongoose'),
      ObjectId = require('mongoose').Types.ObjectId,
      NoteModel = mongoose.model('Notes', db.schemas.Note),
      cloudinary = require('cloudinary'),
      multiparty = require('multiparty'),
      fs = require('fs'),
      util = require('util');

router.get('/:id', function(req, res, next) {
  NoteModel.findOne({_id: ObjectId(req.params.id)}, function(queryError, noteData) {
    if (queryError) {
      res.status(500);
      res.end();
    } else {
      if (!noteData) {
        return res.end('', 'binary');
      }
      res.end(noteData.note_image, 'binary');
    }
  });
});
module.exports = router;
