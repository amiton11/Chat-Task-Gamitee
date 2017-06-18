var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var names = [];

app.get('/public/style/style.css', function(req, res){
  res.sendFile(__dirname + '/public/style/style.css');
});
app.get('/public/script/client-script.js', function(req, res){
  res.sendFile(__dirname + '/public/script/client-script.js');
});
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
	var name="";

	socket.on('chose name', function(userName){
    	if (names.indexOf(userName) > -1)
    	{
    		socket.emit('taken name');
    	}
    	else
    	{
			name=userName;
	    	console.log(userName + " has joined the chat room.");
	    	socket.broadcast.emit("user join", name);
	    	socket.emit('valid name', names);
	    	names.push(name);
    	}
 	});	

  	socket.on('chat message', function(msgData){
    	console.log('(' + msgData.time + ') ' + msgData.sender + ': ' + msgData.content); // doesn't support hebrew - but the client does
    	socket.broadcast.emit('chat message', msgData);
 	});

 	socket.on('delete message', function(msgId){
		console.log('message ' + msgId + ' has been deleted.');
		socket.broadcast.emit('delete message', {id: msgId});
 	});

 	socket.on('disconnect', function(){
 		if (name)
 		{
 			console.log(name + ' has disconnected.');
 			socket.broadcast.emit("user leave", name);
 			if (names.indexOf(name) > -1)
 				names.splice(names.indexOf(name), 1);
 		}
 	});
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on port:' + port);
});