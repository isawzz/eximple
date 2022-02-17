function mColorLetters(s){
	return toLetters(s).map(x=>`<div style='display:inline-block;transform:rotate(${rChoose([10,5,-10,-5])}deg);color:${rColor()}'>${x==' '?'&nbsp;':x}</div>`).join('');
}

//onload = start;
async function ensureAssets(){
	if (nundef(Syms)){
		Syms = await route_path_yaml_dict(`${basepath}assets/allSyms.yaml`);
	}

}
function general_start(){
	dTitle = mBy('dTitle');
	show_title(isdef(serverData.table)?serverData.table.name:'My Little World');
	if (isdef(serverData.user)) show_title_left(serverData.user.name,{fg:serverData.user.color});

	dTable = mBy('dTable');
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });

}
function show_title(s, styles={}, funnyLetters=true){
	let d = mBy('dTitleCenter');
	d.innerHTML = `${funnyLetters?mColorLetters(s):s}`;
	if (isdef(styles)) mStyle(d,styles);
}
function show_title_left(s, styles, funnyLetters=false){
	let d = mBy('dTitleLeft');
	d.innerHTML = `${funnyLetters?mColorLetters(s):s}`;
	if (isdef(styles)) mStyle(d,styles);
}
function show_title_right(s, styles, funnyLetters=false){
	let d = mBy('dTitleCenter');
	d.innerHTML = `${funnyLetters?mColorLetters(s):s}`;
	if (isdef(styles)) mStyle(d,styles);
}
function start_info() {
	general_start();
	//show_title('My Little World!')
	let useritems = show_users(dTable);
	let gameitems = show_games(dTable);
	let actionitems = show_actions(dTable);
	console.log('user table row items:', useritems)
	show_home_logo(dTitle);
}
function start_loggedin() {
	general_start();
	//show_title('My Little World!')
	//show_title_left(serverData.user.name,{fg:serverData.user.color});
	//let useritem = show_user(dTitle);
	let gameitems = show_games(dTable);
	//show_actions();
	show_home_logo(dTitle);
}
async function start_table() {
	
	//show_title('battle of '+serverData.game.name,{},true);
	// let titleitem = show_user(dTitle);
	// let useritem = show_gamename(dTitle);
	console.log('serverData', serverData);
	await show_home_logo(dTitle);

}

async function show_home_logo(dParent) {
	//erstmal muss ich home logo machen in obere ecke!
	//let d = mSym
	await ensureAssets();
	console.log('Syms',Syms);

}

function mTable(dParent, headers) {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	mClass(t, 'table');
	let code = `<tr>`;
	for (const h of headers) {
		code += `<th>${h}</th>`
	}
	code += `</tr>`;
	t.innerHTML = code;
	return t;
}
function mTableCol(r, val) {
	let col = mCreate('td');
	mAppend(r, col);
	if (isdef(val)) col.innerHTML = val;
	return col;
}
function mTableHeader(t, val) {
	let col = mCreate('th');
	mAppend(t.firstChild, col);
	col.innerHTML = val;
	return col;
}
function mTableRow(t, o, keys) {
	let elem = mCreate('tr');
	mAppend(t, elem);
	let colitems = [];
	for (const k of keys) {
		let col = mTableCol(elem, o[k]);
		//let col = mCreate('td'); mAppend(elem, col); col.innerHTML = o[k];
		colitems.push({ div: col, key: k, val: o[k] })
	}
	return { div: elem, colitems: colitems };
}
function mDataTable(reclist, dParent, rowstylefunc, headers, extracolumns) {
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
function show_user(dParent) {
	let u = serverData.user;
	let d = mDiv(dParent, { fg: u.color, align: 'center' }, null, `<h1>${u.name}</h1>`);
	return { div: d, rec: u, uname: u.name };
}
function show_gamename(dParent) {
	let u = serverData.game;
	let d = mDiv(dParent, { fg: u.color, align: 'center' }, null, `<h1>battle of ${u.name}</h1>`);
	return { div: d, rec: u, title: u.name };
}
function show_users_2(dParent) {
	let rowitems = mDataTable(serverData.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating']);
	mTableCommands(rowitems, { login: x => `<a href="/loggedin/${x.o.name}">login</a>` });
	return rowitems;
}
function mTableCommandify(rowitems, di) {
	//di: index:function(rowitem,current_colitem.val)
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			console.log('colitem',colitem)
			colitem.div.innerHTML = di[index](item, colitem.val);

		}
	}
}
function makeListOfLinks(item,val){
	let names=isString(val)?val.split(','):val;
	let html='';
	for(const name of names){
		html+=`<a href="/table/${item.o.name}/${name}">${name}</a>`
	}
	return html;
}
function show_games(dParent) {
	let items = mDataTable(serverData.games, dParent, null, ['name', 'gamename', 'players', 'step', 'fen']);
	if (nundef(serverData.user)) serverData.user = {name:'anonymous'};
	mTableCommandify(items, { 0: (item, val) => `<a href="/table/${item.o.name}/${serverData.user.name}">${val}</a>`, 2: makeListOfLinks });

	// if (isdef(serverData.user)){
	// 	mTableCommandify(items, { 0: (item, val) => `<a href="/table/${item.o.name}${isdef(serverData.user)?`/${serverData.user.name}`:''}">${val}</a>` })
	// }else{
	// 	mTableCommandify(items, { 0: (item, val) => `<a href="/info">${val}</a>` })
	// }
	
	return items;
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
	let extracolumn = 'commands';
	let rowitems = mDataTable(serverData.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating'], [extracolumn]);
	for (const item of rowitems) {
		let d = item.div;
		let col = mTableCol(d, `<a href="/loggedin/${item.o.name}">login</a>`);
		item.colitems.push({ div: col, key: extracolumn, val: null })
	}
	return rowitems;
}
function show_actions(dParent) {
	let items = mDataTable(serverData.actions, dParent, null, ['choices', 'choice', 'user_id', 'game_id']);
	return items;
}

function activate_columns(rowitems, header, func) {
	for (const item of rowitems) {
		console.log('row', item);
	}
}
















