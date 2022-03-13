function clear_gametable() {
	if (!isEmpty(DA.gameItems)) {
		//console.log(DA.gameItems)
		let t = iDiv(DA.gameItems[0]).parentNode; //document.getElementsByTagName('table')[0];
		t.remove();
	}
}
async function ensureAssets() {
	if (nundef(Syms)) {
		Syms = await route_path_yaml_dict(`${Basepath}assets/allSyms.yaml`);
		SymKeys = get_keys(Syms);
		ByGroupSubgroup = await route_path_yaml_dict(`${Basepath}assets/symGSG.yaml`);
		KeySets = getKeySets();
		C52 = await route_path_yaml_dict(`${Basepath}assets/c52.yaml`);
		ari_create_card_assets('rb');
	}
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		//console.log('child',ch)
		let checked = ch.getAttribute('checked');
		//console.log('is',checked);
		//console.log('?',ch.checked); 
		if (ch.checked) list.push(ch.value);
	}
	//console.log('list',list)
	return list;
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
	//console.log('arg2',arg2,typeof arg2)
	let html = `<a href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function processServerdata() {
	// for (const u of Serverdata.users) {
	// 	u.imgPath = `${Basepath}assets/images/${u.name}.jpg`;
	// 	//console.log('user',u.name,u)
	// }
	console.log('Serverdata.games:',Serverdata.games);
	for (const g of Serverdata.games) {
		if (isString(g.fen)) g.fen = JSON.parse(g.fen);
		if (isString(g.action)) g.action = JSON.parse(g.action);
		if (isString(g.expected)) g.expected = JSON.parse(g.expected);
		g.turn = g.fen.turn;
		g.round = g.fen.round;
	}
}
function show_gametable(dParent, clickplayer = 'onclick_player_in_gametable', clickgame = 'onclick_game') {
	clear_gametable();

	if (isEmpty(Serverdata.games)) return [];

	let items = mDataTable(Serverdata.games, dParent, null, ['name', 'gamename', 'turn', 'players', 'step', 'round']);
	//if (nundef(Serverdata.user)) Serverdata.user = { name: 'anonymous' };
	mTableCommandify(items, {
		0: (item, val) => hFunc(val, clickgame, val), //`<a href="/singlepage/${val}">${val}</a>`, 
		2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, clickplayer, valpart, rowitem.o.name)),// `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
		3: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, clickplayer, valpart, rowitem.o.name)),// `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
	});
	return items;
}
function show_home_logo() {
	let bg = colorLight();
	clearElement('dTitleLeft');
	let d = miPic('airplane', mBy('dTitleLeft'), { fz: 28, padding: 6, h: 40, box: true, matop: 2, bg: bg, rounding: '50%' });
}
function show_instruction(msg = '') { let d = mBy('dInstruction'); d.innerHTML = msg; }
function show_message(msg = '') { let d = mBy('dMessage'); d.innerHTML = msg; }
function show_table_for_old(g, dParent, uname) {

	//spotit_test1(g,dParent,uname); return;

	//console.log('_____show table', g.name, 'for user', uname);
	console.assert(isdef(g.fen), `game ${g.name} does not have a fen!`)
	console.assert(isDict(g.fen), "fen is NOT an object!!! " + g.name)
	console.assert(isdef(uname),`uname ${uname}`);
	Prevturn = isdef(Turn)?jsCopy(Turn):null;
	console.log('g.fen.turn',g.fen.turn)
	Turn = jsCopy(g.fen.turn);
	//console.log('Prevturn',Prevturn,'Turn',Turn);
	//if (isdef(U)) console.log('U.name', U.name, 'uname', uname);
	let sameuser = isdef(U) && U.name == uname;
	//if (isdef(G)) console.log('G.turn', G.turn, 'g.turn', g.turn); //,'G.fen.turn',G.fen.turn,'g.fen.turn',g.fen.turn);
	let samegame = isdef(G) && G.name == g.name;
	let sameturn = sameuser && samegame && isList(Prevturn) && isList(Turn) && sameList(Prevturn,Turn);
	// let sameturn = samegame && sameuser && isdef(G) && sameList(G.turn, g.turn);
	
	G = g;
	//if (nundef(uname)) uname = isdef(U) ? U.name : G.turn[0]; // default user is session user or first user on turn!
	U = firstCond(Serverdata.users, x => x.name == uname);
	//console.log('*** U',U.name)
	let wasmyturn = isList(Prevturn) && Prevturn.includes(U.name);
	let ismyturn = isList(Turn) && Turn.includes(U.name);
	// let wasmyturn = samegame && sameuser && G.turn.includes(U.name);
	//let ismyturn = G.turn.includes(U.name);

	//console.log('same user',sameuser,'\nsame game',samegame,'\nsame turn',sameturn,'\nwas my turn',wasmyturn,'is my turn',ismyturn);
	if (sameturn) return;

	//console.log('U', U, 'G', G);
	show_title();
	show_user();
	clearElement(dParent);

	//dTable.innerHTML = `<img src='http://localhost:8080/aroot/base/assets/images/wolfgang.jpg' />`;
	//console.log('basepath',Basepath);
	ui_game_stats(dParent, G.fen.players);
	mLinebreak(dParent, 10)
	show_message(G.fen.message);
	show_instruction(ismyturn ? G.fen.instruction : 'NOT YOUR TURN');
	show_status(G.fen.status);
	window[`${G.gamename}_present`](G, dParent, uname); //dixit_present
	if (!ismyturn) mShield(dParent);
	if (G.turn.includes(uname)) activate_ui(); //window[`${G.gamename}_activate`](G,uname);
}
function show_title(s, styles = {}, funnyLetters = true) {
	let d = mBy('dTitleCenter');
	d.innerHTML = isdef(G) ? `Battle of ${mColorLetters(capitalize(G.name))}` : `${funnyLetters ? mColorLetters(s) : s}`;
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
function show_status(msg = '') { let d = mBy('dStatus'); d.innerHTML = msg; }
function show_user() {
	if (isdef(U) && U.name != 'anonymous') show_title_left(U.name, { fg: U.color });
	else show_home_logo();
}
function submit_form(fname) {
	if (typeof document.getElementById(fname).submit === "object") {
		document.getElementById(fname).submit.remove();
	}
	document.getElementById(fname).submit();
}












