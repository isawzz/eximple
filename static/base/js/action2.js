
//#region select/toggle selection
function clear_previous_level() {
	//if there was a previous level, all its items
	//console.log('items', items);
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		//console.log('previous level items',A.items);
		//console.log('previous selected idx', A.selected);
		A.ll.push({ items: A.items, selected: A.selected });
		//let dParent = window[`dActions${A.level}`];
		//let children = arrChildren(dParent);
		for (const item of A.items) {

			//es kann sein dass er garkeine buttons hat, wenn das letzte level weniger options als min hatte!
			//console.log('item from last level', item);
			//console.log('idButton', item.idButton, 'idCard', item.idCard, 'ui', iDiv(item));
			//if (isdef(item.idButton)) {
			let bui = mBy(item.idButton);
			remove_hover_ui(bui);
			//console.log('bui', bui)
			item.idButton = bui.id = getUID();
			let uid = item.idCard;
			let cui = isdef(uid) ? mBy(uid) : null;
			//console.log('bui');
			if (A.selected.includes(item.index)) {
				bui.onclick = null;
				if (cui) { mRemoveClass(cui, 'hoverScale'); cui.onclick = null; }
			} else {
				bui.style.opacity = 0;
				if (cui) { mRemoveClass(cui, 'hoverScale'); cui.onclick = null; }
			}
			//}
		}
	}

}
function a2_add_selection(items, label, min = 0, max = 100, goto_post = true) {
	//have to select at least min and at most max items
	clear_previous_level();
	A.level++;
	A.items = items;
	A.goto_post = goto_post;
	A.selected = [];

	//foreach item mache eine ui und/oder activate current ui
	let show_submit_button = min > 1 || min != max;
	let dParent = window[`dActions${A.level}`];
	//console.log('items', items);
	for (const item of items) {
		//mach einen button
		let a = item.a;
		let idButton = getUID('b'); item.idButton = idButton; A.di[idButton] = item; item.uids = [idButton];
		//let idButton = `b_${a}`; item.idButton = idButton; A.di[idButton] = item; item.uids = [idButton];
		let b = mButton(a, show_submit_button ? a2_toggle_selection : a2_select, dParent, { fz: 13 }, ['donebutton', 'enabled'], idButton);

		//if a game object for this action exists, activate it
		//console.log('item.o', item.o)
		if (isdef(item.o)) {
			// { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.hand`, index: i };
			let go = item.o;
			//console.log('go', go)
			let d = iDiv(go);
			go.id = d.id = getUID();
			mClass(d, 'hoverScale');
			d.onclick = show_submit_button ? a2_toggle_selection : a2_select;
			let idCard = d.id; item.idCard = idCard; A.di[idCard] = item; item.uids.push(idCard);
			set_hover_ui(b, go);

		}
	}

	if (show_submit_button) {
		if (isdef(mBy('b_submit'))) { let b = mBy('b_submit'); mAppend(dParent, b); }
		else mButton('submit', goto_post ? a2_post_if_uiActivated : a2_pre_if_uiActivated, dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_submit');
	}

	if (isdef(mBy('b_restart_action'))) { let b = mBy('b_restart_action'); mAppend(dParent, b); }
	else mButton('restart action', () => turn_send_reload(G.otree.plturn), dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_restart_action');

	if (items.length <= min) {
		//all items are selected and directly goto post or pre
		//was ist wenn es 0 sind? sollte gehen eigentlich!
		uiActivated = false;
		for (let i = 0; i < items.length; i++) {
			A.selected.push(i);
			let a = items[i];
			mStyle(mBy(a.idButton), { bg: 'yellow' });
			if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
		}

		setTimeout(() => { if (goto_post) { ari_post_action(); } else { ari_pre_action(); } }, 500);
		//if (goto_post) { ari_post_action(); } else { ari_pre_action(); }
	} else if (is_admin()) {
		let movekey = G.otree.plturn + '_' + ITER;
		let selection_list = DA.auto_moves[movekey];
		if (nundef(selection_list)) selection_list = DA.auto_moves[ITER];
		if (isEmpty(selection_list)) return;

		uiActivated = false;
		let selection = selection_list.shift();

		let numbers = [];
		for (const el of selection) {
			if (el == 'last') {
				numbers.push(A.items.length-1);
			} else if (isString(el)) {
				//this is a command!
				let commands = A.items.map(x => x.key);
				let idx = commands.indexOf(el);
				//console.log('idx of', el, 'is', idx)
				numbers.push(idx);
			} else numbers.push(el);
		}
		selection = numbers;
		//console.log('got selection for', movekey, selection, '\nrest', DA.auto_moves[movekey]);
		setTimeout(() => {
			A.selected = selection;
			if (selection.length == 1) A.selected_key = A.items[A.selected[0]].key;
			a2_highlight_selected_items();
			//console.log('goto_post?', A.goto_post ? 'YES' : 'no', goto_post ? 'YES' : 'no');
			if (A.goto_post) { ari_post_action(); } else { ari_pre_action(); }
		}, 1000);
	}
}
function a2_post_if_uiActivated() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_post_action();
}
function a2_pre_if_uiActivated() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_pre_action();
}
function a2_highlight_selected_items() {
	for (const i of A.selected) {
		let a = A.items[i];
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');

	}
}
function a2_select(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	//console.log('a2_select')
	let id = evToId(ev);
	let a = A.di[id];
	A.selected = [a.index];
	A.selected_key = A.items[a.index].key;
	//console.log('...A.selected_key', A.selected_key)
	//console.log('clicked action', a.key, 'next', A.goto_post ? 'post' : 'pre');
	mStyle(mBy(a.idButton), { bg: 'yellow' });
	if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	if (A.goto_post) ari_post_action(); else ari_pre_action();
}
function a2_toggle_selection(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let id = evToId(ev);
	let a = A.di[id];
	//console.log('clicked action ', a.key)
	if (A.selected.includes(a.index)) {
		// console.log('remove action');
		removeInPlace(A.selected, a.index);
		mStyle(mBy(a.idButton), { bg: 'grey' });
		// console.log('idCard',a.idCard);
		if (isdef(a.idCard)) mClassRemove(mBy(a.idCard), 'card_selected');
	} else {
		// console.log('add action', a.index);
		A.selected.push(a.index);
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	}
}
//#endregion

