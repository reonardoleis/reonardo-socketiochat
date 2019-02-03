const express = require('express');
const path = require('path');
const PORT = process.env.port || 3000;
const app = express();
const server = require('http').createServer(app); 
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
	res.render('index.html');
});

var users = [];
var messages = [];

io.on('connection', socket => {
	
	socket.emit('previousMessages', messages);

	socket.on('newUser', data => {
		users.push(data);
		socket.username = data;
		socket.broadcast.emit('addUser', users);
		socket.emit('connectedUsers', users);
	});
	socket.on('sendMessage', data => {
		messages.push(data);
		socket.broadcast.emit('receivedMessage', data);
	});
	socket.on('disconnect', function(){
		users.splice(users.indexOf(socket.username), 1);
		socket.broadcast.emit('connectedUsers', users);
	})

});

server.listen(PORT);
