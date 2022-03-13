var EBEF = null, UBEF = null, GBEF = null;
function show_table_for(g, dParent, uname) {

	let present = false;
	if (!UBEF || uname != UBEF) present = true;
	else if (!GBEF || g.name != GBEF) present = true;
	else {
		if (!EBEF) present = true;
		else {
			let keybef = get_keys(EBEF);
			let keys = get_keys(g.expected);
			console.log('keys', keybef, keys);
			if (!sameList(keybef, keys)) present = true;
			console.log('uname',uname)
			let ubef = EBEF[uname];
			let u = g.expected[uname];
			console.log('uname', ubef, u)
			console.log('STEP!!!',ubef.step,u.step)
			if (ubef.type != u.type || ubef.step != u.step) present = true;
			//if (!EBEF || EBEF[uname].type != g.expected[uname].type || EBEF[uname].step != g.expected[uname].step) present = true;
		}
	}

	console.log('need to present:', present);

	U = firstCond(Serverdata.users, x => x.name == uname);
	UBEF = U.name;
	G = g;
	GBEF = G.name;
	EBEF = jsCopy(G.expected);

	if (!present) return;

	//console.log('U', U, 'G', G);
	show_title();
	show_user();
	clearElement(dParent);

	//dTable.innerHTML = `<img src='http://localhost:8080/aroot/base/assets/images/wolfgang.jpg' />`;
	//console.log('basepath',Basepath);
	ui_game_stats(dParent, G.fen.players);
	mLinebreak(dParent, 10)
	show_message(G.fen.message);
	show_instruction(isdef(G.expected[uname]) ? G.fen.instruction : 'NOT YOUR TURN');
	show_status(G.fen.status);
	window[`${G.gamename}_present`](G, dParent, uname); //dixit_present
	if (!isdef(G.expected[uname])) mShield(dParent);
	if (G.turn.includes(uname)) activate_ui(); //window[`${G.gamename}_activate`](G,uname);
}
