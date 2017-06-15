var express = require('express');
var router = express.Router();
var db = require('../db');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var ClassModel = mongoose.model('Classes', db.schemas.Class);
var NoteModel = mongoose.model('Notes', db.schemas.Note);
var CommentModel = mongoose.model('Comments', db.schemas.Comment);
var multiparty = require('multiparty');
var fs = require('fs');
var util = require('util');
var cheerio = require('cheerio');
var moment = require('moment');

var async = require('async');
var waterfall = async.waterfall;

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(process.env.GOOG_ID, process.env.GOOG_SECRET, 'https://shareshare.herokuapp.com/auth/google/callback');

function jsonAuthCheck(req, res, next) {
  if(req.isAuthenticated() !== true) {
    return res.json({
      error: 'unauthenticated'
    });
  }
  next();
}

/* GET render html page about note details. */
router.get('/details/:id', function(req, res, next) {
  req.session.noteDetailUrl = '/note' + req.url;
  var currentUser = req.user.profile.displayname;
  NoteModel.findOne({_id: ObjectId(req.params.id)}, function(error, noteData) {
    if (error) {
      res.render('note-detail-page', {
        title: 'Note Detail',
        error: error,
        layout: 'layout-logged-in-classes-notes-list'
      });
    } else {
      noteData._doc.date = moment(noteData.date).format('MM-DD-YYYY');
      res.render('note-detail-page', {
        title: 'Note Detail',
        noteData: noteData,
        comments: noteData.comments,
        error: null,
        layout: 'layout-logged-in-classes-notes-list',
        currentUser: currentUser
      });
    }
  });
});

/* GET list all notes */
router.get('/all/:id', function(req, res, next) {
  class_name = req.params.id;
  req.session.noteDetailUrl = false;
  req.session.currentClassInDetailPage = req.params.id;
  class_name = decodeURI(req.params.id);
  res.render('list-all-notes', {
    title: 'All Notes',
    class_name: class_name,
    layout: 'layout-logged-in-classes-notes-list',
    user: req.user.profile.displayname
  });
});

//route to send note data to angular application
router.get('/getnotedata/:id', jsonAuthCheck, function(req, res, next) {
  class_name = decodeURI(req.params.id);
  NoteModel.find({
      'class_name': class_name
  }, function(err, noteDocs){
    res.json(noteDocs)
  });
})

/* DELETE note from list */
router.get('/all/delete/:id', function(req, res, next) {
  note_name = decodeURI(req.params.id);
  NoteModel.findOne({note_title: note_name}, function(error, notes) {
    if (error) {
      return res.render('error', {title: 'Error', error: error})
    }
    res.render('delete-confirmation', {
      title: 'Delete Confirmation Page',
      class_name: class_name,
      item: 'note',
      data: notes,
      class_name: req.session.currentClassInDetailPage,
      currentClassUrl: req.session.currentClassUrl,
      current_note_detail_page: req.session.noteDetailUrl,
      layout: 'layout-logged-in-classes-notes-list'
    });
  });
});

router.get('/all/delete/confirmation/:id', function(req, res, next) {
  NoteModel.remove({'_id': ObjectId(req.params.id)}, function(error) {
    if (error) {
      return res.render('error', {message: 'Document was not removed', error: error});
    }
    ClassModel.update({class_name: class_name}, { $inc: { total_notes: -1 },},
      function(error, numAffected) {
        if (error) {
          console.log('error: ', err);
        } else {
          console.log('numAffected: ', numAffected);
        }
    });
    res.redirect('/note/all/' + class_name);
  });
});

/* GET create a note page. */
router.get('/create/:id', function(req, res, next) {
  class_name = decodeURI(req.params.id);
  res.render('note-creation-page', {
    title: 'Note Creation',
    class_name: class_name,
    class_name: class_name,
    currentClassUrl: req.session.currentClassUrl,
    layout: 'layout-logged-in-classes-notes-list'
  });
});

/* GET edit note page */
router.get('/edit/:id', function(req, res, next) {
  NoteModel.findOne({_id: ObjectId(req.params.id)}, function(queryError, note) {
    if (queryError) {
      return res.render('error', {title: 'Error', message: 'Failed to update note', error: queryError});
    }
    res.render('note-edit-page', {
      title: 'Note Edit Page',
      class_name: class_name,
      note: note,
      class_name: false,
      currentClassUrl: req.session.currentClassUrl,
      current_note_detail_page: req.session.noteDetailUrl,
      layout: 'layout-logged-in-classes-notes-list'
    });
  });
});

router.post('/edit/:id', function(req, res, next) {
  NoteModel.update({_id: ObjectId(req.params.id)}, {$set: {
    note_title: req.body.note_title,
    note_description: req.body.note_description,
    note_text: req.body.note_text
  }}, function(updateError, updatedNoteDocument) {
    res.redirect('/note/all/' + class_name);
  });
});


