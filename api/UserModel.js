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

module.exports = Mongoose.model('User', User);