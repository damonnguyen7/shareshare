//this document is for interacting with the site with jquery
$(document).ready(function() {

  //class creation error - button hides or display error
  var creationErrorDisplayed = false;
  $('.error-btn').click(function() {
    if (!creationErrorDisplayed) {
      $('.error-msg').show();
      creationErrorDisplayed = true;
    } else if (creationErrorDisplayed) {
      $('.error-msg').hide();
      creationErrorDisplayed = false;
    }
  });

  //pop over
  $('[data-toggle="popover"]').popover({
    container: 'body'
  });

  //use jquery to change class for mobile view for note detail page.
  var screenWidth = window.screen.availWidth;

  if (window.screen.availWidth === 320 || window.screen.availWidth === 360 || window.screen.availWidth === 412 || window.screen.availWidth === 375 || window.screen.availWidth === 414) {
    $('.navbar').css('width', screenWidth);
    //note detail page
    $('.note-detail-page').css('padding', '0px 0px');
    $('.note-detail-page').removeClass('col-xs-10 col-xs-offset-1');
    $('.note-detail-page').addClass('col-xs-12');
    $('.note-description').removeClass('col-xs-10');
    $('.note-description').addClass('col-xs-12');
    $('.note-description').css('font-size', '12px');
    var detached = $('.publisher-img, .publisher-username').detach();
    // detached.appendTo($('.note-description'));
    // $('.publisher-img').css('margin', '8px 0px');
    // $('.publisher-img').css('margin-left', '70px')
    // $('.publisher-username').prepend('<p>Published by:<p>');
    // $('.publisher-username').css('position', 'absolute');
    // $('.publisher-username').css('font-size', '12px');
    // $('.publisher-username').css('left', '125px');
    // $('.publisher-username').css('top', '135px');

    $('.comment-submit').removeClass('pull-right');
    $('.comment-submit').addClass('btn-block');
    $('.comment-submit').css('margin-bottom', '10px');

    $('.comment-description').css('font-size', '12px');
    $('.comment-description').removeClass('col-xs-10');
    $('.comment-description').addClass('col-xs-9');
    $('.comment-description').addClass('col-xs-offset-1');
    $('.publisher-comment-username').css('font-size', '10px');
    //note edit
    $('.edit-h3').css('font-size', '16px');
    $('.edit-h3').css('width', '300px');
  };

});
