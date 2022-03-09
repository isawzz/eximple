function clear_gametable(){
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
function show_gametable(dParent, clickplayer = 'onclick_player_in_gametable', clickgame = 'onclick_game') {
	clear_gametable();

	if (isEmpty(Serverdata.games)) return [];

	let items = mDataTable(Serverdata.games, dParent, null, ['name', 'gamename', 'players', 'step']);
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
function show_table_for(g, dParent, uname) {

	console.assert(isdef(g.fen),`game ${g.name} does not have a fen!`)
	if (isString(g.fen)) g.fen = JSON.parse(g.fen);

	console.assert(isDict(g.fen), "fen is NOT an object!!! " + g.name)

	if (nundef(uname)) uname = g.fen.turn[0]; // default user is first user on turn!
	User = firstCond(Serverdata.users, x => x.name == uname);
	Table = g;
	console.log('User', User, 'Table', Table);
	show_title();
	show_user();

	let d_table = mDiv(dParent, { bg: GREEN, fg: 'white', position: 'relative', padding: 10 }); mCenterFlex(d_table);
	let f = window[`${g.gamename}_present`]; //dixit_present
	f(g.fen, d_table, uname); // dixit bluff aristo...

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
async function startgame(game, players) {
	if (nundef(game)) game = 'dixit';
	game = 'dixit'; //temp!
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => x.name);
	//console.log('players', players);
	let fen = dixit_setup(players);
	let o = { type: 'startgame', game: game, players: players, fen: fen, turn: fen.turn };
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();
	
	Serverdata.games.push(gamerec);
	console.log('Serverdata',Serverdata);
	DA.gameItems = show_gametable(dTable);
	//add_game_to_table(gamerec);

	//console.log('gamerec', gamerec);
	//console.log('fen', gamerec.fen)

	show_table_for(gamerec, dTable)
}












