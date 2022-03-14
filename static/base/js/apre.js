function ari_pre_action() {
	uiActivated = true;
	let otree = G.otree;
	let [step, stage, iturn, round, phase, plturn] = set_state_numbers(otree);
	let [deck, market, discard, open_discard] = [G.deck, G.market, G.deck_discard, G.open_discard];

	//let txt = otree.num_actions > 0 ? ('(action ' + otree.action_number + '/' + otree.total_pl_actions + ')') : '';
	let txt = otree.num_actions > 0 ? ('(' + otree.action_number + '/' + otree.total_pl_actions + ')') : '';
	dTop.innerHTML = `<div style='padding:4px 10px;font-size:20px;display:flex;justify-content:space-between'>
		<div>${G.table.friendly.toLowerCase()}</div>
		<div>${otree.plturn} ${txt} ${ARI.stage[otree.stage]}</div>
		<div>phase: ${otree.phase.toUpperCase()}</div>
	</div>`;

	if (stage == 2) { a2_add_selection(a2_get_hand_items(plturn), 'tax!'); }
	else if (stage == 3) { ari_open_market(otree, phase, deck, market); }
	else if (stage == 4) { a2_add_selection(a2_get_hand_items(plturn), 'hand'); }
	else if (stage == 5) {
		otree.stage = 6; a2_add_selection(a2_get_commands(plturn), 'action', 1, 1, false);
	} else if (stage == 6 && A.selected_key == 'trade') {
		//console.log('haaaaaaaaaaaaaaaaaaaaa')
		let items = a2_get_trade_items(plturn); a2_add_selection(items, 'trading cards');
	} else if (stage == 6 && A.selected_key == 'build') { //build: pay
		A.command = 'build';
		//console.log('pre stage 6,build: check payment!!!')
		let pay_unique = ari_payment('king');
		// if (pay_unique) { setTimeout(()=>{console.log('paid!'); let items = a2_get_build_items(plturn); a2_add_selection(items, 'build cards'); },100); }
		if (pay_unique) { console.log('paid!'); let items = a2_get_build_items(plturn); a2_add_selection(items, 'build cards'); }

	} else if (stage == 6 && A.selected_key == 'upgrade') { //upgrade: pay
		A.command = 'upgrade';
		let pay_unique = ari_payment('king');
		if (pay_unique) { let items = a2_get_build_items(plturn); a2_add_selection(items, 'build cards'); }

	} else if (stage == 6 && A.selected_key == 'downgrade') {
		A.command = 'downgrade';
		let b_items = a2_get_building_items(plturn); 
		a2_add_selection(b_items, 'buildings',1,1);
	} else if (stage == 6 && A.selected_key == 'buy') { //buy: pay
		//zuerst payment checken!
		A.command = 'buy';
		let pay_unique = ari_payment('jack');
		if (pay_unique) { let items = a2_get_open_discard_items(plturn); a2_add_selection(items, 'buy', 1, 1); }

	} else if (stage == 6 && A.selected_key == 'visit') { //visit: pay
		A.command = 'visit';
		let pay_unique = ari_payment('queen');
		if (pay_unique) { let items = a2_get_other_buildings(plturn); a2_add_selection(items, 'visit', 1, 1); }

	} else if (stage == 6 && A.selected_key == 'sell') {
		let items = a2_get_stall_items(plturn);
		a2_add_selection(items, 'sell');
	} else if (stage == 6 && A.selected_key == 'harvest') {
		A.command = 'harvest';
		let items = a2_get_harvest_items(plturn);
		a2_add_selection(items, 'harvest', 1, 1);

	} else if (stage == 6 && A.selected_key == 'pickup') {
		//console.log('YES, arrived at pre pickup', A);
		otree.stage = 100;
		let items = a2_get_stall_items(plturn);
		a2_add_selection(items, 'stall', 1, 1);
	} else if (stage == 6 && A.selected_key == 'repair') {
		//console.log('YES, arrived at pre pickup', A);
		let items = a2_get_repair_items(plturn);
		a2_add_selection(items, 'repair');
	} else if (A.selected_key == 'pass') {
		//console.log('pass...');
		otree.num_actions = 0;
		ari_next_action(otree, plturn);
	} else if (stage == 10) { //game end?
		//nach king phase frage ob irgendwer das spiel beenden will
		//check ob irgendwer end_conditions meets
		//check ob player meets endconditions
		a2_add_selection(a2_get_endgame(plturn), 'action', 1, 1);
	} else if (stage == 11) { //ball?
		a2_add_selection(a2_get_hand_items(plturn), 'action');
	} else if (stage == 12) {
		//console.log('was passiert jetzt???'); //auction: bid
		//each player should get choice of how many coins
		a2_add_selection(a2_get_coin_amounts(plturn), 'invest', 1, 1);
	} else if (stage == 13) { //auction: buy
		//console.log('was passiert jetzt???');
		//console.log('player', plturn, 'may buy a market card for', otree.second_most);

		//each player should get choice of how many coins
		a2_add_selection(a2_get_market_items(), 'buy', 1, 1);
	} else if (stage == 20) { //complete payment ->pre command visit(geht) buy() build() upgrade()
		//console.log('A.selected',A.selected,'A.items',A.items,'A.selected_key',A.selected_key);

		//pay with card or coin
		let item = A.items[A.selected[0]];
		if (isdef(item.o)) a2_pay_with_card(item); else a2_pay_with_coin(plturn); //otree[plturn].coins--;
		A.payment_complete = true;

		//wo kann ich sehen was fuer ein command executed wird?
		let command = A.ll[0].items[A.ll[0].selected[0]].key;
		//console.log('command was:',command);
		otree.stage = 6;
		A.selected_key = command;
		ari_pre_action();
	}

}

function ari_open_market(otree, phase, deck, market) {
	otree.market = [];
	let n_market = phase == 'jack' ? 3 : 2;
	otree.stage = otree.phase == 'jack' ? 12 : otree.phase == 'queen' ? 11 : 4;

	DA.qanim = [];
	for (let i = 0; i < n_market; i++) {
		DA.qanim.push([anim_from_deck_to_marketX, [deck, market]]);
	}
	DA.qanim.push([update_otree_from_ui, [otree, { deck: deck, market: market }]]);
	DA.qanim.push([ari_pre_action, []]);
	// DA.qanim = [
	// 	[anim_from_deck_to_marketX, [deck, market]],
	// 	[anim_from_deck_to_marketX, [deck, market]],
	// 	[update_otree_from_ui, [otree, { deck: deck, market: market }]],
	// 	[ari_pre_action, []],
	// ];
	qanim();

}
function ari_show_building(otree, uname, building_cards) {

	//woher bekomm ich die G items fuer das building?

	DA.qanim = [
		[anim_from_deck_to_marketX, [deck, market]],
		[anim_from_deck_to_marketX, [deck, market]],
		[update_otree_from_ui, [otree, { deck: deck, market: market }]],
		[ari_pre_action, []],
	];
	qanim();

}

