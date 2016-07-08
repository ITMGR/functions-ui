angular.module('Titan').controller('IndexController', ['$scope', '$controller', '$timeout', 'Group', 'Job', function($scope, $controller, $timeout, Group, Job) {
  $controller('ParentCtrl', {$scope: $scope})

  $scope.perPage = 10;


  $scope.init = function() {
    $scope.resetGroupValues();

    $scope.groupService = new Group($scope.serverErrorHandler)

    $scope.groupService.all({}, function(groups){
      $scope.groups = groups;
    });

  }

  $scope.resetGroupValues = function() {
    $scope.selectedJob = null;
    // zero-based
    $scope.currentPage = 0;
    // cursor[pageN] is required to load page `pageN`
    $scope.cursors = [];
    $scope.isLoading = false;
  }

  $scope.selectGroup = function(group){
    $scope.resetGroupValues();
    $scope.selectedGroup = group;

    $scope.loadGroupJobs();
  }

  $scope.loadGroupJobs = function(){
    $scope.isLoading = true;
    var page = $scope.currentPage;
    var cursor = $scope.cursors[page];
    var jobService = new Job($scope.selectedGroup, $scope.serverErrorHandler);
    jobService.all({per_page: $scope.perPage, cursor: cursor}, function(data){
      $scope.groupJobs = data.jobs;
      $scope.cursors[page + 1] = data.cursor;
      $scope.isLoading = false;
    })
  }

  $scope.previousPage = function(){
    if ($scope.currentPage > 0 && !$scope.isLoading) {
      $scope.currentPage = $scope.currentPage - 1;
      $scope.loadGroupJobs();
    }
  }

  $scope.nextPage = function(){
    // TODO: remove +1 after fix
    if (($scope.groupJobs.length + 1) >= $scope.perPage && !$scope.isLoading) {
      $scope.currentPage = $scope.currentPage + 1;
      $scope.loadGroupJobs();
    }
  }

  $scope.showPayload = function(job) {
    $scope.selectedJob = job;
    console.log("$scope.selectedJob  1:",$scope.selectedJob);
    $timeout(function(){$('#jobPayloadModal').modal()}, 50);
  }

  $scope.formattedPayload = function(job) {
    if (!job) {
      return
    };
    var payload = job.payload;
    try {
      payload = JSON.stringify(JSON.parse(payload), null, 4);
    } catch (undefined) {}

    return payload;
  }

  $scope.cancelJob = function(job) {
    var jobService = new Job($scope.selectedGroup, $scope.serverErrorHandler)

    if (confirm("Do you really want to cancel job #" + job.id + " ?")){
      jobService.cancel(job, function(updatedjob){
        console.log("jobService.cancel!!", updatedjob);
        // TODO: update properly
        job.status = updatedjob.status;
      });
    }
  }

  $scope.retryJob = function(job) {
    var jobService = new Job($scope.selectedGroup, $scope.serverErrorHandler)

    if (confirm("Do you really want to retry job #" + job.id + " ?")){
      jobService.retry(job, function(updatedjob){
        console.log("jobService.retry!!", updatedjob);
        // TODO: update properly
        job.status = updatedjob.status;
      });
    }
  }




  $scope.init();

}]);
