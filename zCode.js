//#region feb 16

function makeListOfLinks(rowitem, val) {
	let names = isString(val) ? val.split(',') : val;
	let html = '';
	for (const name of names) {
		html += `<a href="/table/${rowitem.o.name}/${name}">${name}</a>`
	}
	return html;
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
	let headers = ['id', 'name', 'rating', 'commands'];
	let extracolumn = 'commands';
	let rowitems = mDataTable(serverData.users, dParent, rec => ({ bg: rec.color }), headers);
	for (const item of rowitems) {
		let d = item.div;
		let col = mTableCol(d, `<a href="/loggedin/${item.o.name}">login</a>`);
		item.colitems.push({ div: col, key: extracolumn, val: null })
	}
	return rowitems;
}
function mDataTable4(reclist, dParent, rowstylefunc, headers, extracolumns) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	if (nundef(extracolumns)) extracolumns = [];
	//console.log('headers', headers);
	let t = mTable(dParent, headers.concat(extracolumns));
	let rowitems = [];
	for (const u of reclist) {
		r = mTableRow(t, u, headers, extracolumns); //['name','color','created'])
		
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u });
	}
	return rowitems;
}
function show_users_3(dParent) {
	let extracolumn = 'commands';
	let rowitems = mDataTable3(serverData.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating'], [extracolumn]);
	for (const item of rowitems) {
		let d = item.div;
		let col = mTableCol(d, `<a href="/loggedin/${item.o.name}">login</a>`);
		item.colitems.push({ div: col, key: extracolumn, val: null })
	}
	return rowitems;
}
function mDataTable3(reclist, dParent, rowstylefunc, headers, extracolumns) {
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

function show_users_2(dParent) {
	let rowitems = mDataTable(serverData.users, dParent, rec => ({ bg: rec.color }), ['id', 'name', 'rating']);
	mTableCommands(rowitems, { login: x => `<a href="/loggedin/${x.o.name}">login</a>` });
	return rowitems;
}


