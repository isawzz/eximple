
onload = startsocket;

function startsocket() {
	Socket = io.connect('http://127.0.0.1:5051');
	Socket.on('connect', () => {
		let user = isdef(User) ? User.name : 'nobody'
		//Socket.emit('login', { user: 'felix', message: 'felix connected' });
		Socket.send(user);
	});
	Socket.on('message', x => {
		console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<li>${x}</li>`))
	});
}
function socketsend() {
	let elem = mBy('myMessage');
	let text = elem.value;
	elem.value = '';
	Socket.send(text);
	return false;
}
