const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// extract query parameters
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomInfo', ({ room, users }) => {
	roomName.innerText = room;
	userList.innerHTML = `
		${users.map(user => `<li>${user.username}</li>`).join('')}
	`;
})

socket.on('message', message => {
	output(message);

	// scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', e => {
	e.preventDefault();

	const message = e.target.msg.value;

	socket.emit('chatMessage', message);

	e.target.msg.value = '';
	e.target.msg.focus();
});

function output(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `
		<p class="meta">${message.username} <span>${message.time}</span></p>
		<p class="text">${message.text}</p>
	`;
	chatMessages.appendChild(div);
}