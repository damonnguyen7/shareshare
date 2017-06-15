const express = require('express'),
      router = express.Router(),
      db = require('../db'),
      mongoose = require('mongoose'),
      ObjectId = require('mongoose').Types.ObjectId,
      ClassModel = mongoose.model('Classes', db.schemas.Class);

/* GET render html page about class details. */
router.get('/details/:id', function(req, res, next) {
  ClassModel.findOne({_id: ObjectId(req.params.id)}, function(queryError, classData) {
    if (queryError) {
      res.render('class-detail-page', {
        title: 'Landing Page',
        error: queryError,
        layout: 'layout-no-footer'
      });
    } else {
      res.render('class-detail-page', {
        title: 'Landing Page',
        classData: classData,
        error: null,
        layout: 'layout-no-footer'
      });
    }
  });
});

/* GET list all classes */
router.get('/all', function(req, res, next) {
  req.session.class_focus = true;
  req.session.current_notes = false;
  res.render('list-all-classes', {
    title: 'List Of All Classes Page',
    layout: 'layout-logged-in-classes-notes-list',
    class_focus: req.session.class_focus,
    current_notes: req.session.current_notes
  });
});

//Route to send class data to angular application
router.get('/getclassdata', function(req, res, next) {
  ClassModel.find({}, function (queryError, classes) {
    if (queryError) {
      res.status(500).send({error: 'Could not get data from database'});
    } else {
      res.json(classes);
    }
  });
});

/* GET create a class page. */
router.get('/create', function(req, res, next) {
  req.session.class_focus = false;
  res.render('class-creation-page', {
    title: 'Class Creation Page',
    class_focus: req.session.class_focus,
    class_name: false,
    layout: 'layout-logged-in-classes-notes-list'
  });
});

/* GET edit class page */
router.get('/edit/:id', function(req, res, next) {
  req.session.class_focus = false;
  ClassModel.findOne({_id: ObjectId(req.params.id)}, function (queryError, classInstance) {
    if (queryError) {
      return res.render('error', {title: 'Error Page', error: queryError});
    }
    var classContext = {
        id: classInstance.get('id'),
        class_name: classInstance.get('class_name'),
        class_number: classInstance.get('class_number'),
        class_subject: classInstance.get('class_subject')
      };
    res.render('class-edit-page', {
      title: 'List Of All Classes Page',
      classInstance: classContext,
      class_focus: req.session.class_focus,
      class_name: false,
      layout: 'layout-logged-in-classes-notes-list'
    });
  });
});

router.post('/edit/:id', function(req, res, next) {
  ClassModel.update({_id: ObjectId(req.params.id)}, {
    $set: {
      class_name: req.body.class_name,
      class_number: req.body.class_number,
      class_subject: req.body.class_subject
    }
  }, function (updateError, updatedClassDocument) {
    res.redirect('/class/all');
  });
});

/* DELETE class */
router.get('/all/delete/:id', function(req, res, next) {
  req.session.class_focus = false;
  ClassModel.findOne({_id: ObjectId(req.params.id)}, function(queryError, classData) {
    if (queryError) {
      res.render('class-detail-page', {
        title: 'Landing Page',
        error: queryError,
        layout: 'layout-no-footer'
      });
    } else {
      res.render('delete-confirmation', {
        title: 'Delete Confirmation Page',
        class_name: classData.class_name,
        item: 'class',
        data: classData,
        error: queryError,
        class_focus: req.session.class_focus,
        class_name: false,
        layout: 'layout-logged-in-classes-notes-list'
      });
    }
  });
});

router.get('/all/delete/confirmation/:id', function(req, res, next) {
  ClassModel.remove({_id: ObjectId(req.params.id)}, function(error) {
    if (error) {
      return res.render('error', {title: "Error", error: error});
    }
    ClassModel.find({}, function(error, classes) {
      if (error) {
        return res.render('error', {title: "Error", error: error});
      }
      res.render('list-all-classes', {
        title: 'List Of All Classes Page',
        classes: classes,
        layout: 'layout-no-footer'
      });
    });
  });
});

/* POST create a class */
router.post('/create', function (req, res, next) {
  var newClass = new ClassModel({
    class_name: req.body.class_name,
    class_number: req.body.class_number,
    class_subject: req.body.class_subject,
    class_notes: [],
    total_notes: 0
  });

  newClass.save(function (saveError) {
    if (saveError) {
      return res.render('create-class-error', {
        title: 'Error - did not create Class',
        error: saveError,
        layout: 'layout-no-footer'
      });
    }
    res.render('create-class-success', {
      title: 'Success - created Class',
      class_name: newClass.class_name,
      class_number: newClass.class_number,
      class_subject: newClass.class_subject,
      layout: 'layout-no-footer'
    });
  });
});

module.exports = router;
