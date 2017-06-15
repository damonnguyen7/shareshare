var $commentSubmitButton = $('[data-container=submit_comment]');
var $commentTextArea = $('[data-container=comment_text]');
var noteid = $('[data-noteid]').attr('data-noteid');

$commentSubmitButton.on('click', function(event) {
  // send ajax of comment for particular note
  var text = $commentTextArea.val()

  var commentData = {
    text: text,
    noteid: noteid
  };
  $.ajax({
    url: '/note/comment/create',
    method: 'post',
    data: commentData,
    success: function () {
      // append last comment to top of list
      location.reload();
    }
  });
});
