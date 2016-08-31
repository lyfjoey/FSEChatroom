// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db;
var DbServer = require('mongodb').Server;
assert = require('assert');


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Connection url
var url = 'mongodb://localhost:27017/chatroom';
var collectionName = 'message-documents';

// Chatroom
io.on('connection', function (socket) {
  socket.on('new message', function (data) {
    var message = {
      username: socket.username,
      message: data.message,
      submitTime: data.submitTime
    };
    MongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		db.collection(collectionName).insert(message);
  		db.close();
	});
    socket.broadcast.emit('new message', message);
  });

  socket.on('add user', function (username) {
    socket.username = username;
    MongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		db.collection(collectionName).find({}).toArray(function (err, documents) {
  			socket.emit('old messages', documents);
  			db.close();
  		});
	});
  });

});