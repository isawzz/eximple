function socketinit() {
	Socket = io.connect('http://127.0.0.1:5000');
	Socket.on('connect', () => {
		console.log('...........connected!')
		Socket.send({ user: 'felix', message: 'felix connected' });
		//Socket.emit('login', { user: 'felix', message: 'felix connected' });
		//Socket.send('user has connected');
	});
	Socket.on('message', (x) => {
		console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<li>${x}</li>`))
	});
}
function socketsend() {
	let elem = mBy('myMessage');
	let text = elem.value;
	elem.value = '';
	Socket.send({ user: isdef(User)?User.name:'hallo', text: text });
	return false;
}



async function route_path_yaml_dict(url) {
	let data = await fetch(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
