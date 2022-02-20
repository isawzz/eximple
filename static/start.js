onload = startsinglepage;

function socketinit() {
	Socket = io.connect('http://127.0.0.1:5051');
	Socket.on('connect', () => {
		console.log('...........connected!')
		Socket.send({ user: 'felix', message: 'felix connected' });
		//Socket.emit('login', { user: 'felix', message: 'felix connected' });
		//Socket.send('user has connected');
	});
	Socket.on('message', (x) => {
		console.log('message from server 1:', x);
		let elem = mBy('messages');
		mAppend(elem, mCreateFrom(`<li>${x}</li>`))
	});
}
function socketsend() {
	let elem = mBy('myMessage');
	let text = elem.value;
	elem.value = '';
	Socket.send({user:User.name,text:text});
	return false;
}

function startsinglepage() {
	general_start();
	let useritems = show_users(dTable);
	let gameitems = show_games(dTable);
	let actionitems = show_actions(dTable);
	show_home_logo(dTitle);
}

function start_info() {
	general_start();
	let useritems = show_users(dTable);
	let gameitems = show_games(dTable);
	let actionitems = show_actions(dTable);
	show_home_logo(dTitle);
}
function start_loggedin() {
	general_start();
	let gameitems = show_games(dTable);
	let actionitems = show_actions(dTable);
	show_home_logo(dTitle);
}
async function start_table() {
	general_start();
	let actionitems = show_actions(dTable);
	show_home_logo(dTitle);

}

//#region components
function general_start() {
	socketinit();

	dTitle = mBy('dTitle');
	if (isdef(Table)) show_title('Battle of ' + capitalize(Table.name), { fg: User.color }, false);
	else show_title('My Little World');

	show_user();
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });

	dTable = mBy('dTable');
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });

}
async function show_home_logo(dParent) {
	//erstmal muss ich home logo machen in obere ecke!
	//let d = mSym
	await ensureAssets();
	console.log('Syms', Syms);

}

function show_user() { if (isdef(Serverdata.user)) show_title_left(Serverdata.user.name, { fg: Serverdata.user.color }); }

function show_users(dParent) {
	let headers = ['id', 'name', 'rating', 'commands'];
	let rowitems = mDataTable(Serverdata.users, dParent, rec => ({ bg: rec.color }), headers);
	mTableCommandify(rowitems, { 1: (item, val) => `<a href="/loggedin/${val}">${val}</a>`, 3: (item, val) => `<a href="/loggedin/${item.o.name}">login</a>` });
	return rowitems;
}
function show_games(dParent) {
	let items = mDataTable(Serverdata.games, dParent, null, ['name', 'gamename', 'players', 'step', 'fen']);
	if (nundef(Serverdata.user)) Serverdata.user = { name: 'anonymous' };
	mTableCommandify(
		items, {
		0: (item, val) => `<a href="/table/${item.o.name}/${Serverdata.user.name}">${val}</a>`,
		2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => `<a href="/table/${rowitem.o.name}/${valpart}">${valpart}</a>`)
	});
	return items;
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

	for (const rec of Serverdata.actions) {
		rec.user = usersById[rec.user_id].name;
		rec.game = gamesById[rec.game_id].name;
		// console.log('liste?',rec.choices,typeof rec.choices)
		// let choices = toWords(rec.choices);
		// removeInPlace(choices,rec.choice);
		// rec.choice = 
	}
	let items = mDataTable(Serverdata.actions, dParent, null, ['game', 'user', 'choices', 'choice']);
	mTableCommandify(items, {
		0: (item, val) => `<a href="/table/${item.o.game}/${item.o.user}">${val}</a>`,
		1: (item, val) => `<a href="/table/${item.o.game}/${item.o.user}">${val}</a>`,
		2: (item, val) => {
			console.log('???', item.choice, 'isEmpty?', isEmpty(item.choice));
			return isEmpty(item.choice) ? mTableCommandifyList(item, val, (x, p) => `<a href="/action/${x.o.game}/${x.o.user}/${p}">${p}</a>`) : val;
		}
	});

	return items;
}

//#region helpers
async function ensureAssets() {
	if (nundef(Syms)) {
		Syms = await route_path_yaml_dict(`${Basepath}assets/allSyms.yaml`);
	}
}


function show_title(s, styles = {}, funnyLetters = true) {
	let d = mBy('dTitleCenter');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
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















