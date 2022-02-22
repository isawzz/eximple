function socketinit() {
	console.log('... socket client initialized');
	Socket = io.connect('http://127.0.0.1:5000');
	Socket.on('connect', () => {
		console.log('...........connected!')
		Socket.emit('message',{ user: 'felix', message: 'felix connected' });
		//Socket.emit('login', { user: 'felix', message: 'felix connected' });
		//Socket.send('user has connected');
	});
	Socket.on('message', (x) => {
		//console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<pre>${x}</pre>`))
	});
	Socket.on('action', (a) => {
		console.log('action from server 1:', a);
		//update action table: in that action need to set choice and update choices
		if (a.done){
			//host: update game POST updated
			//last player updates! no player should be able to move at this point!
			//current step will be closed at this point!
			console.log('Tables',Tables)
			let table = firstCond(Tables, x=>x.name == a.game);
			let step = table.step;
			//update game hiere!
			table.step += 1;
			table.fen = {state:'some new state'};
			Socket.send({ user: a.user, game:a.game, step: table.step, message: 'game updated', fen: table.fen });
			// let players = table.players;
			// console.log('the players of table',a.game,'are',players)
			// let host = table.players[0];
			// if (a.user == host){
			// 	console.log('host has moved and ')
			// }
			//server=>at this point everyone should get a 'please reload' message 
			//if I am the user, should update fen and post/reload gameupdated
			//otherwise just reload the 
		}else{
			//just update ui with new action
			let ao = firstCond(Actions,x=>x.user == a.user && x.game == a.game);
			console.log('action that was changed:',ao,'index',ao.indexOf(Actions))
			//a.choic
		}
		//let elem = mBy('messages');
		//mAppend(elem, mCreateFrom(`<li>${x}</li>`))
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
