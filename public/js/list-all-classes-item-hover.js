$(document).ready(function() {
  $.contextMenu({
      selector: '.list-group-item', 
      callback: function(key, options) {
        var url;
          if (key === 'edit') {
            url = '/class/edit/' + options.$trigger[0].id;
            window.location.replace(url);
          } 
          if (key === 'delete') {
            url = '/class/all/delete/' + options.$trigger[0].id;
            window.location.replace(url);
          }
      },
      items: {
          "edit": {name: "Edit", icon: "edit"},
          "delete": {name: "Delete", icon: "delete"},
          "sep1": "---------",
          "quit": {name: "Cancel", icon: function(){
              return 'context-menu-icon context-menu-icon-quit';
          }}
      }
  });

  $('.context-menu-one').on('click', function(e){
      console.log('clicked', this);
  }) 
});