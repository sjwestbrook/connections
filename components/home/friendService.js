var app = angular.module('app');

app.service('friendService', function ($http, $q) {

	function findFriendsFriends(profile, dfd) {

		var friends = profile.friends;
		var index = 0;

		function getNextFriend() {
			console.log(friends[index])
			if (friends[index]) {
				$http.get('http://localhost:8081/api/getFriendsFriends/' + friends[index]._id + '/' + profile._id)
					.then(function (friendResponse) {
						if (friendResponse.data.success) {
							friends[index].friends = friendResponse.data.friends
							index++;
							getNextFriend();
						}
					})
					.catch(function (err) {
						console.log(err)
					})

			} else {
				console.log(profile);
				return dfd.resolve(profile);
			}
		}
		getNextFriend();
	}

	this.saveProfile = function (profile) {
		var dfd = $q.defer();
		$http.post('http://localhost:8081/api/profiles', profile)
			.then(function (response) {
				if (response.data.success) {
					if (response.data.profile.friends) {
						var profile = response.data.profile
						findFriendsFriends(profile, dfd);
					}

				} else {
					dfd.reject(response.data.message);
				}
			})
			.catch(function (err) {
				dfd.reject(err);
			});

		return dfd.promise;
	}

	this.deleteProfile = function (id) {
		var dfd = $q.defer();
		$http.delete('http://localhost:8081/api/profiles/' + id)
			.then(function (response) {
				if (response.data.success) {
					console.log(response.data.deleted);
					dfd.resolve(response.data.deleted);
				} else {
					dfd.reject(response.data.message);
				}
			})
			.catch(function (err) {
				dfd.reject(err);
			})

		return dfd.promise;
	}

	this.findFriends = function (name, id) {
		var dfd = $q.defer();
		$http.post('http://localhost:8081/api/searchFriends', {
			query: name,
			_id: id
		})
			.then(function (response) {
				if (response.data.success) {
					console.log(response.data.friends);
					dfd.resolve(response.data.friends);
				}
			})
			.catch(function (err) {
				dfd.reject(err);
			})
		return dfd.promise;
	}

	this.addFriend = function (myId, addId) {
		var dfd = $q.defer();
		$http.put('http://localhost:8081/api/addFriend', {
			myId: myId,
			addId: addId
		})
			.then(function (response) {
				if (response.data.success) {
					if (response.data.profile.friends) {
						var profile = response.data.profile
						findFriendsFriends(profile, dfd);
					} else {
						dfd.resolve(response.data.profile)

					}
				} else {
					dfd.reject('Error adding friend')
				}
			})
			.catch(function (err) {
				dfd.reject(err);
			})

		return dfd.promise;
	}

	this.deleteFriend = function (myId, deleteId) {
		var dfd = $q.defer();
		$http.put('http://localhost:8081/api/deleteFriend', {
			myId: myId,
			deleteId: deleteId
		})
			.then(function (response) {
				if (response.data.success) {
					console.log(response.data);
					if (response.data.profile.friends) {
						var profile = response.data.profile
						findFriendsFriends(profile, dfd);
					} else {
						dfd.resolve(response.data.profile)
					}
				} else {
					dfd.reject('Error removing friend')
				}
			})
			.catch(function (err) {
				dfd.reject(err);
			})

		return dfd.promise;
	}

})