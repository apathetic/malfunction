var express = require('express');
var fs = require('fs')
// var path = require('path');

var port = 3000;
var app = express();
var thePossibilites = [];

fs.readdirSync('public').forEach(function(name) {
  route = 'public/' + name + '/index.html';
  if (fs.existsSync(route)) {
    thePossibilites.push(route);
  }
});


app.use(express.static(__dirname + '/public'));

app.use(function(req, res) {
  var site = (req.query.site && req.query.site < thePossibilites.length)
    ? req.query.site
    : Math.floor(Math.random() * thePossibilites.length);
  // site = 2;  // not so random. Rain
  // site = 4;  // not so random. Waves

  res.sendfile( thePossibilites[site] );
});

app.listen(port, function() {
  console.log('malfunction at http://localhost:' + port);
});
