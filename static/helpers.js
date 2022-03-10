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
		//KeySets = getKeySets();
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
	for (const g of Serverdata.games) {
		g.ofen = JSON.parse(g.fen);
		g.turn = g.ofen.turn;
		g.round = g.ofen.round;
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
	});
	return items;
}
function show_home_logo() {
	let bg = colorLight();
	clearElement('dTitleLeft');
	let d = miPic('airplane', mBy('dTitleLeft'), { fz: 28, padding: 6, h: 40, box: true, matop: 2, bg: bg, rounding: '50%' });
}
function show_instruction(msg=''){	let d=mBy('dInstruction');	d.innerHTML = msg;}
function show_message(msg=''){	let d=mBy('dMessage');	d.innerHTML = msg;}
function show_table_for(g, dParent, uname) {

	console.log('show table', g.name, 'for user', uname);
	console.assert(isdef(g.fen), `game ${g.name} does not have a fen!`)
	console.assert(isDict(g.ofen), "fen is NOT an object!!! " + g.name)

	G = g;
	if (nundef(uname)) uname = isdef(U) ? U.name : G.turn[0]; // default user is session user or first user on turn!
	U = firstCond(Serverdata.users, x => x.name == uname);
	let ismyturn = G.turn.includes(U.name);
	console.log('U', U, 'G', G);
	show_title();
	show_user();

	clearElement(dTable);
	show_message(G.ofen.message);
	show_instruction(ismyturn?G.ofen.instruction:'NOT YOUR TURN');
	show_status(G.ofen.status);
	window[`${G.gamename}_present`](G.ofen, dTable, uname); //dixit_present
	if (!ismyturn) mShield(dTable);
	// if (G.turn.includes(uname)) window[`${G.gamename}_activate`](G.ofen,uname);
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
function show_status(msg=''){	let d=mBy('dStatus');	d.innerHTML = msg;}
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












