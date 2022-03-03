onload = startsinglepage;

function present_table() {

	//console.assert(isdef(Table) && isdef(User), 'table or user missing! cannot present table!');

	//just present a bunch of dixit cards
	//img0.jpg ... img435.jpg
	dTable = mBy('dTable')
	mCenterFlex(dTable, true, true);
	let sample = rChoose(range(0, 435), 10);
	console.log('sample', sample);
	for (const i of sample) {
		let filename = `${Basepath}assets/games/dixit/img${i}.jpg`;
		let clip = 50;
		let html = `<img src='${filename}' height='250' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
		let d = mDiv(dTable, { margin: 10, h:200, overflow:'hidden' }, null, html, 'magnify_on_hover');
	}


}

function startgame(game) {
	present_table(); return;
	//let players = prompt('enter players, separated by commas');	players = players.split(',').map(x => x.trim());
	let players = ['mimi','felix'];
	console.log('players', players);
	let fen = bluff_setup(players);
	console.log('fen',fen);
	//ich brauch die choices
	
	
	for(const pl of players){
		if (fen.plturn == pl){
			
		}
	}
}

async function startsinglepage() {
	await ensureAssets();
	//socketinit();
	Socket = null;

	dTitle = mBy('dTitle');
	show_title('My Little World');

	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });

	dTable = mBy('dTable');
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });

	//DA.useritems = show_users(dTable);
	DA.gameitems = show_games(dTable);
	DA.actionitems = show_actions(dTable);

	//show_card(dTable); //OK!

	show_user(); //show_home_logo();
}
function onclick_user(name) {
	User = firstCond(Users, x => x.name == name);
	show_user();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
}
function onclick_game(name) {
	Table = firstCond(Tables, x => x.name == name);
	show_title();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
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
//#region helpers
async function ensureAssets() {
	if (nundef(Syms)) {
		Syms = await route_path_yaml_dict(`${Basepath}assets/allSyms.yaml`);
		SymKeys = get_keys(Syms);
		ByGroupSubgroup = await route_path_yaml_dict(`${Basepath}assets/symGSG.yaml`);
		//KeySets = getKeySets();
		C52 = await route_path_yaml_dict(`${Basepath}assets/c52.yaml`);
		ari_create_card_assets('rb');
	}
}
function hRoute(content, route, arg1, arg2, arg3) {
	let html = `<a href="/${route}"`;
	if (isdef(arg1)) html += `/${arg1}`;
	if (isdef(arg2)) html += `/${arg2}`;
	if (isdef(arg3)) html += `/${arg3}`;
	html += `">${content}</a>`;
	return html;
}
function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function show_actions(dParent) {
	lst = Actions.map(x => console.log(`${x.game} ${x.user} choices:${x.choices} choice:${x.choice}`));
	if (nundef(Users) && User.name == 'anonymous') return;
	if (nundef(Users)) Users = [User];
	if (nundef(Tables)) Tables = [Table];

	console.log('Users', Users, 'Tables', Tables);
	// console.assert(isdef(Tables) || isdef(Table) , 'no user records!!!!!!!!!!!!!!!!');
	let usersById = list2dict(Users);
	console.log('usersByid', usersById);
	let gamesById = list2dict(Tables);
	console.log('gamesByid', gamesById);

	for (const rec of Actions) {
		rec.user = usersById[rec.user_id].name;
		rec.game = gamesById[rec.game_id].name;
		// console.log('liste?',rec.choices,typeof rec.choices)
		// let choices = toWords(rec.choices);
		// removeInPlace(choices,rec.choice);
		// rec.choice = 
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
function show_games(dParent) {
		let items = mDataTable(Serverdata.games, dParent, null, ['name', 'gamename', 'players', 'step', 'fen']);
	if (nundef(Serverdata.user)) Serverdata.user = { name: 'anonymous' };
	// mTableCommandify(
	// 	items, {
	// 	//0: (item, val) => `<a href="/singlepage/${User.name}/${item.o.name}">${val}</a>`,
	// 	2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
	// });
	mTableCommandify(items, {
		0: (item, val) => hFunc(val, 'onclick_game', val), //`<a href="/singlepage/${val}">${val}</a>`, 
		2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, 'onclick_user', valpart)),// `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
	});
	return items;
}
async function show_home_logo() {
	//erstmal muss ich home logo machen in obere ecke!
	//let d = mSym
	//console.log('Syms', Syms);
	//mSym('airplane',mBy('dTitleLeft'),{padding:3,fz:30,bg:'darkviolet',rounding:'50%'});
	let bg = colorLight();
	//bg = hslToHex(360, 100, 50);
	//console.log('bg',bg);
	//let h = rHue();
	//console.log('h',h)
	//bg = hslToHex(h, 100, 50);
	//console.log('bg',bg);
	let d = miPic('airplane', mBy('dTitleLeft'), { fz: 28, padding: 6, h: 40, box: true, matop: 2, bg: bg, rounding: '50%' });
	//mPlace(d,'cc');
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
















