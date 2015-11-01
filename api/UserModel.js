var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var User = new Schema({
    name: {
        type: String,
        required: true
    },
    likes: String,
	favColor: String,
    friends: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]
});

/*Person.pre('remove', function(next) {
    // Remove all the assignment docs that reference the removed person.
    this.model('Assignment').remove({ person: this._id }, next);
});*/

// User.pre('remove', function(next) {
//     var user = this;
//     console.log('remove', user);
// 	var removeId = user._id;
// 	    this.model('User')
//         .find({ 'friends': { $in: [req.params.id]}})
//         .exec(function(err, results) {
// 			_.each(results, function(item) {
// 				item.friends.splice(item.friends.indexOf(removeId), 1);
// 				item.save();
// 			})
//             next();
//         })
// })

module.exports = Mongoose.model('User', User);