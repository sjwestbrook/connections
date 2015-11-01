var app = angular.module('app');

app.controller('HomeCtrl', function ($scope, friendService) {
	$scope.editing = false;
	$scope.myProfile = {};
	$scope.potentialFriends = [];

	$scope.toggleEdit = function () {
		$scope.editing = !$scope.editing;
	}

	$scope.saveProfile = function () {
		friendService.saveProfile($scope.myProfile)
			.then(function (savedProfile) {
				console.log('Profile saved!');
				$scope.myProfile = savedProfile;
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
					alert('You\'re already friends with everyone!');
				}
				$scope.potentialFriends = potentialFriends;
			})
			.catch(function (err) {
				console.log(err);
			})
	}

	$scope.addFriend = function (addId) {
		friendService.addFriend($scope.myProfile._id, addId)
			.then(function (updatedProfile) {
				$scope.potentialFriends.splice($scope.potentialFriends.indexOf(addId), 1);
				$scope.myProfile = updatedProfile;
			})
			.catch(function (err) {
				console.log(err);
			})
	}

	$scope.deleteFriend = function (deleteId) {
		friendService.deleteFriend($scope.myProfile._id, deleteId)
			.then(function (updatedProfile) {
				$scope.myProfile = updatedProfile;
			})
			.catch(function (err) {
				console.log(err);
			})
	}

	$scope.closeModal = function () {
		$scope.potentialFriends = [];
	}

})