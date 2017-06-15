const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejsLayouts = require('express-ejs-layouts');
const env = require('node-env-file');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const UserModel = mongoose.model('Users', db.schemas.User);
const landingPageRoutes = require('./routes/landing-page');
const registrationRoutes = require('./routes/registration');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const classRouter = require('./routes/classRouter');
const noteRouter = require('./routes/noteRouter');
const adminView = require('./routes/admin-view');
const imageRouter = require('./routes/imageRouter');
const driveRouter = require('./routes/driveRouter');
const authRouter = require('./routes/auth');


var google = require('googleapis');
var googleAuth = require('google-auth-library');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(process.env.GOOG_ID, process.env.GOOG_SECRET, 'http://www.shareshare.us/auth/google/callback');

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//load .env
var fs = require('fs');
if (fs.existsSync(__dirname + '/.env')) {
  env(__dirname + '/.env');
}

//Set up for google Passport strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOG_ID,
  clientSecret: process.env.GOOG_SECRET,
  callbackURL: 'http://www.shareshare.us/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
  // check if user already exists, if they do pass profile information
  UserModel.findOne({id: profile.id}, function (err, queryProfile) {
    if (!queryProfile) {
      oauth2Client.credentials = {
        access_token: accessToken
      };
      var service = google.drive({ version: 'v3', auth: oauth2Client });
      service.files.create({
        resource: {
          'name' : 'shareshare',
          'mimeType' : 'application/vnd.google-apps.folder'
        },
         fields: 'id'
      }, function(err, folder) {
        if(err) {
          done(err);
        } else {
          var profileImgUrl = profile._json.image.url.replace('sz=50', '');
          UserModel.create({
            id: profile.id,
            displayname: profile.displayName,
            profileurl: profile.profileUrl,
            avatar_url: profileImgUrl,
            username: profile.username,
            google_drive_folder_id: folder.id,
          }, function (err, newProfile) {
            done(null, {
              profile: newProfile.toJSON(),
              accessToken: accessToken
            });
          })
        }
      });
    } else {
      done(null, {
        profile: queryProfile.toJSON(),
        accessToken: accessToken
      });
    }
  });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(ejsLayouts); //override the default response.render() behavior
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL}),
  secret: "faridonfire",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.locals.loggedin = req.isAuthenticated();
  if (req.user) {
    res.locals.user = req.user.profile;
  }

  // if youre visiting a class page
  if (req.url.indexOf('/note/all/') !== -1) {
    // set in session
    req.session.currentClassUrl = req.url;
    // put in locals context
    res.locals.currentClassUrl = req.session.currentClassUrl;
  } else {
    // if you're not visting a class page, grab value from session or default value if not set
    res.locals.currentClassUrl =  req.session.currentClassUrl || '/class/all';
  }
  next();
});

app.use('/', landingPageRoutes);
app.use('/register', registrationRoutes);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/auth', authRouter);
app.use('/class', classRouter);
app.use('/note', noteRouter);
app.use('/admin-view', adminView);
app.use('/image', imageRouter);
app.use('/drive', driveRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error Page',
    message: err.message,
    error: {}
  });
});


module.exports = app;
