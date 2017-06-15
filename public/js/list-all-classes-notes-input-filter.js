//Small angular application to make a get request to retrieve data from express and bind the data to view.
angular.module('List', ['ngSanitize'])
.controller('ClassListController', ['$scope', 'ListService', function($scope, ListService) {
  $scope.classList;

  ListService.getClassList().then(function(response) {
    $scope.classList = response.data;
  });
}])
.controller('NoteListController', ['$scope', 'ListService', '$sce', '$location', function($scope, ListService, $sce, $location) {
  var classTitle = $location.absUrl().split('/note/all/')[1];
  $scope.noteList;

  //Line 13 and 18 by pass angular's XSS protection
  $scope.getImgSrc = function(imgID) {
    return $sce.trustAsHtml('/image/' + imgID);
  };

  $scope.getActionURI = function(noteID) {
    return $sce.trustAsHtml('/note/all/delete/' + noteID);
  };

  ListService.getNoteList(classTitle).then(function(response) {
    $scope.noteList = response.data;
  });
}])
.service('ListService', function($http) {
  this.getClassList = function() {
    return $http.get('/class/getclassdata');
  };
  this.getNoteList = function(class_title) {
    return $http.get('/note/getnotedata/' + class_title);
  };
})
