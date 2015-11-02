var app = angular.module('app');

app.controller('HomeCtrl', function ($scope, friendService, $window) {
	$scope.editing = false;
	$scope.myProfile = {};
	$scope.potentialFriends = [];
	
	$scope.checkLocalStorage = function() {
		if ($window.localStorage.myProfile) {
			$scope.myProfile = JSON.parse($window.localStorage.myProfile);
		}
	}
	
	// get the profile from localStorage on page load/refresh, if it exists
	$scope.checkLocalStorage();
	
	$scope.addProfileToLocalStorage = function() {
		$window.localStorage.myProfile = JSON.stringify($scope.myProfile);
	}

	$scope.toggleEdit = function () {
		$scope.editing = !$scope.editing;
	}

	$scope.saveProfile = function () {
		friendService.saveProfile($scope.myProfile)
			.then(function (savedProfile) {
				console.log('Profile saved!');
				$scope.myProfile = savedProfile;
				$scope.addProfileToLocalStorage();
				$scope.editing = false;
			})
			.catch(function (err) {
				alert(err);
				console.log(err);
			});
	}

	$scope.deleteProfile = function () {
		if ($scope.myProfile._id) {
			var id = $scope.myProfile._id;
			friendService.deleteProfile(id)
				.then(function (deletedProfile) {
					console.log(deletedProfile);
					console.log('deleted');
					$scope.addProfileToLocalStorage();
					$scope.myProfile = {};
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	}

	$scope.searchFriends = function (name, myId) {
		if (!myId) {
			return alert('Please enter and save your profile first!');
		}
		friendService.findFriends(name, myId)
			.then(function (potentialFriends) {
				if (!potentialFriends.length) {
					alert('You\'re friends with everyone that meets this search criteria!' );
				}
				$scope.potentialFriends = potentialFriends;
				$scope.friendSearch = '';
			})
			.catch(function (err) {
				console.log(err);
			})
	}
	
	$scope.handleEnterOnSearchInput = function (event) {
		if (event.keyCode === 13) {
			$scope.searchFriends($scope.friendSearch, $scope.myProfile._id);
		}
	}

	$scope.addFriend = function (addId) {
		friendService.addFriend($scope.myProfile._id, addId)
			.then(function (updatedProfile) {
				$scope.potentialFriends.splice($scope.potentialFriends.indexOf(addId), 1);
				$scope.myProfile = updatedProfile;
				$scope.addProfileToLocalStorage();
			})
			.catch(function (err) {
				console.log(err);
			})
	}

	$scope.deleteFriend = function (deleteId) {
		friendService.deleteFriend($scope.myProfile._id, deleteId)
			.then(function (updatedProfile) {
				$scope.myProfile = updatedProfile;
				$scope.addProfileToLocalStorage();
			})
			.catch(function (err) {
				console.log(err);
			})
	}

	$scope.closeModal = function () {
		$scope.potentialFriends = [];
	}
	
	$scope.logout = function() {
		$scope.myProfile = {};
		delete $window.localStorage.myProfile;
	}

})