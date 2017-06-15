var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: {
    type: String,
    unique: true
  },
  displayname: String,
  username: String,
  profileurl: String,
  avatar_url: String,
  google_drive_folder_id: String
});

var commentSchema = new Schema({
  author_id: String,
  author_name: String,
  author_img_url: String,
  date: { type: Date, default: Date.now},
  note_id: String,
  text: String
});

var noteSchema = new Schema({
  date: { type: Date, default: Date.now},
  note_description: String,
  note_text: String,
  note_title: String,
  note_image_url: String,
  class_name: String,
  author_display_name: String,
  author_avatar_url: String,
  comments: Array
});

var classSchema = new Schema({
  class_name: {
    type: String,
    required: true,
    unique: true
  },
  class_number: {
    type: String,
    required: true
  },
  class_subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
});

module.exports = {
  schemas: {
    Comment: commentSchema,
    Class: classSchema,
    Note: noteSchema,
    User: userSchema
  }
};
