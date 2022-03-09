

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


//#region helpers
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
function submit_form(fname) {
	if (typeof document.getElementById(fname).submit === "object") {
		document.getElementById(fname).submit.remove();
	}
	document.getElementById(fname).submit();

}



function onclick_game(name) {
	Table = firstCond(Tables, x => x.name == name);
	show_title();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
}
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
























