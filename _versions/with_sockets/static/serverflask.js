function socketinit() {
	Socket = isdef(window.io)? io.connect(SOCKETSERVER):null;
	if (!Socket) {
		console.log('no sockets!!!!!!!!!!!');
		mBy('dChat').style.display = 'none';
		return;
	}
	Socket.on('connect', () => {
		console.log('...........connected!');
		Socket.emit('message', 'user has connected');
	});
	Socket.on('message', (x) => {
		console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<pre>${x.hallo}</pre>`));
	});
}
function socketsend() {
	if (!Socket) {
		console.log('no sockets!!!!!!!!!!!')
		return;
	}
	let elem = mBy('myMessage');
	let text = elem.value;
	//elem.value = '';
	//Socket.send(text); //ok
	Socket.emit('message',{text:text, user:'felix'}); //ok
	return false;
}

async function route_path_yaml_dict(url) {
	let data = await fetch(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
