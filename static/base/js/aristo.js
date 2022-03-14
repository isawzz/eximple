function ari_present(otree, plturn) {

	let user=G.cur_user;
	let order = [user].concat(otree.player_names.filter(x => x != user));

	let d_table = mDiv(dTable, { w: '100%', bg: '#ffffff40', padding: 10 }); mFlexWrap(d_table);// mLinebreak(d_table);
	let deck = G.deck = ui_type_deck(otree.deck, d_table);
	let market = G.market = ui_type_market(otree.market, d_table);
	let deck_discard = G.deck_discard = ui_type_deck(otree.deck_discard, d_table);
	let open_discard = G.open_discard = ui_type_market(otree.open_discard, d_table);

	//present players
	for (const uname of order) {
		let pl = otree[uname];
		let d = mDiv(dTable, { w: '100%', bg: pl.color, padding: 10 }, null, uname); mFlexWrap(d); mLinebreak(d);
		R.add_ui_node(d, getUID('u'), uname);
		ari_present_player(otree, uname, d, uname != (is_admin()?plturn:user));
	}

	highlight_player(otree.plturn);
}

function ari_present_player(otree, uname, d, ishidden=false) {
	let pl = otree[uname];
	let gpl = G[uname] = {};
	
	pl.hand.sort();	let hand = gpl.hand = ui_type_hand(pl.hand, d);	

	if (is_admin() && TESTING) { //show hand open
	}else if (ishidden) { hand.items.map(x => face_down(x)); }

	let stall = gpl.stall = ui_type_market(pl.stall, d);
	if (otree.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }

	gpl.buildings = [];
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let gb = ui_type_building(b, d);
			gb.path = `${uname}.buildings.${k}.${i}`;
			gb.type = k;
			//gb.schwein = isdef(b.schwein)?
			//hier muss ich die ui fuer schwein und harvest bekommen, if any!!! das schwein wird aufgedeckt!
			i += 1;
			gpl.buildings.push(gb);
		}
	}

}
function ari_redo_player_ui(otree, plturn) {
	let d = G[plturn].hand.container.parentNode;
	//console.log('d', d);
	d.innerHTML = plturn;
	ari_present_player(otree, plturn, d);

}
function ari_setup(player_names) {

	let pre_fen = {};

	let deck = pre_fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2]));
	shuffle(deck);

	pre_fen.market = [];
	pre_fen.deck_discard = [];
	pre_fen.open_discard = [];

	//console.log('pre_fen.deck',pre_fen.deck);

	let pls = pre_fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 7),
			buildings: { farms: [], estates: [], chateaus: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
		};
	}

	pre_fen.plorder = jsCopy(player_names);
	pre_fen.herald = player_names[0];
	pre_fen.phase = 'king';
	pre_fen.stage = 3;
	pre_fen.iturn = 0;
	pre_fen.plturn = pre_fen.plorder[pre_fen.iturn];
	pre_fen.round = [];
	pre_fen.step = 0;

	let fen = pre_fen;
	return fen;
}












//#region creat ui tree aristo: UNUSED!!!
function ari_create_ui_tree(n, dParent, r) {
	let d = null;

	//console.log('n', n.path, n.content, n);
	//console.log('playernames',r.otree.player_names,n.content);
	//endit();

	if (n.oid == 'o_1') {
		d = mDiv(dParent, { w: '100%' }, getUID('u'));
	} else if (startsWith(n.path, 'deck')) {

		//kommt nur bei deck und deck_discard!
		//console.log('n.path',n.path,'n.content',n.content);
		//if (!isEmpty(n.content)) {
		let deck = G[n.path] = ui_type_deck(n.content);
		d = deck.container; //ari_make_cardlist(n.content, 0, dParent);
		//}

		// } else if (r.otree.player_names.includes(n.content)) {

		// 	let id = getUID('u');
		// 	let bg = r.otree[n.content].color;
		// 	let styles = { bg: bg, fg: 'contrast', w: '100%' };
		// 	d = mDiv(dParent, styles, id, n.path);
		// 	//r.add_ui_node(d, id, n.oid);

	} else if (r.otree.player_names.includes(n.content)) {

		d = ui_make_player(Session.otree, n.content, dParent);

	} else if (n.type == 'cardlist') {

		d = ari_make_cardlist(n.content, 2, dParent);

	} else if (n.type == 'card') {

		return;
	} else if (n.type == 'string') {

		//if (n.oid == 'o_1') console.log('===>o_1 n',n)
		let id = getUID('u');
		d = mDiv(dParent, { bg: 'inherit' }, id, n.content);
		//r.add_ui_node(d, id, n.oid);
	}

	if (nundef(d)) return; else r.add_ui_node(d, d.id, n.oid);

	for (const ch of n.children) {
		ari_create_ui_tree(r.nodes[ch], d, r);
	}
}
//#endregion








