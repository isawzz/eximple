//#region feb 23
function dixit_present(fen,d_table){
	//let i=0;let items = fen.deck.map(x=>{i++;return dixit_get_card(x,i)}); //convert all dixit cards into items
	//console.log('items',items);
	G={};
	G.deck = ui_generic_deck(d_table,fen.deck);
	// for(const item of items){ //.slice(0,10)){
	// 	let d=iDiv(item);
	// 	mAppend(d_table,d);
	// 	setRect(d);
	// 	//mStyle(d,{position:'absolute',left:item.index/2,top:item.index/2});
	// 	//face_down(item);
	// }
	//let deck = ui_deck(items, d_table);
}
function turnfacedown(c){
	let d=iDiv(c);
	mDiv100(d,{bg:'orange'});
}
function onclick_action(user, game, action) {
	//socketsend
	console.log('user',user,'has picked action',action,'in game',game)
	Socket.emit('action',{user:user,game:game,action:action});
}
function socketinit_() {
	console.log('init socket client');
	console.log('==>SOCKETSERVER:',SOCKETSERVER)
	Socket = io.connect(SOCKETSERVER);
	Socket.on('connect', x => {
		console.log('...........connected!',x);
		Socket.emit('message','user has connected'); //wie in testsocketio
		//Socket.emit('message',{ user: 'felix', message: 'felix connected' });
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
function socketsend_() {
	let elem = mBy('myMessage');
	let text = elem.value;
	elem.value = '';
	Socket.send({ user: isdef(User)?User.name:'hallo', text: text });
	return false;
}




var Socket;
function start() {
	Socket = io.connect(SOCKETSERVER);
	Socket.on('connect', () => {
		console.log('...........connected!', x);
		Socket.emit('message', 'user has connected');
	});
	Socket.on('message', (x) => {
		console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<pre>${x.hallo}</pre>`));
	});
}
function socketsend() {
	let elem = mBy('myMessage');
	let text = elem.value;
	//elem.value = '';
	//Socket.send(text); //ok
	Socket.emit('message', { text: text, user: 'felix' }); //ok
	return false;
}


//#region feb 16

function makeListOfLinks(rowitem, val) {
	let names = isString(val) ? val.split(',') : val;
	let html = '';
	for (const name of names) {
		html += `<a href="/table/${rowitem.o.name}/${name}">${name}</a>`
	}
	return html;
}

function mTableCommands(rowitems, di) {
	let t = rowitems[0].div.parentNode;
	mTableHeader(t, 'commands');
	for (const item of rowitems) {
		let drow = item.div;
		let dcol = mTableCol(drow);
		let colitem = { div: dcol, key: 'commands', val: null };
		item.colitems.push(colitem);
		let html = '';
		for (const k in di) {
			html += di[k](item); //`<a href="/loggedin/${item.o.name}">login</a>`);

		}
		dcol.innerHTML = html;
	}
}
function show_users(dParent) {
	let headers = ['id', 'name', 'rating', 'commands'];
	let extracolumn = 'commands';
	let rowitems = mDataTable(Serverdata.users, dParent, rec => ({ bg: rec.color }), headers);
	for (const item of rowitems) {
		let d = item.div;
		let col = mTableCol(d, `<a href="/loggedin/${item.o.name}">login</a>`);
		item.colitems.push({ div: col, key: extracolumn, val: null })
	}
	return rowitems;
}
function mDataTable4(reclist, dParent, rowstylefunc, headers, extracolumns) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	if (nundef(extracolumns)) extracolumns = [];
	//console.log('headers', headers);
	let t = mTable(dParent, headers.concat(extracolumns));
	let rowitems = [];
	for (const u of reclist) {
		r = mTableRow(t, u, headers, extracolumns); //['name','color','created'])

		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u });
	}
	return rowitems;
}
function show_users_3(dParent) {
	let extracolumn = 'commands';
	let rowitems = mDataTable3(Serverdata.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating'], [extracolumn]);
	for (const item of rowitems) {
		let d = item.div;
		let col = mTableCol(d, `<a href="/loggedin/${item.o.name}">login</a>`);
		item.colitems.push({ div: col, key: extracolumn, val: null })
	}
	return rowitems;
}
function mDataTable3(reclist, dParent, rowstylefunc, headers, extracolumns) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	if (nundef(extracolumns)) extracolumns = [];
	//console.log('headers', headers);
	let t = mTable(dParent, headers.concat(extracolumns));
	let rowitems = [];
	for (const u of reclist) {
		r = mTableRow(t, u, headers); //['name','color','created'])
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u });
	}
	return rowitems;
}

function show_users_2(dParent) {
	let rowitems = mDataTable(Serverdata.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating']);
	mTableCommands(rowitems, { login: x => `<a href="/loggedin/${x.o.name}">login</a>` });
	return rowitems;
}


