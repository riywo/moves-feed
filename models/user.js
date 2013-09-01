var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

var Schema = mongoose.Schema;
var userSchema = new Schema({
  _id:          { type: Number, required: true },
  feedToken:    { type: String, required: true, unique: true },
  accessToken:  { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true }
});

var Feed = require('feed');
var moment = require('moment');
var moves = require('../config/moves');

userSchema.methods.summaryAtom = function(callback) {
  moves.get('/user/summary/daily?pastDays=30', this.accessToken, function(err, res, body) {
    if (err) { callback(err, null) };
    var data = JSON.parse(body);
    var feed = new Feed({
      title: 'Moves Feed Daily Summary',
      link:  process.env.MOVES_FEED_URL
    });

    data.reverse().forEach(function(daily) {
      feed.item({
        title: "Moves Daily Summary " + daily.date,
        link:  process.env.MOVES_FEED_URL,
        description: JSON.stringify(daily.summary),
        date:  moment(daily.date, 'YYYYMMDD').toDate()
      });
    });

    callback(null, feed.render('atom-1.0'));
  });
};

var User = mongoose.model('User', userSchema);
module.exports = User;
