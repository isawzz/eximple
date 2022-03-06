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
async function route_js(url){
	//url needs to start with /
	let data = await fetch(SOCKETSERVER + url);
	return await data.json();
}
async function route_js_callback(url,callback){
	let data = await fetch(SOCKETSERVER + url);
	let o = await data.json();
	callback(o);
}
async function route_post_callback(url,data,callback){
	let res = await fetch(SOCKETSERVER + url,{method:'POST',body:data});
	let o = await res.json();
	callback(o);
}
async function route_post_form_callback(url,formname,callback){
	let formdata = new FormData(mBy(formname));
	let res = await fetch(SOCKETSERVER + url,{method:'POST',body:formdata});
	let o = await res.text();
	if (isdef(callback)) callback(o); 
	return o;
}
async function route_post_form_callback_js(url,formname,callback){
	let formdata = new FormData(mBy(formname));
	let res = await fetch(SOCKETSERVER + url,{method:'POST',body:formdata});
	let o = await res.json();
	callback(o);
	return o;
}
function sendAction(boat, callbacks) {
	//timit.timeStamp('send');
	plidSentStatus = G.player;
	let pl = G.playersAugmented[G.player];
	let route = '/action/' + pl.username + '/' + G.serverData.key + '/' + boat.desc + '/';
	let t = boat.tuple;
	//console.log('tuple is:',t);

	_sendRouteJS(route + t.map(x => _pickStringForAction(x)).join('+'), data => {
		preProcessData(data);
		if (!isEmpty(callbacks)) callbacks[0](data, arrFromIndex(callbacks, 1));
	});
}









