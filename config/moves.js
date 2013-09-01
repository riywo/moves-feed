var Moves = require('moves');
var moves = new Moves({
    client_id:     process.env.MOVES_CLIENT_ID,
    client_secret: process.env.MOVES_CLIENT_SECRET,
    redirect_uri:  process.env.MOVES_REDIRECT_URI
});

module.exports = moves;
