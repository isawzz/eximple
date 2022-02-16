//onload = start;

function start_info() {
	let d = mBy('dTable');
	d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	let useritems = show_users(d);
	let gameitems = show_games(d);
	let actionitems = show_actions(d);

	console.log('user table row items:', useritems)
}
function start_loggedin() {
	let d = mBy('dTable');
	d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	show_home_logo(d);
	let useritem = show_user(d);
	mLinebreak(d);
	let gameitems = show_games(d);
	//show_actions();
}
function start_table() {
	let d = mBy('dTable');
	d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	let dTitle = mDiv(d, { padding:12, w: '90%', display: 'flex', 'justify-content': 'space-between' });
	show_home_logo(dTitle);
	let titleitem = show_user(dTitle);
	let useritem = show_gamename(dTitle);
	console.log('serverData', serverData);
}

async function show_home_logo(dParent) {
	//erstmal muss ich home logo machen in obere ecke!
	//let d = mSym

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
















