exports.index = function(req, res){
  res.render('user', { token: req.user.feedToken });
};

exports.summary = function(req, res) {
  res.send(req.user);
};

exports.activities = function(req, res) {
  res.send(req.user);
};
