//onload = start;

function start_info() {
	let d=mBy('dTable');
	d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	let useritems = show_users(d);
	let gameitems = show_games(d);
	let actionitems = show_actions(d);
}
function start_loggedin() {
	let d=mBy('dTable');
	d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	show_home_logo(d);
	let useritem = show_user(d);
	mLinebreak(d);
	let gameitems = show_games(d);
	//show_actions();
}

function show_home_logo(dParent){
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
function mDataTable(reclist, dParent, rowstylefunc, headers) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	console.log('headers', headers);
	let t = mTable(dParent, headers);
	let rowitems = [];
	for (const u of reclist) {
		r = mTableRow(t, u, headers); //['name','color','created'])
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u });
	}
	return rowitems;
}
function show_user(dParent){
	let u=serverData.user;
	let d = mDiv(dParent,{fg:u.color,align:'center'},null,`<h1>${u.name}</h1>`);
	return {div:d,rec:u,uname:u.name};
}
function show_users(dParent) {
	let rowitems = mDataTable(serverData.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating']);
	for (const item of rowitems) {
		let d = item.div;
		//append a column that allows me to login to that user!
		//<a href="/spiele/tables/{{user.name}}">login</a>
		mTableCol(d,`<a href="/loggedin/${item.o.name}">login</a>`)
	}
	return rowitems;
}
function show_games(dParent) {
	let items = mDataTable(serverData.games, dParent, null, ['name', 'gamename', 'players', 'step', 'fen']);
	return items
}
function show_actions(dParent) {
	let items = mDataTable(serverData.actions, dParent, null, ['choices', 'choice', 'user_id', 'game_id']);
	return items;
}

function activate_columns(rowitems,header,func){
	for(const item of rowitems){
		console.log('row',item);
	}
}
















