onload = startsinglepage;

function startsinglepage() {
	socketinit();

	dTitle = mBy('dTitle');
	show_title('My Little World');

	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });

	dTable = mBy('dTable');
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });

	DA.useritems = show_users(dTable);
	DA.gameitems = show_games(dTable);
	DA.actionitems = show_actions(dTable);
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
	//socketsend
	console.log('user',user,'has picked action',action,'in game',game)
	Socket.emit('action',{user:user,game:game,action:action});
}
//#region helpers
async function ensureAssets() {
	if (nundef(Syms)) {
		Syms = await route_path_yaml_dict(`${Basepath}assets/allSyms.yaml`);
		SymKeys = get_keys(Syms);
		ByGroupSubgroup = await route_path_yaml_dict(`${Basepath}assets/symGSG.yaml`);
		//KeySets = getKeySets();
		C52 = await route_path_yaml_dict(`${Basepath}assets/c52.yaml`);
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
	await ensureAssets();
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