/* POST create a note */
router.post('/create/:id', function (req, res, next) {
  oauth2Client.credentials = {
    access_token: req.user.accessToken
  };

  var form = new multiparty.Form();
  var class_name = decodeURI(req.params.id);

  // http://caolan.github.io/async/docs.html#series
  var driveService = google.drive({ version: 'v3', auth: oauth2Client });
  waterfall([
    // parse form
    function (cb) {
      form.parse(req, function (formError, fields, files) {
        if (formError) {
          return cb(formError);
        }
        cb(null, fields.note_title[0], fields.note_description[0], files.image[0]);
      });
    },
    // upload photo to drive
    function (noteTitle, noteDescription, firstPhotoObject, cb) {
      driveService.files.create({
        resource: {
          name: firstPhotoObject.originalFilename,
          mimeType: firstPhotoObject.headers['content-type'],
          parents: [req.user.profile.google_drive_folder_id]
        },
        media: {
          mimeType: firstPhotoObject.headers['content-type'],
          body: fs.createReadStream(firstPhotoObject.path)
        },
        ocrLanguage: 'en'
      }, function(uploadPhotoError, uploadedDrivePhoto) {
        if (uploadPhotoError) {
          return cb(uploadPhotoError);
        }
        cb(null, noteTitle, noteDescription, uploadedDrivePhoto.id);
      });
    },
    // set permissions for photo
    function (noteTitle, noteDescription, uploadedDrivePhotoId, cb) {
      driveService.permissions.create({
        fileId: uploadedDrivePhotoId,
        resource: {
          type: 'anyone',
          role: 'reader'
        }
      }, function (permissionError, newPermission) {
        if (permissionError) {
          return cb(permissionError);
        }
        cb(null, noteTitle, noteDescription, uploadedDrivePhotoId);
      });
    },
    // copy photo file to google doc
    function (noteTitle, noteDescription, uploadedDrivePhotoId, cb) {
      driveService.files.copy({
        fileId: uploadedDrivePhotoId,
        ocrLanguage: 'en',
        resource: {
          mimeType: 'application/vnd.google-apps.document'
        }
      }, function (copyError, googleDocCopy) {
        if (copyError) {
          return cb(copyError);
        }
        cb(null, noteTitle, noteDescription, uploadedDrivePhotoId, googleDocCopy.id);
      });
    },
    // export google doc as html response
    function (noteTitle, noteDescription, uploadedDrivePhotoId, googleDocCopyId, cb) {
      driveService.files.export({
        fileId: googleDocCopyId,
        mimeType: 'text/html'
      }, function (exportError, exportFile) {
        if (exportError) {
          return cb(exportError);
        }
        var ocrText = cheerio.load(exportFile)('body').text();
        cb(null, noteTitle, noteDescription, uploadedDrivePhotoId, ocrText);
      });
    },
    // find classmodel for class_id
    function (noteTitle, noteDescription, uploadedDrivePhotoId, ocrText, cb) {
      ClassModel.findOne({class_name: class_name}, function (classQueryError, classObject) {
        if (classQueryError) {
          return cb(classQueryError);
        }
        cb(null, noteTitle, noteDescription, uploadedDrivePhotoId, ocrText, classObject.class_name);
      });
    },
    // save note to notes collection
    function (noteTitle, noteDescription, uploadedDrivePhotoId, ocrText, className, cb) {
      var newNote = new NoteModel({
        note_title: noteTitle,
        note_description: noteDescription,
        note_text: ocrText,
        google_drive_file_id: uploadedDrivePhotoId,
        class_name: className,
        author_avatar_url: req.user.profile.avatar_url,
        author_display_name: req.user.profile.displayname,
        note_image_url:  'https://drive.google.com/uc?export=view&id=' + uploadedDrivePhotoId
      });

      newNote.save(function (saveError) {
        if (saveError) {
          return cb(saveError);
        }
        cb(null, newNote);
      });
    }
  ], function (err, newNote) {
    // send to note creation success page
    if (err) {
      return res.render('create-note-error', {
        title: 'Error - did not create Note',
        error: err,
        layout: 'layout-no-footer'
      });
    }
    res.render('create-note-success', {
      title: 'Success - created Note',
      class_name: newNote.class_name,
      note_title: newNote.note_title,
      note_description: newNote.note_description,
      layout: 'layout-no-footer'
    });
  })
});


router.post('/comment/create', function (req, res) {
  var author_id = req.user.profile.id;
  var author_name = req.user.profile.displayname;
  var author_img_url = req.user.profile.avatar_url;
  var text = req.body.text;
  var noteid = req.body.noteid;

  var newComment = new CommentModel({
    author_id: author_id,
    author_name: author_name,
    author_img_url: author_img_url,
    note_id: noteid,
    text: text
  });

  NoteModel.update({ _id: noteid}, {
    $push: {
      comments: newComment
    }
  }, function (err, dbResponse) {
    //send response to browser
    debugger;
    res.status(200).json(newComment);
  });
});
module.exports = router;
