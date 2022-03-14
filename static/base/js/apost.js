function ari_post_action() {
	clearElement(dError);
	let otree = G.otree;
	let [step, stage, iturn, round, phase, plturn] = set_state_numbers(otree);
	let [deck, market, discard, open_discard] = [G.deck, G.market, G.deck_discard, G.open_discard];

	//console.log('post:', otree.stage + "=" + ARI.stage[otree.stage]);

	if (stage == 2) {
		//player should have picked exactly otree.pl_tax[plturn] cards to discard!
		//console.log('TAX!!!!',A.selected);
		let items = A.selected.map(x => A.items[x]);
		let n = otree.pl_tax[plturn];
		if (items.length != n) {
			output_error(`please select exactly ${n} cards`);
			return;
		}

		for (const item of items) {
			elem_from_to_top(item.key, otree[plturn].hand, otree.deck_discard);
		}
		ari_reorg_discard(otree);

		//market existiert in diesem stage nicht!!!
		//daher kann kein ari_next_action machen!!!
		let [iturn, plnext] = ari_get_tax_payer(otree, otree.pl_tax, otree.iturn + 1);
		//console.log('iturn', iturn, 'plnext', plnext);
		if (iturn == null) {
			otree.stage = 3;
			otree.iturn = 0;
			delete otree.pl_tax;

		} else {
			otree.iturn = iturn;
		}

		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);

	} else if (stage == 3) {
		console.assert(false, 'NO SHOULD NOT COME TO POST STATE 3');
	} else if (stage == 4) {

		//move selected keys from hand to stall
		let selectedKeys = A.selected.map(i => A.items[i].key);
		for (const ckey of selectedKeys) {
			elem_from_to(ckey, otree[plturn].hand, otree[plturn].stall);
		}

		//record plturn has selected stall
		//console.log('player', plturn, 'selected stall', otree[plturn].stall);
		otree.round.push(plturn);

		//if all players have selected, calc stall values and set plturn to player with minimum
		if (is_round_over(otree)) {
			//console.log('stall selection complete!');
			otree.round = [];
			let next = ari_select_next_player_according_to_stall_value(otree);
			if (!next) { ari_next_action(otree, plturn); return; }
		} else {
			otree.iturn++;
		}


		otree.plturn = otree.plorder[otree.iturn]; //update player turn

		//send move to server //console.log('...sending stall',uname, otree[plturn].stall);
		turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
	} else if (stage == 6 && A.selected_key == 'trade') {
		//there should be exactly 2 selected actions and they should be in different groups
		//the 2 actions correspond to the 2 legal cards to trade!
		if (A.selected.length != 2) {
			output_error('please, select exactly 2 cards!');
			return;
		}
		let i0 = A.items[A.selected[0]];
		let i1 = A.items[A.selected[1]];
		//console.log('trading!',i0,i1)
		if (i0.path == i1.path) {
			output_error('you cannot trade cards from the same group');
			return;
		} else {
			a2_exchange_items(otree, i0, i1); //replace cards in otree
			ari_next_action(otree, plturn);

			// a2_trade_selected(otree, plturn, i0, i1);
		}

	} else if (stage == 6 && A.selected_key == 'repair') {
		//there should be exactly 2 selected actions and they should be in different groups
		//the 2 actions correspond to the 2 legal cards to trade!
		if (A.selected.length != 2) {
			output_error('please, select exactly 2 cards!');
			return;
		}
		let i0 = A.items[A.selected[0]];
		let i1 = A.items[A.selected[1]];
		//one of the cards has to be from a building
		let [p0, p1] = [i0.path, i1.path];
		if (p0.includes('build') == p1.includes('build')) {
			output_error('select exactly one building card and one of your hand or stall cards!');
			return;
		}

		a2_exchange_items(otree, i0, i1); //replace cards in otree
		//the repaired building loses its schwein if any!
		console.log('repair items', i0, i1);

		let ibuilding = p0.includes('build') ? i0 : i1;
		let obuilding = lookup(otree, stringBeforeLast(ibuilding.path, '.').split('.'));
		console.log('obuilding', obuilding);
		obuilding.schwein = null;

		ari_next_action(otree, plturn);
		//a2_repair_selected(otree, plturn, i0, i1);

	} else if (stage == 6 && A.command == 'build') {
		console.log('should have paid for building!', otree[plturn].coins);
		if (A.selected.length < 4 || A.selected.length > 6) {
			output_error('select 4, 5, or 6 cards to build!');
			return;
		}
		ari_complete_building();
	} else if (stage == 6 && A.command == 'upgrade') {

		let n = A.selected.length;
		if (n > 2 || n == 2 && !has_farm(plturn)) {
			output_error('too many cards selected!');
			return;
		} else if (n == 0) {
			output_error('please select hand or stall card(s) to upgrade!');
			return;
		}

		//ok also die cards wurden correct selected
		A.upgrade_cards = A.selected.map(x => A.items[x]);
		//next ist selection of building to upgrade
		otree.stage = 102;
		let b_items = a2_get_farms_estates_items(plturn); //a2_get_building_items(plturn);
		a2_add_selection(b_items, 'buildings', 1, 1);
	} else if (stage == 102) { //selected which building to upgrade!
		A.building = A.items[A.selected[0]];
		ari_complete_upgrade();
	} else if (stage == 6 && A.command == 'downgrade') {
		A.building = A.items[A.selected[0]];
		//console.log('A.building is',A.building,'A.selected',A.selected);
		//next have to select 1 or more cards to take into hands from building
		otree.stage = 103;
		let items = a2_get_hidden_building_items(A.building.o);
		//console.log('items to select:',items);
		items.map(x => face_up(x.o));
		A.possible_downgrade_cards = items;
		a2_add_selection(items, 'downgrade cards');

	} else if (stage == 103) { //selected which building to upgrade!
		//selected items to downgrade
		//if building now has < 4 cards, remove entire building
		//pick up the cards into hand******************** HIER!!!!!!!!!!
		A.downgrade_cards = A.selected.map(x => A.items[x]); //
		//console.log('A.candidates',A.possible_downgrade_cards);
		//console.log('selected indices',A.selected);
		//console.log('selected these cards to downgrade:',A.downgrade_cards);

		let obuilding = lookup(otree, A.building.path.split('.'));

		//get number of cards in this building
		let n = obuilding.list.length;
		let nremove = A.downgrade_cards.length;
		let nfinal = n - nremove;

		//remove this building from its list
		let type = A.building.o.type;
		let list = otree[plturn].buildings[type];
		removeInPlace(list, obuilding);
		let cards = A.downgrade_cards.map(x => x.key);

		if (nfinal < 4) {
			//entire building take to hand
			otree[plturn].hand = otree[plturn].hand.concat(obuilding.list);
		} else if (nfinal == 4) {
			//add the building to farms
			otree[plturn].buildings.farms.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		} else if (nfinal == 5) {
			//add the building to estates
			otree[plturn].buildings.estates.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		} else if (nfinal == 6) {
			//add the building to chateaus
			otree[plturn].buildings.chateaus.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		}
		A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));
		//console.log('after downgrade:',otree[plturn]);
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'buy') {

		let item = A.items[A.selected[0]];

		//console.log('buy item',item)
		elem_from_to(item.key, otree.open_discard, otree[plturn].hand);
		ari_reorg_discard(otree);
		ari_next_action(otree, plturn);


	} else if (stage == 6 && A.command == 'visit') {
		//there should be 4, 5, or 6 selected actions
		//console.log('visit', A.selected); //payment is complete!!!!!!!!!!!!!
		//reveal the farm, face_up wrong card if any and owner must pay 1 coin to plturn!
		let item = A.items[A.selected[0]];
		console.log('building to inspect', item);
		let obuilding = lookup(otree, item.path.split('.'));
		//console.log('visited building', item.path, obuilding.list);
		let owner = stringBefore(item.path, '.');
		// if this building already has a schwein, schein is removed, harvest is removed, and other cards are moved to owners hand
		// building is destroyed
		if (isdef(obuilding.schwein)) {

			let res = confirm('destroy the building?');
			if (!res) {
				if (otree[owner].coins > 0) {
					//console.log('player',owner,'pays to',plturn,otree[owner].coins,otree[plturn].coins)
					otree[owner].coins-=1;
					otree[plturn].coins+=1;
					//console.log('after payment:',otree[owner].coins,otree[plturn].coins)
				}
			} else {
				let list = obuilding.list;
				console.log('!!!!!!!!!!!!!building',obuilding,'DESTROY!!!!!!!!!!!!!!!!','\nlist',list);
				let correct_key = list[0];
				let rank = correct_key[0];
				//console.log('rank is', rank);
				//console.log('building destruction: ', correct_key);
				while (list.length > 0) {
					let ckey = list[0];
					//console.log('card rank is', ckey[0])
					if (ckey[0] != rank) {
						elem_from_to_top(ckey, list, otree.deck_discard);
						//console.log('discard',otree.deck_discard);
					} else {
						elem_from_to(ckey, list, otree[owner].hand);
					}
				}
				//console.log('building after removing cards', list, obuilding)
				if (isdef(obuilding.harvest)) {
					otree.deck_discard.unshift(obuilding.harvest);
				}
				ari_reorg_discard(otree);

				let blist = lookup(otree, stringBeforeLast(item.path, '.').split('.'));
				//console.log('===>remove',obuilding,'from',blist);
				removeInPlace(blist, obuilding);

				//console.log('player', owner, 'after building destruction', otree[owner])
			}


		} else {

			//this building is revealed
			let cards = item.o.items;
			let key = cards[0].rank;
			let schweine = false;
			let schwein = null;
			for (const c of cards) {
				if (c.rank != key) { schweine = true; schwein = c.key; face_up(c); break; }
			}
			if (schweine) {
				//owner of building has to pay 1 coin to plturn
				if (otree[owner].coins > 0) {
					otree[owner].coins--;
					otree[plturn].coins++;
				}
				//the building is market as schwein
				let b = lookup(otree, item.path.split('.'));
				//let b=otree[owner].buildings[item.type];
				//[Number(stringAfterLast(item.path,'.'))];
				b.schwein = schwein;
				//console.log('proper building', b);

			}
		}
		ari_next_action(otree, plturn);


	} else if (stage == 6 && A.selected_key == 'sell') {
		//there should exactly 2 selected cards
		//console.log('YEAHHHHHHHHHHHHHHHHHHHHH', 'sell!', A.selected);
		if (A.selected.length != 2) {
			output_error('select exactly 2 cards to sell!');
			return;
		}
		for (const i of A.selected) {
			let c = A.items[i].key;
			elem_from_to(c, otree[plturn].stall, otree.deck_discard);
		}
		ari_reorg_discard(otree);
		otree[plturn].coins += 1;
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'harvest') {
		let item = A.items[A.selected[0]];
		//console.log('harvesting from farm', item.path, item);

		//harvest card ist removed
		let obuilding = lookup(otree, item.path.split('.'));
		//console.log('obuilding', obuilding);
		//add the harvest card to hand
		otree[plturn].hand.push(obuilding.h);
		obuilding.h = null;
		ari_next_action(otree, plturn);

	} else if (stage == 100) { //pickup end!
		//pickup A.selected_key
		console.log('pickup', A.selected_key, A.items, A.selected);
		let item = A.items[A.selected[0]];
		//move elem item.a from mimi.stall to mimi.hand
		elem_from_to(item.key, otree[plturn].stall, otree[plturn].hand);
		ari_next_action(otree, plturn);

	} else if (A.selected_key == 'pass') {
		console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOO')
		otree.num_actions = 0;
		ari_next_action(otree, plturn);
	} else if (stage == 10) { //king end: players asked if want to end game
		if (A.selected_key == 'end game') {

			//console.log('GAMEOVER!!!!!!!!!!!!!!!!!!!');

			//berechne fuer jeden real vps!
			for (const uname of otree.plorder) {
				//console.log('buildings', otree[uname].buildings)
				let [bcorrect, realvps] = ari_get_correct_buildings(otree[uname].buildings);

				otree[uname].score = realvps;
				//console.log('real vps of',uname,otree[uname].score);
			}
			//make a list of player name, realvps
			let scores = otree.plorder.map(x => ({ name: x, vps: otree[x].realvps }));
			let sorted = sortByDescending(scores, 'vps');
			//announce the winner!
			//console.log('THE WINNER IS', sorted[0].name);

			//reveal all player buildings!
			//console.log('reveal buildings')
			ari_reveal_all_buildings(otree);
			//turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
			//da brauch ich irgend so ein gameover message!!!!
			otree.winner = sorted[0].name;
			turn_send_gameover(otree, plturn);

		} else {
			let iturn = otree.iturn += 1;
			//console.log('pl_gameover', otree.pl_gameover)
			if (iturn >= otree.pl_gameover.length) { //niemand wollte beenden: move to queen phase!
				delete otree.pl_gameover;
				otree.round = [];
				otree.iturn = 0;
				otree.stage = 3;
				otree.phase = 'queen';
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!

			} else {
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
			}
		}
	} else if (stage == 11) { //ball
		//ball
		//console.log('apost ball (stage 11):', A.items, A.selected);
		let keys = A.selected.map(x => A.items[x]).map(x => x.key); // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);

		//console.log('keys', keys)

		keys.map(x => lookupAddIfToList(otree, ['ball', plturn], x));
		keys.map(x => removeInPlace(otree[plturn].hand, x));

		let iturn = otree.iturn += 1;
		if (iturn >= otree.plorder.length) { //alle sind durch ball selection
			//distribute ball cards according to what each player gave for ball!
			//console.log('TODO: distribute all cards from', otree.ball);
			//console.log('ball over!');
			if (isdef(otree.ball)) {
				let all = [];
				for (const c of otree.market) all.push(c);
				for (const uname in otree.ball) for (const c of otree.ball[uname]) all.push(c);
				//console.log('all ball cards', all);
				shuffle(all);
				//give 2 cards from all to market
				otree.market = [];
				for (let i = 0; i < 2; i++) top_elem_from_to(all, otree.market);
				for (const uname in otree.ball) for (let i = 0; i < otree.ball[uname].length; i++) top_elem_from_to(all, otree[uname].hand);
				delete otree.ball;
			} //else { console.log('empty ball!!!'); }

			otree.round = [];
			otree.iturn = 0;
			otree.stage = 4;
			otree.phase = 'queen';
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!

	} else if (stage == 12) { //auction
		//console.log('was passiert jetzt???');
		//console.log('post auction (stage 12):', A.items, A.selected);
		let keys = A.selected.map(x => A.items[x]); // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);

		//console.log('keys', keys)

		keys.map(x => lookupAddIfToList(otree, ['auction', plturn], x));
		//keys.map(x => removeInPlace(otree[plturn].hand, x));

		let iturn = otree.iturn += 1;
		if (iturn >= otree.plorder.length) { //alle sind durch ball selection
			//distribute ball cards according to what each player gave for ball!
			//console.log('TODO: distribute all cards from', otree.ball);
			//console.log('auction over!');
			//find out max and second max investment
			let list = dict2list(otree.auction);
			list.map(x => { x.uname = x.id; x.item = x.value[0]; x.amount = Number(x.item.a); });
			list = sortByDescending(list, 'amount');
			//console.log('===>auction as list', list);//.map(x=>x.amount));

			//otree.auction = list;

			let max = list[0].amount;
			let second = otree.second_most = list[1].amount;

			//all players with max amount have the right to buy a market card for second coins
			otree.stage = 13;
			let maxplayers = otree.maxplayers = list.filter(x => x.amount == max).map(x => x.uname);
			otree.round = arrMinus(otree.plorder, maxplayers);
			otree.iturn = otree.plorder.indexOf(maxplayers[0]);
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
	} else if (stage == 13) { //auction
		//console.log('was passiert jetzt???');
		//console.log('player', plturn, 'may buy a market card for', otree.second_most);
		let item = A.selected.map(x => A.items[x])[0]; // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);

		lookupSet(otree, ['buy', plturn], item);

		for (const uname of otree.maxplayers) {
			if (!lookup(otree, ['buy', uname])) {
				otree.iturn = otree.plorder.indexOf(uname);
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
				return;
			}
		}
		//arriving here, everyone has determined what to buy
		//the choices are in otree.buy[plname]

		//if 2 or more players selected the same card, this card is discarded
		//otherwise the player buys the card
		let buylist = dict2list(otree.buy);
		//console.log('buylist', buylist);

		let discardlist = [];
		for (const uname of otree.maxplayers) {
			let choice = otree.buy[uname];
			//console.log('choice of', uname, 'was', choice)

			let is_unique = !firstCond(buylist, x => x.id != uname && x.value == choice);
			if (is_unique) {
				otree[uname].coins -= otree.second_most;
				elem_from_to(choice.key, otree.market, otree[uname].hand);
			} else addIf(discardlist, choice);
		}

		//console.log('discardlist', discardlist);
		for (const choice of discardlist) {
			elem_from_to(choice.key, otree.market, otree.deck_discard);
			ari_reorg_discard(otree);
		}

		otree.iturn = 0;
		otree.stage = 4;
		otree.round = [];
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!

	}
}











