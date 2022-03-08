
function get_checked_radios(rg){
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for(const ch of inputs){
		//console.log('child',ch)
		let checked = ch.getAttribute('checked');
		//console.log('is',checked);
		//console.log('?',ch.checked); 
		if (ch.checked) list.push(ch.value);
	}
	//console.log('list',list)
	return list;
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
	//console.log('arg2',arg2,typeof arg2)
	let html = `<a href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
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
function add_game_to_table(gamerec,clickplayer='onclick_player_in_gametable',clickgame='onclick_game') {
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
function show_games(dParent,clickplayer='onclick_player_in_gametable',clickgame='onclick_game') {
	let items = mDataTable(Serverdata.games, dParent, null, ['name', 'gamename', 'players', 'step', 'fen']);
	//if (nundef(Serverdata.user)) Serverdata.user = { name: 'anonymous' };
	mTableCommandify(items, {
		0: (item, val) => hFunc(val, clickgame, val), //`<a href="/singlepage/${val}">${val}</a>`, 
		2: (item, val) => mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, clickplayer, valpart, rowitem.o.name)),// `<a href="/singlepage/${valpart}/${rowitem.o.name}">${valpart}</a>`)
	});
	return items;
}
function show_home_logo() {
	let bg = colorLight();
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


























