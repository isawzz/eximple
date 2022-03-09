//#region march 9
var POLLING = false;
function onclick_startpolling() {
	if (POLLING) return;
	POLLING = true;
	poll();
}
function onclick_stoppolling() {
	if (!POLLING) return;
	POLLING = false;

}
async function onclick_poll() {
	//was macht polling?
	//post user,game,table,fen,turn
	//get: user,table,fen,turn or users,tables or nothing
	let res = await route_post_form_callback('/simple', 'fRoute');
	console.log('server answer:', res)
}

//ui
function ui_input(dParent,instruction,funcname){
	let html = `
	<div id="dRoute">
		<h2>${instruction}</h2>
		<form id="fTemp" action="javascript:void(0);" onsubmit="${funcname}()" method="POST">
			<input id="inptemp" type="text" name="text" value="1" placeholder="" />
			<input type="submit" />
		</form>
	</div>
	`;
	let d=mDiv(dParent,{},null,html);

	return {div:d};
}
function ui_message(dParent,msg){
	let d=mDiv(dParent,{},null,msg);
	return {div:d,content:msg};
}
function ui_deck(items, dParent) {
	let n = items.length;
	console.log('n',n)
	console.log('parent',dParent)
	let cont = mDiv(dParent,{ bg:'red',w:200,h:300,maleft: 25, padding: 14 }); 
	let topmost = ui_add_cards_to_deck(cont, items);
	return {
		type: 'deck',
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_add_cards_to_deck(cont, items) {
	for (const item of items) {
		console.log(iDiv(item));
		mAppend(cont, iDiv(item));
		mItemSplay(item, items, 4, Card.ovdeck);
		item.turn_face_down();
		break;
	}
	return items[0];

}
function ui_make_deck(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	//mContainerSplay(d, 4, Card.w, Card.h, n, Card.ovdeck);

	return d;
}
function ui_generic_deck(dParent,deck){
	//show one card backside and name of deck
	//wie soll ein generic deck ausschauen?
	//einfach eine backflipped card
	//when clicking on that card it represents the topmost card really
	//auf der card ist die anzahl der cards in the deck
	let c = dixit_get_card(0);
	// let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
	// item.div.innerHTML = svgCode;
	let d = iDiv(c);
	d.innerHTML = C52.card_2B;
	mAppend(dParent,d);
	let d1=mDiv(d,{w:'100%',align:'center',weight:'bold',fz:24},null,`deck ${deck.length}`);
	mPlace(d1,'cc');

	return{
		keys: deck,
		div: d,
		faceUp: false,

	}

}

// old api
function startgame_old(game, players) {

	//if (nundef(players)) players = prompt('enter players, separated by commas');	players = players.split(',').map(x => x.trim());
	if (nundef(players)) players = ['mimi', 'felix'];
	//console.log('players', players);

	let f = window[`${game}_setup`]; // dixit dixit_setup bluff aristo...
	let gamerec = { gamename: game, players: players, fen: f(players) };

	//POST game to /startgame
	let o = { data: gamerec, type: 'startgame' };
	let ostring = JSON.stringify(o);
	mBy('inpost').value = ostring;
	submit_form('fRoute');

}
function selectgame_old(game, uname) {
	//if uname is not the host, nothing should happen if there is no fen!
	let g = firstCond(Tables, x => x.name == game);
	console.log('select game', game, 'for', uname, 'g', g);

	//return;
	if (!g.fen) {
		if (uname == g.players[0]) {
			let fen = window[`${g.gamename}_setup`](g.players);
			let gamerec = { name: game, user: uname, fen: fen, step: 0 };
			//POST game to /initgame
			let o = { data: gamerec, type: 'initgame' };
			let ostring = JSON.stringify(o);
			mBy('inpost').value = ostring;
			submit_form('fRoute');

		} else {
			console.log('please wait for host to initialize this game!')
		}
	} else {
		//POST game to /selectgame 
		console.log('game', game, 'user', uname); //return;
		let o = { data: { game: game, user: uname }, type: 'selectgame' };
		let ostring = JSON.stringify(o);
		mBy('inpost').value = ostring;
		submit_form('fRoute');
	}


}
function presentgame_old(g, dParent, uname) {
	console.log('g', g)
	console.assert(isdef(g.fen), 'game needs to be initialized!!!')
	g.fen = JSON.parse(g.fen)

	let d_table = mDiv(dParent, { bg: GREEN, fg: 'white', position: 'relative', padding: 10 }); mCenterFlex(d_table);
	//soll ich hier schon die players mit users enrichen?
	//fen soll eigentlich keine additional zeug dabei haben!

	let f = window[`${g.gamename}_present`]; //dixit_present
	f(g.fen, d_table, uname); // dixit bluff aristo...


}
function activategame_old(g, uname) {
	console.log('activate game for', uname)
}
function aristocracy_present(fen,d_table){
	G={};
	G.deck = ui_generic_deck(d_table,fen.deck);

	let pls = G.players = {};
	for(const uname in fen.players){
		let pl = pls[uname] = {};
		let fpl = fen.players[uname];

		let user = firstCond(Users,x=>x.name == uname);
		//copyKeys(fpl,pl);
		copyKeys(user,pl)
		console.log('pl',uname,pl)

		let d = mDiv(d_table,{bg:user.color},null,uname); mFlexWrap(d)
		pl.div = d;
		let i=0;let items = pl.hand = fpl.hand.map(x=>{i++;return aristocracy_get_card(x,i)}); //convert all aristocracy cards into items		let hand = pl.hand.map(x=>)
		for(const item of items) mAppend(d,iDiv(item));
	}
	//let i=0;let items = fen.deck.map(x=>{i++;return aristocracy_get_card(x,i)}); //convert all aristocracy cards into items
	//console.log('items',items);
	// for(const item of items){ //.slice(0,10)){
	// 	let d=iDiv(item);
	// 	mAppend(d_table,d);
	// 	setRect(d);
	// 	//mStyle(d,{position:'absolute',left:item.index/2,top:item.index/2});
	// 	//face_down(item);
	// }
	//let deck = ui_deck(items, d_table);
}
function aristocracy_get_card(ckey,index, h=200) {
	let filename = `${Basepath}assets/games/aristocracy/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h+clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h,w:h*141/200, overflow:'hidden' }, null, html, 'card');
	mMagnifyOnHoverControl(d)
	let item = {key:ckey,index:index,div:d,html:html,h:h,faceUp:true};
	d.onclick = ()=>{face_up(item);}; 
	return item; 
}

function collect_formdata() {
	var myform = mBy("fMenuInput");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
			case "name":
				let uname = inputs[i].value;
				console.log(`${key} in input is`, uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data[key] = uname.toLowerCase();
				break;
			case "motto":
				data[key] = inputs[i].value.toLowerCase();
		}
	}
	if (DA.imageChanged) {
		//do the same as I did before!
		sendHtml('imgPreview', Session.cur_user);
		//DA.imageChanged = false;
	} else {
		let udata = get_current_userdata();
		let changed = false;
		if (DA.colorChanged) { udata.color = DA.newColor; changed = true; }// DA.colorChanged = false;}
		if (data.motto != udata.motto) {
			changed = true;
			udata.motto = data.motto;
			mBy('motto').innerHTML = udata.motto;
		}
		if (changed) {
			//console.log('changed!');
			DA.next = get_login;
			db_save(); //save_users();

		}

	}


}
function show_actions(dParent) {
	//if (nundef(Users) && User.name == 'anonymous') return;
	console.assert(isdef(Users) && isdef(Tables), 'Users or Tables MISSING!!!')
	//if (nundef(Users)) Users = [User];
	//if (nundef(Tables)) Tables = [Table];
	let usersById = list2dict(Users);
	let gamesById = list2dict(Tables);
	for (const rec of Actions) {
		rec.user = usersById[rec.user_id].name;
		rec.game = gamesById[rec.game_id].name;
	}
	let items = mDataTable(Actions, dParent, null, ['game', 'user', 'choices', 'choice']);
	mTableCommandify(items, {
		0: (item, val) => hFunc(val, 'onclick_game', val), //`<a href="/singlepage/${item.o.user}/${item.o.game}">${val}</a>`,
		1: (item, val) => hFunc(val, 'onclick_user', val), //`<a href="/singlepage/${item.o.user}/${item.o.game}">${val}</a>`,
		2: (item, val) => {
			//console.log('???', item.choice, 'isEmpty?', isEmpty(item.choice));
			return isEmpty(item.choice) ? mTableCommandifyList(item, val, (x, p) => hFunc(p, 'onclick_action', x.o.user, x.o.game, p)) : val; //`<a href="/singlepage/${x.o.user}/${x.o.game}/${p}">${p}</a>`) : val;
		}
	});
	return items;
}
function add_game_to_table(gamerec, clickplayer = 'onclick_player_in_gametable', clickgame = 'onclick_game') {
	let headers = ['name', 'gamename', 'players', 'step', 'fen'];
	let items = DA.gameItems;
	console.log('gamerec', gamerec);
	console.log('items', items);
	let t = items[0].div.parentNode;
	r = mTableRow(t, gamerec, headers);
	//if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
	let newItem = { div: r.div, colitems: r.colitems, o: gamerec };
	DA.gameItems.push(newItem);
	mTableCommandify([newItem], {
		0: (item, val) => hFunc(val, clickgame, val),
		2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, clickplayer, valpart, rowitem.o.name)),// `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
	});

}
function show_home_logo() {
	let bg = colorLight();
	clearElement('dTitleLeft');
	let d = miPic('airplane', mBy('dTitleLeft'), { fz: 28, padding: 6, h: 40, box: true, matop: 2, bg: bg, rounding: '50%' });
}
function show_title(s, styles = {}, funnyLetters = true) {
	let d = mBy('dTitleCenter');
	d.innerHTML = isdef(Table) ? `Battle of ${mColorLetters(capitalize(Table.name))}` : `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, { fg: 'grey' });
}
function show_title_left(s, styles, funnyLetters = false) {
	let d = mBy('dTitleLeft');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_title_right(s, styles, funnyLetters = false) {
	let d = mBy('dTitleRight');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_user() {
	if (isdef(User) && User.name != 'anonymous') show_title_left(User.name, { fg: User.color });
	else show_home_logo();
}
function show_users(dParent) {
	let headers = ['id', 'name', 'rating', 'commands'];
	let rowitems = mDataTable(Serverdata.users, dParent, rec => ({ bg: rec.color }), headers);
	mTableCommandify(rowitems, {
		1: (item, val) => hFunc(val, 'onclick_user', val), //`<a href="/singlepage/${val}">${val}</a>`, 
		3: (item, val) => hRoute('login', 'onclick_user', item.o.name), //`<a href="/loggedin/${item.o.name}">login</a>` 
	});
	return rowitems;
}
function onclick_game(name) {
	Table = firstCond(Tables, x => x.name == name);
	show_title();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
}
function onclick_user(name, game) {
	//console.log('game',game)
	selectgame(game, name);
	//User = firstCond(Users, x => x.name == name);
	//show_user();
}
function onclick_action(user, game, action) {
	//update Actions
	let a = firstCond(Actions, x => x.user == user && x.game == game);
	console.log('action record is:', a);
	a.choice = action;

	//feststallen ob das die letzte action war
	let allcomplete = true;
	let gameActions = Actions.filter(x => x.game == game);
	for (const a1 of gameActions) {
		if (isEmpty(a1.choice)) allcomplete = false;
		//console.log('choices player',a1.user,a1.choices,typeof a1.choices); //choices is ein string!
	}

	//wenn alles fertig mach das game irgendwie anders: step erhoehen, fen veraendern!
	if (allcomplete) {
		//game step and state update
		let g = firstCond(Tables, x => x.name == game);
		g.step += 1;
		g.fen = "state for step " + g.step;

		//next action set machen!
		for (const a1 of gameActions) {
			a1.choice = '';
			a1.choices = rLetters(5).join(' ');
			//console.log('a1.choices',a1.choices)
		}

		//package post object
		// game object, action object + strings: user game action
		let o = { gamerec: g, gameactions: gameActions, user: user, game: game, action: action };
		console.log('COMPLETE!!!===>das wird gepostet:', o)
		let ostring = JSON.stringify(o);
		mBy('inpost').value = ostring;
		//console.log('das wird gepostet:',o)
		// POST UPDATE GAME ROUTE: for 

		submit_form('fRoute');
	} else {
		console.log('user', user, 'has picked action', action, 'in game', game)
		if (Socket) Socket.emit('action', { user: user, game: game, action: action });
		else {
			//nur diesen einen choice setzen
			let o = { user: user, game: game, action: action };
			console.log('das wird gepostet:', o)
			let ostring = JSON.stringify(o);
			mBy('inpost').value = ostring;
			submit_form('fRoute');

		}
	}


}

//#region feb 23
function present_table() {
	dTable = mBy('dTable')
	mCenterFlex(dTable, true, true);
	let sample = rChoose(range(0, 435), 10);
	//console.log('sample', sample);
	for (const i of sample) {
		let filename = `${Basepath}assets/games/dixit/img${i}.jpg`;
		let clip = 50;
		let html = `<img src='${filename}' height='250' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
		let d = mDiv(dTable, { margin: 10, h:200, overflow:'hidden' }, null, html, 'magnify_on_hover');
	}
}
function dixit_present(fen, d_table, plname) {
	G = {};
	//G.deck = ui_generic_deck(d_table, fen.deck);

	if (isdef(fen.story)) {
		G.story = ui_message(d_table, fen.story);
	}
	if (isdef(fen.instruction) && isdef(plname) && fen.plturn == plname) {

		

		let elem = mCreateFrom(`
		<div id="dTempForm">
			<h2>${fen.instruction}</h2>
			<form id="fTemp" action="javascript:void(0);" method="POST">
				<input id="inptemp" type="text" name="text"  />
				<input type="submit" />
			</form>
		</div>
		`);
		mAppend(d_table,elem);
		console.log('elem',elem)
		//elem.children[2].onsubmit = ()=>console.log('haaaaaaaaaaaaaaaaaaaaallllllllllo');

		// G.instruction = ui_message(d_table, fen.instruction);
		// G.input = ui_input(d_table)
	}
	if (isdef(fen.tablecards)) {
		let d = mDiv(d_table, { fg: 'white', bg: user.color, w: '100%' }, null, 'table'); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)
		let i = 0; let items = G.tablecards = fen.tablecards.map(x => { i++; return dixit_get_card(x, i) }); //convert all dixit cards into items		let hand = pl.hand.map(x=>)
		for (const item of items) mAppend(d, iDiv(item));
	}

	let pls = G.players = {};
	for (const uname in fen.players) {
		let pl = pls[uname] = {};
		let fpl = fen.players[uname];

		let user = firstCond(Users, x => x.name == uname);
		//copyKeys(fpl,pl);
		copyKeys(user, pl)
		console.log('pl', uname, pl);

		if (isdef(plname) && uname != plname) continue;

		let d = mDiv(d_table, { fg: 'white', bg: user.color, w: '100%' }, null, uname); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)

		let i = 0; let items = pl.hand = fpl.hand.map(x => { i++; return dixit_get_card(x, i) }); //convert all dixit cards into items		let hand = pl.hand.map(x=>)
		for (const item of items) mAppend(d, iDiv(item));

	}
	//let i=0;let items = fen.deck.map(x=>{i++;return dixit_get_card(x,i)}); //convert all dixit cards into items
	//console.log('items',items);
	// for(const item of items){ //.slice(0,10)){
	// 	let d=iDiv(item);
	// 	mAppend(d_table,d);
	// 	setRect(d);
	// 	//mStyle(d,{position:'absolute',left:item.index/2,top:item.index/2});
	// 	//face_down(item);
	// }
	//let deck = ui_deck(items, d_table);
}

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


