const path = require('path');
const { createServer } = require('http');

const express = require('express');
const { Server } = require('socket.io');

const formatMessage = require('./utils/message');
const { joinUser, getUser, leaveUser, getRoomUsers } = require('./utils/users');

const botName = 'ChatCord';

const app = express();
const server = createServer(app);

const io = new Server(server);

io.on('connection', socket => {
	socket.on('joinRoom', ({ username, room }) => {
		const user = joinUser(socket.id, username, room);

		socket.join(user.room);

		// emit only to the client
		socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

		// emit to everyone except the client
		socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${username} has joined the chat`));

		// send users and room info
		io.to(user.room).emit('roomInfo', {
			room: user.room,
			users: getRoomUsers(room)
		});		
	});

	socket.on('chatMessage', message => {
		const user = getUser(socket.id);
		io.to(user.room).emit('message', formatMessage(user.username, message));
	});

	socket.on('disconnect', () => {
		const user = leaveUser(socket.id);

		if (user) {
			// emit to everyone
			io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

			// send users and room info
			io.to(user.room).emit('roomInfo', {
				room: user.room,
				users: getRoomUsers(user.room)
			});	
		}
	});

});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));