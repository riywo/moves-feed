exports.index = function(req, res){
  res.render('user', { token: req.user.feedToken });
};

exports.summary = function(req, res) {
  req.user.summaryAtom(function(err, atom) {
    if (err) { res.status(500).send(err) };
    res.set({
      'Content-Type': 'application/atom+xml'
    });
    res.send(atom);
  });
};
