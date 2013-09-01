var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

var Schema = mongoose.Schema;
var userSchema = new Schema({
  _id:          { type: Number, required: true },
  feedToken:    { type: String, required: true, unique: true },
  accessToken:  { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true }
});


var moment = require('moment');
var moves = require('../config/moves');

userSchema.methods.summaryAtom = function(callback) {
  moves.get('/user/summary/daily?pastDays=30', this.accessToken, function(err, res, body) {
    callback(body);
  });
};

userSchema.methods.activitiesAtom = function(callback) {
  moves.get('/user/activities/daily?pastDays=7', this.accessToken, function(err, res, body) {
    callback(body);
  });
};

var User = mongoose.model('User', userSchema);
module.exports = User;