//#region get items for various object groups
function a2_get_hand_items(uname) {
	let items = [], i = 0;
	for (const o of G[uname].hand.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.hand`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_open_discard_items() {
	let items = [], i = 0;
	for (const o of G.open_discard.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_harvest_items(uname) {
	let items = []; let i = 0;
	for (const gb of G[uname].buildings) {
		//console.log('gbuilding', gb);
		if (isdef(gb.harvest)) {
			let d = gb.harvest;
			mStyle(d, { cursor: 'pointer', opacity: 1 });
			gb.div = d;
			let name = 'H' + i + ':' + (gb.list[0][0] == 'T' ? '10' : gb.list[0][0]);
			let item = { o: gb, a: name, key: name, friendly: name, path: gb.path, index: i };
			i++;
			items.push(item);
		}
	}
	return items;
}
function a2_get_building_items(uname) {
	let gblist = G[uname].buildings;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_farms_estates_items(uname) { return a2_get_building_items_of_type(uname, ['farms', 'estates']); }
function a2_get_estates_chateaus_items(uname) { return a2_get_building_items_of_type(uname, ['estates', 'chateaus']); }

function a2_get_building_items_of_type(uname, types = ['farms', 'estates', 'chateaus']) {
	let gblist = G[uname].buildings.filter(x => types.includes(x.type));
	//console.log('gblist', gblist);
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_buildings(gblist) {
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_other_buildings(plturn) {
	let items = [], i = 0;
	for (const uname of G.otree.plorder) {
		if (uname == plturn) continue;
		items = items.concat(a2_get_buildings(G[uname].buildings));
	}
	a2_reindex(items);
	return items;
}
function a2_get_stall_items(uname) {
	let items = [], i = 0;
	for (const o of G[uname].stall.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.stall`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_hidden_building_items(b) {
	let items = [];
	for (let i = 1; i < b.items.length; i++) {
		let o = b.items[i];
		//console.log('o',o);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: b.path + '.list', index: i - 1 };
		items.push(item);
	}
	return items;
}
function a2_get_all_hidden_building_items(uname) {
	let items = [];
	for (const gb of G[uname].buildings) {
		items = items.concat(a2_get_hidden_building_items(gb));
	}
	a2_reindex(items);
	return items;
}
function a2_get_market_items() {
	let items = [], i = 0;
	for (const o of G.market.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_commands(plturn) {
	let avail = ari_get_actions(G.otree, plturn);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function a2_get_endgame(plturn) {
	let items = [], i = 0;
	for (const cmd of ['end game', 'go on']) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function a2_get_coin_amounts(plturn) {
	let items = [];
	for (let i = 0; i <= G.otree[plturn].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
//concatenating primitive lists of items:
function a2_get_trade_items(uname) {
	let items = a2_get_market_items(uname);
	items = items.concat(a2_get_stall_items(uname));//zuerst eigene!
	for (const plname of G.otree.plorder) {
		if (plname != uname) items = items.concat(a2_get_stall_items(plname));
	}
	a2_reindex(items);
	return items;
}
function a2_get_hand_and_stall_items(uname) {
	let items = a2_get_hand_items(uname);
	items = items.concat(a2_get_stall_items(uname));

	a2_reindex(items);
	return items;
}
function a2_get_build_items(uname) { return a2_get_hand_and_stall_items(uname); }
function a2_get_repair_items(uname) {
	//all hand items
	let ihand = a2_get_hand_items(uname);
	//all stall items
	let istall = a2_get_stall_items(uname);
	//all invisible (1+) building items
	let irepair = a2_get_all_hidden_building_items(uname);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	a2_reindex(items);
	return items;
}
//#endregion

//#region check available actions
function ari_get_actions(otree, plturn) {
	//actions include market card exchange
	let actions = ['trade', 'repair', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tide', 'commission', 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for plturn
		let avail = ari_check_action_available(a, otree, plturn);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;
	// {trade:ari_trade_actions(otree,plturn),

}
function ari_check_action_available(a, otree, plturn) {
	let cards;
	let pl = otree[plturn];
	if (a == 'trade') {
		//there must be 2 cards visible in stalls & market
		cards = ari_get_all_trading_cards(otree);
		//console.log('trade', cards);
		return cards.length >= 2;
	} else if (a == 'repair') {
		cards = ari_get_all_wrong_building_cards(otree, plturn);
		return cards.length > 0;
	} else if (a == 'build') {
		//this player needs to have at least 4 cards in total (stall+hand)
		let res = ari_get_player_hand_and_stall(otree, plturn);
		if (res.length < 4) return false;
		//it has to be a king phase and player has money
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (otree.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		//player has to have at least 1 farm or estate
		if (isEmpty(pl.buildings.farms) && isEmpty(pl.buildings.estates)) return false;
		//it has to be a king phase and player has money
		let res = ari_get_player_hand_and_stall(otree, plturn);
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (otree.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		//this player needs to have at least 1 estate or chateau
		//if (isEmpty(pl.buildings.chateaus) && isEmpty(pl.buildings.estates)) return false;
		//or: this player needs to have at least 1 building
		if (isEmpty(pl.buildings.farms) && isEmpty(pl.buildings.chateaus) && isEmpty(pl.buildings.estates)) return false;
		return true;
	} else if (a == 'buy') {
		//there has to be some card in open_discard
		if (otree.open_discard.length == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(otree, plturn);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (otree.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		//there has to be some building in any other player
		let others = otree.plorder.filter(x => x != plturn);
		let n = 0;
		for (const uname of others) {
			for (const k in otree[uname].buildings) {
				n += otree[uname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(otree, plturn);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (otree.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		//there has to be some harvest card
		let harvests = ari_get_all_building_harvest_cards(otree, plturn);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		//there has to be some card in stall
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		//there has to be at least 2 cards in stall
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		//there has to be at least 2 cards in stall
		return true;
	}
}
function ari_get_all_building_harvest_cards(otree, uname) {
	let res = [];
	let pl = otree[uname];
	for (const b of pl.buildings.farms) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_wrong_building_cards(otree, uname) {
	let res = [];
	let pl = otree[uname];
	for (const k in pl.buildings) {
		for (const b of pl.buildings[k]) {
			let bcards = b.list;
			let lead = bcards[0];
			let [rank, suit] = [lead[0], lead[1]];
			for (let i = 1; i < bcards.length; i++) {
				if (bcards[i][0] != rank) res.push({ c: bcards[i], building: b });
			}
		}
	}
	return res;
}
function ari_get_all_trading_cards(otree) {
	//each co_action is of the form {ckey,path} path is path in G and otree
	let res = [];
	otree.market.map(c => res.push({ key: c, path: 'market' }));

	for (const uname of otree.plorder) {
		let pl = otree[uname];
		//console.log('uname',uname,'pl',pl)
		let stall = pl.stall;
		//console.log('stall',stall);
		stall.map(x => res.push({ key: x, path: `${uname}.stall` }));
	}
	// let plcardlists = otree.plorder.map(x => otree[x].stall);
	// plcardlists.map(x => x.map(c => res.push[{ c: c, path: `${x}.stall` }]));
	return res;
}
function ari_get_all_trading_cards_orig(otree) {
	//each co_action is of the form {ckey,owner} ownner can be market or stall
	let res = [];
	let plcardlists = otree.plorder.map(x => otree[x].stall);
	plcardlists.map(x => x.map(c => res.push[{ c: c, owner: x }]));
	otree.market.map(c => res.push({ c: c, owner: 'market' }));
	return res;
}
function ari_get_player_hand_and_stall(otree, plturn) {
	let res = [];
	res = res.concat(otree[plturn].hand);
	res = res.concat(otree[plturn].stall);
	return res;
}
//#endregion

//#region helpers
function ari_action_round_over(otree, plturn) {
	ari_move_market_to_discard(otree);
	ari_move_stalls_to_hands(otree);
	ari_add_hand_card(otree);
	otree.round = [];
	otree.iturn = 0;
	if (otree.stage == 10) {
		//nach ende von king phase!
		otree.phase = 'queen';
		otree.stage = 3;
	} else if (otree.phase == 'king') {
		//geh nur in stage 10 wenn irgendwer meets endconditions!!!
		otree.pl_gameover = [];
		for (const uname of otree.plorder) {
			let [bcorrect, realvps] = ari_get_correct_buildings(otree[uname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			if (can_end) otree.pl_gameover.push(uname);
		}
		if (!isEmpty(otree.pl_gameover)) {
			otree.stage = 10;
			//console.log('plorder',otree.plorder,'pl_gameover',otree.pl_gameover,'iturn',otree.iturn);
			otree.iturn = otree.plorder.indexOf(otree.pl_gameover[0]);
		} else {
			otree.phase = 'queen';
			otree.stage = 3;
		}
	} else if (otree.phase == 'queen') {

		//distribute coins
		for (const uname of otree.plorder) {
			//console.log('buildings of', uname, otree[uname].buildings)
			for (const k in otree[uname].buildings) {
				if (k == 'farms') continue;

				let n = otree[uname].buildings[k].length;
				otree[uname].coins += n;
			}
		}

		otree.phase = 'jack';
		otree.stage = 3;
	} else {
		//gesamte runde fertig: herald moves!
		ari_move_herald(otree, plturn);
		ari_add_harvest_cards(otree);
		otree.phase = 'king';
		ari_tax_phase_needed(otree, plturn);

	}

}
function ari_add_hand_card(otree) {
	//distribute cards
	for (const uname of otree.plorder) {
		ari_ensure_deck(otree, 1);
		top_elem_from_to(otree.deck, otree[uname].hand);
	}
}
function ari_add_harvest_cards(otree) {
	//console.log('deck', jsCopy(otree.deck));
	for (const uname of otree.plorder) {
		for (const f of otree[uname].buildings.farms) {
			if (nundef(f.h)) {
				//what is run out of cards!!!
				let list = [];
				ari_ensure_deck(otree, 1);
				top_elem_from_to(otree.deck, list);
				//let ckey = otree.deck.shift();
				f.h = list[0];
				//console.log('adding harvest key', f.h, jsCopy(otree.deck));
			}
		}
	}
}
function ari_check_end_condition(blist) {
	let nchateau = blist.chateaus.length;
	let nfarm = blist.farms.length;
	let nestate = blist.estates.length;
	if (nchateau >= 2 || nchateau >= 1 && nfarm >= 3 || nchateau >= 1 && nestate >= 2) {
		return true;
	}
	return false;

}
function ari_complete_building() {
	//build the building!
	let [otree, plturn] = [G.otree, G.otree.plturn];
	let building_items = A.selected.map(x => A.items[x]); //A.building_items;

	let building_type = building_items.length == 4 ? 'farms' : building_items.length == '5' ? 'estates' : 'chateaus';
	console.log('...building a', building_type);

	//assume building items are in order so that first one is key card!

	otree[plturn].buildings[building_type].push({ list: building_items.map(x => x.key), h: null });

	//remove building_items from hand/stall
	for (const item of building_items) {
		let source = lookup(otree, item.path.split('.'));
		removeInPlace(source, item.key);
	}

	//let building = arrLast(otree[plturn].buildings[building_type]);
	//anim_show_building(building)
	ari_redo_player_ui(otree, plturn);
	ari_next_action(otree, plturn);

}
function ari_complete_upgrade() {
	//build the building!
	let [otree, plturn] = [G.otree, G.otree.plturn];
	//console.log('...finish upgrading', A.building, 'cards',A.upgrade_cards);
	let gb = A.building;
	//console.log('gb', gb)
	let b = lookup(otree, gb.path.split('.'));
	//console.log('real building:', b);
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estates' : 'chateaus';
	let target = lookup(otree, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(otree, o.path.split('.'));
		//console.log('target',target,'elem',o.key,'source',source);
		elem_from_to(o.key, source, target.list);

		//also need to move the entire building to either estates or chateaus
		//if this was a farm and 
	}
	//wie krieg ich das gesamte building?
	let bres = target; //lookup(otree,target);
	bres.harvest = null;
	//console.log('target',target);
	//let uname = stringBefore(bres.path,'.');
	removeInPlace(otree[plturn].buildings[type0], bres);
	otree[plturn].buildings[type1].push(bres);

	ari_redo_player_ui(otree, plturn);
	ari_next_action(otree, plturn);
}
function ari_deck_add_safe(otree, n, arr) {
	ari_ensure_deck(otree, n);
	deck_add(otree.deck, n, arr);
}
function ari_deck_deal_safe(otree, n) {
	ari_ensure_deck(otree, n);
	deck_deal(otree.deck, n);
}
function a2_exchange_items(otree, o0, o1) {
	elem_from_to(o0.key, lookup(otree, o0.path.split('.')), lookup(otree, o1.path.split('.')));
	elem_from_to(o1.key, lookup(otree, o1.path.split('.')), lookup(otree, o0.path.split('.')));
}
function ari_ensure_deck(otree, n) {
	if (otree.deck.length < n) { ari_refill_deck(otree); }

}
function ari_get_correct_buildings(buildings) {
	let bcorrect = { farms: [], estates: [], chateaus: [] };
	let realvps = 0;
	for (const type in buildings) {

		for (const b of buildings[type]) {
			let list = b.list;
			//console.log('list', list)
			let lead = list[0];
			let iscorrect = true;
			for (const key of arrFromIndex(list, 1)) {
				if (key[0] != lead[0]) { iscorrect = false; continue; }//schweine building wird nicht gerechnet!
			}
			//console.log('building',list,'is',iscorrect?'correct':'schwein!')
			if (iscorrect) {
				//console.log('type',type)
				realvps += (type == 'farms' ? 1 : type == 'estates' ? 2 : 3);
				lookupAddIfToList(bcorrect, [type], b);
			}
		}
	}
	//console.log('realvps',realvps,'bcorrect',bcorrect);
	return [bcorrect, realvps];
}
function ari_get_first_tax_payer(otree, pl_tax) { return ari_get_tax_payer(otree, pl_tax, 0); }
function ari_get_tax_payer(otree, pl_tax, ifrom) {
	//console.log('pl_tax',pl_tax);
	let iturn = ifrom;

	let uname = otree.plorder[iturn];
	if (nundef(uname)) return [null, null];
	//console.log('uname',uname,'tax',pl_tax[uname]);
	while (pl_tax[uname] <= 0) {
		otree.round.push(uname);
		iturn++;
		if (iturn >= otree.plorder.length) return [null, null];
		//console.assert(iturn<otree.plorder.length,'DOCH NIEMAND IN TAX>!>!>!>!>');
		uname = otree.plorder[iturn];
		//console.log('uname',uname,'tax',pl_tax[uname]);
	}
	return [iturn, uname];

}
function ari_get_vps(otree, uname) {
	if (uname == otree.plturn) {
		//complete vps
		return calc_building_vps(otree, uname);
	} else {
		//just building vps
		return calc_building_vps(otree, uname);
	}
}
function ari_move_herald(otree, plturn) {
	let cur_herald = otree.plorder[0];
	let next_herald = otree.plorder[1];
	otree.plorder = arrCycle(otree.plorder, 1);
	otree.iturn = 0;

}
function ari_move_market_to_discard(otree) {
	while (otree.market.length > 0) {
		elem_from_to_top(otree.market[0], otree.market, otree.deck_discard);
	}
	ari_reorg_discard(otree);
}
function ari_move_stalls_to_hands(otree) {
	for (const uname of otree.plorder) {
		otree[uname].hand = otree[uname].hand.concat(otree[uname].stall);
		otree[uname].stall = [];
	}
}
function ari_next_action(otree, plturn) {
	uiActivated = false;
	if (nundef(otree.num_actions)) otree.num_actions = 0;
	//console.log('ari_next', otree.num_actions, otree.round);
	otree.num_actions -= 1;
	otree.action_number += 1;

	if (otree.num_actions <= 0) {
		//console.log('NO MORE ACTIONS FOR!!!!!!', plturn);
		otree.round.push(plturn);
		if (is_round_over(otree)) { //all players have completed action stage
			//console.log('...round over!', otree.phase, otree.stage);
			ari_action_round_over(otree, plturn);
		} else {
			let next = ari_select_next_player_according_to_stall_value(otree);
			//console.log('====>next', next);
			if (!next) { ari_next_action(otree, plturn); return; }
		}
	} else {
		otree.stage = 5;
	}
	otree.plturn = otree.plorder[otree.iturn];
	turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!

}
function ari_payment(rank = 'king') {

	if (A.payment_complete == true) return true;
	let [otree, plturn] = [G.otree, G.otree.plturn];
	let items = a2_get_build_items(plturn); //gets all hand and stall cards
	let pay_letter = rank.toUpperCase()[0];
	//console.log('pay_letter', pay_letter);
	let pay_cards = items.filter(x => x.key[0] == pay_letter);
	let has_pay_card = !isEmpty(pay_cards);
	//console.log('has pay card', has_pay_card);
	if (has_pay_card && otree[plturn].coins > 0 && otree.phase == rank) {
		//console.log('CASE 1: has paycard AND coin');
		otree.stage = 20;
		let items = pay_cards;
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
		let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
		a2_add_selection(items, 'payment', 1, 1, false);
		return false;
	} else if (has_pay_card && pay_cards.length > 1) {
		//console.log('CASE: multiple paycards but no coin!');
		otree.stage = 20;
		let items = pay_cards;
		let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
		a2_add_selection(items, 'payment', 1, 1, false);
		return false;
	} else if (has_pay_card) {
		console.assert(otree[plturn].coins == 0 || otree.phase != rank, 'HAS A COIN in matching phase!!!!');
		//console.log('CASE: forced pay with paycard!!');
		let k = pay_cards[0];
		a2_pay_with_card(k);
		//redraw stats!

		return true;
	} else {
		//pay with coin
		//console.log('CASE: forced pay with coin!!');
		a2_pay_with_coin(plturn);
		//otree[plturn].coins -= 1;
		return true;
	}

}
function a2_pay_with_card(item) {
	otree = G.otree;
	let source = lookup(otree, item.path.split('.'));
	//console.log('a2_pay_with_card source', source, item.path)
	elem_from_to_top(item.key, source, otree.deck_discard);
	ari_reorg_discard(otree);

	ari_redo_player_ui(otree, otree.plturn);
}
function a2_pay_with_coin(uname) {
	otree = G.otree;
	otree[uname].coins -= 1;
	ari_redo_player_stats(otree, uname);
}
function ari_redo_player_stats(otree, uname) {
	//assumes there are player_stat_items
	let item = G.player_stat_items[uname];
	let d = iDiv(item);
	//console.log('player', uname, 'stats', d);

	//keep stall value!
	let stall_value = otree[uname].stall_value;

	mRemoveChildrenFromIndex(d, otree.herald == uname?3:2);

	let pl = otree[uname];
	player_stat_count('coin', pl.coins, d);
	if (isdef(stall_value)) { player_stat_count('shinto shrine', stall_value, d); }
	player_stat_count('star', ari_get_vps(otree, uname), d);

}
function ari_player_stats(otree) {
	//player stats
	let player_stat_items = G.player_stat_items = ui_player_info(otree.plorder.map(x => otree[x]));
	let herald = otree.plorder[0];
	//console.log('player_stat_items',player_stat_items);
	for (const uname of otree.plorder) {
		let pl = otree[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (uname == herald) {
			//console.log('d', d, d.children[0]); let img = d.children[0];
			mSym('tied-scroll', d, { fg: 'gold', fz: 24 }, 'TL');
		}
		player_stat_count('coin', pl.coins, d);
		if (!isEmpty(otree[uname].stall) && otree.stage >= 5 && otree.stage <= 6) {
			player_stat_count('shinto shrine', !otree.round.includes(uname) || otree.stage < 6 ? calc_stall_value(otree, uname) : '_', d);
		}
		//else if (!isEmpty(otree[uname].stall) && otree.stage >= 6 && )
		// if (otree.stage >= 4 && otree.stage <= 6) {
		// 	if (otree.round.includes(uname)) player_stat_count('shinto shrine', '_', d);
		// 	else player_stat_count('shinto shrine', otree[uname].stall_value, d);
		// }
		player_stat_count('star', ari_get_vps(otree, uname), d);
	}



}
function a2_reindex(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function ari_reorg_discard(otree) {
	//organize open_discard: if < 4, add cards from bottom of deck_discard to open_discard
	while (otree.deck_discard.length > 0 && otree.open_discard.length < 4) {
		bottom_elem_from_to(otree.deck_discard, otree.open_discard);
	}
}
function ari_refill_deck(otree) {
	otree.deck = otree.deck.concat(otree.open_discard).concat(otree.deck_discard);
	shuffle(otree.deck);
	otree.open_discard = [];
	otree.deck_discard = [];
	console.log('deck refilled: contains', otree.deck.length, 'cards');
}
function ari_reveal_all_buildings(otree) {
	for (const uname of otree.plorder) {
		let gbs = G[uname].buildings;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
			//console.log('gb',gb);
		}
	}

}
function ari_tax_phase_needed(otree) {
	//if any player has more cards in hand than he is allowed to, need to have a tax stage else stage 3
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uname of otree.plorder) {
		let hsz = otree[uname].hand.length;
		let nchateaus = otree[uname].buildings.chateaus.length;
		let allowed = ARI.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uname] = diff;
	}

	if (need_tax_phase) {
		[otree.iturn, otree.plturn] = ari_get_first_tax_payer(otree, pl_tax);
		otree.pl_tax = pl_tax;
		otree.stage = 2;
	} else otree.stage = 3;

}
function ari_select_next_player_according_to_stall_value(otree) {
	//all players have selected their stalls and now need to calc stall values and set turn order accordingly!
	otree.stage = 5;
	let minval = 100000;
	let minplayer = null;

	for (const uname of otree.plorder) {
		if (otree.round.includes(uname)) continue;
		let stall = otree[uname].stall;
		if (isEmpty(stall)) { otree.round.push(uname); continue; }
		let val = otree[uname].stall_value = arrSum(stall.map(x => G.cards[x].val));
		if (val < minval) { minval = val; minplayer = uname; }

	}
	if (!minplayer) {
		//maybe all players have empty stall,
		return null;
	} else {
		otree.iturn = otree.plorder.indexOf(minplayer);
		otree.num_actions = otree.total_pl_actions = otree[minplayer].stall.length;
		otree.action_number = 1;
		return minplayer;
	}

}
function calc_stall_value(otree, uname) { let st = otree[uname].stall; if (isEmpty(st)) return 0; else return arrSum(st.map(x => G.cards[x].val)); }
function calc_building_vps(otree, uname) {
	let bs = otree[uname].buildings;
	let res = 0;
	res += bs.farms.length;
	res += bs.estates.length * 2;
	res += bs.chateaus.length * 3;
	return res;

}
function has_farm(uname) { return firstCond(G[uname].buildings, x => x.type == 'farms'); }
function is_round_over(otree) { return otree.round.length >= otree.plorder.length; }
function output_error(msg) { dError.innerHTML = msg; }
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	let d = mDiv(dParent, { display: 'flex', dir: 'c', fz: sz });
	let s = mSym(key, d, { h: sz, fz: sz }); //, fg: INNO.sym[key].fg });
	d.innerHTML += `<span>${n}</span>`;
	return d;
}
function update_otree_from_ui(otree, objects) {
	for (const k in objects) {
		otree[k] = objects[k].list;
	}
	qanim();
}













