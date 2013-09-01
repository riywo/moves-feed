exports.index = function(req, res){
  res.render('user', { token: req.user.feedToken });
};

exports.summary = function(req, res) {
  req.user.summaryAtom(function(atom) {
    res.send(atom);
  });
};

exports.activities = function(req, res) {
  req.user.activitiesAtom(function(atom) {
    res.send(atom);
  });
};
