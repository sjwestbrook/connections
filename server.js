var express = require('express')
var bodyParser = require('body-parser');
var cors = require('cors');
var _ = require('underscore');
var mongoose = require('mongoose');
var app = express();
var port = 8081;

app.use(cors());
app.use(bodyParser.json())

var User = require('./api/UserModel.js')

// app.get('/api/profiles', function (req, res) {
// 	User.find(req.query).exec(function (err, results) {
// 		res.send(results);
// 	})
// })

app.post('/api/profiles', function (req, res) {
	if (!req.body.name) {
		res.json({ success: false, message: 'Name is required' })
	} else if (req.body._id) {
		//TODO fix this. It isn't updating correctly
		User.findById(req.body._id)
			.populate('friends', 'name')
			.exec(function (err, results) {
				if (err) {
					console.log(err);
					res.json({ success: false, message: 'could not find user' })
				} else {
					var updateUser = req.body;
					delete updateUser._id;
					for (var key in updateUser) {
						if (updateUser.hasOwnProperty(key)) {
							results[key] = updateUser[key];
						}
					}
					results.save(function (err, savedProfile) {
						if (err) {
							console.log(err);
							res.json({ success: false, message: 'error updating user' })
						} else {
							res.json({ success: true, profile: savedProfile })
						}
					})
				}
			})
	} else {
		//no id, looking for name
		User.findOne({ name: req.body.name })
			.populate('friends', 'name')
			.exec(function (err, results) {
				if (err) {
					console.log(err);
					return res.json({ success: false, message: 'error saving user' })
				} else if (results) {
					var updateUser = req.body;
					for (var key in updateUser) {
						if (updateUser.hasOwnProperty(key)) {
							results[key] = updateUser[key];
						}
					}
					results.save(function (err, savedProfile) {
						if (err) {
							console.log(err);
							return res.json({ success: false, message: 'error updating user' })
						} else {
							return res.json({ success: true, profile: savedProfile })
						}
					})
				} else {
					var newUser = new User(req.body);
					newUser.save(function (err, savedUser) {
						if (err) {
							console.log(err);
							return res.json({ success: false, message: 'error creating user' })
						} else {
							return res.json({ success: true, profile: savedUser })
						}
					})
				}
			})
	}
})

app.delete('/api/profiles/:id', function (req, res) {
	var removeId = req.params.id;
	User
        .find({ 'friends': { $in: [removeId] } })
        .exec(function (err, results) {
			_.each(results, function (item) {
				item.friends.splice(item.friends.indexOf(removeId), 1);
				item.save();
			})
			User.findByIdAndRemove(removeId).exec(function (err, deleted) {
				if (err) {
					console.log(err);
					res.json({ success: false, message: 'error deleting user' })
				} else {
					res.json({ success: true, message: 'user deleted', deleted: deleted })
				}
			})
        })

})

app.post('/api/searchFriends', function (req, res) {
	var re = new RegExp(req.body.query, 'i');
	
	//find current User (for friends)
	User.findById(req.body._id).exec(function (err, thisUser) {
		if (err) {
			console.log(err);
			res.json({ success: false, message: 'no one found' })
		} else {
			var excludeFriends = thisUser.friends;

			User.find()
				.where('_id')
				.nin(excludeFriends.concat([req.body._id]))
				.where('name')
				.regex(re)
				.select('name')
				.exec(function (err, results) {
					if (err) {
						console.log(err);
						res.json({ success: false, message: 'no one found' })
					}
					res.json({ success: true, friends: results })
				})
		}
	})


})

app.put('/api/addFriend', function (req, res) {
	if (!req.body.myId || !req.body.addId) {
		return res.json({ success: false, message: 'User ids not provided' })
	}
	var myId = req.body.myId;
	var addId = req.body.addId;
	User.findById(myId)
		.populate('friends')
		.exec(function (err, results) {
			if (err) {
				console.log(err);
				return res.json({ success: false, message: 'error finding user' })
			} else {
				if (results.friends.indexOf(addId) === -1) {
					results.friends.push(addId);
					results.save(function (err, savedProfile) {
						if (err) {
							console.log(err);
							return res.json({ success: false, message: 'error saving user' })
						} else {
							var options = {
								path: 'friends',
								select: 'name'
							}
							User.populate(savedProfile, options, function (err, profile) {
								if (err) {
									console.log(err);
									return res.json({ success: false, message: err })
								} else {
									return res.json({ success: true, profile: savedProfile })
								}
							})
						}
					})
				}
			}

		})
})

app.get('/api/getFriendsFriends/:id/:myId', function (req, res) {
	var myId = req.params.myId;
	User.findById(req.params.id)
		.populate('friends', 'name')
		.exec(function (err, results) {
			if (err) {
				console.log(err)
				return res.json({ success: false, message: 'Could not find friend\'s friends' });
			} else {
				var friends = _.map(results.friends, function (item) {
					item.id = item._id
					return item;
				})
				var secondConnections = _.filter(friends, function (i) { return i.id !== myId })
				return res.json({ success: true, friends: secondConnections })
			}
		})
})

app.put('/api/deleteFriend', function (req, res) {
	if (!req.body.myId || !req.body.deleteId) {
		return res.json({ success: false, message: 'User ids not provided' })
	}
	var myId = req.body.myId;
	var deleteId = req.body.deleteId;
	User.findById(myId).exec(function (err, results) {
		if (err) {
			console.log(err)
			return res.json({ success: false, message: 'Could not find user' });
		} else {
			friends = results.friends;
			if (friends.indexOf(deleteId) !== -1) {
				friends.splice(friends.indexOf(deleteId), 1);
				results.save(function (err, updatedProfile) {
					if (err) {
						console.log(err)
						return res.json({ success: false, message: 'Error saving user' });
					} else {
						var options = {
							path: 'friends',
							select: 'name'
						}
						User.populate(updatedProfile, options, function (err, profile) {
							if (err) {
								console.log(err);
								return res.json({ success: false, message: err })
							} else {
								return res.json({ success: true, profile: updatedProfile })
							}
						})
					}
				})

			}
		}
	})
})

app.get('/api/test/:id', function (req, res) {
	var removeId = req.params.id;
	User
        .find({ 'friends': { $in: [req.params.id] } })
        .exec(function (err, results) {
			_.each(results, function (item) {
				item.friends.splice(item.friends.indexOf(removeId), 1);
				item.save();
			})
        })
})



var mongodbUri = 'mongodb://localhost/projectwk2friends';

mongoose.connect(mongodbUri);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {
	console.log('Connected to mongodb @', mongodbUri);
})

app.listen(port, function () {
	console.log('Listening on port: ' + port)
})


/*
first
	no user info
	save
	user saved: name, likes, color -> also gets _id
	user is now db doc
	user changed info -> has _id -> lookup, update with new fields' info
	name could change, so only can use name for first save, not update
		if name exists, grab user rather than saving new (on first attempt)
*/