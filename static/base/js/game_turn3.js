function inno_agriculture_todo(otree, uname) {

	//first this player has to select a hand card to return
	//console.log('making todolist for agriculture!!!')
	let r1 = {
		id: getUID('r'),
		uname: uname,
		key: 'inno_agriculture',
		actions: [],
		selected: null,
	};

	let list = [r1];
	return list;

}
function inno_agriculture_pre(otree, r, uname) {
	r.actions = inno_get_hand_actions(otree, uname);
	r.actions.push('pass');
	activate_actions(r, uname);
}
function inno_agriculture_post(otree, r, uname, action, item) {

	if (action != 'pass') {

		let card = inno_get_cardinfo(stringAfterLast(action, '.'));
		//console.log('!!!!!!!!!!', uname, 'returns', card, 'scores', card.age + 1);

		//which deck does this card belong to?
		let deck = otree.decks[card.exp[0]][card.age];

		return_elem_to_deck_from(card.key, otree[uname].hand, deck);
		let n = card.age + 1;

		let pl = otree[uname];
		draw_from_deck_to(otree.decks.B[n], pl.scored); //TODO: what is deck is empty!!!!!!!!!!!!!!!!!
	}

	next_task(otree, r);
	turn_send_move_update(otree, uname);

}

function inno_metalworking_todo(otree, uname) {

	//first this player has to select a hand card to return
	console.log('making todolist for metalworking!!!');
	let r1 = {
		id: getUID('r'),
		uname: uname,
		key: 'inno_metalworking',
		actions: [],
		selected: null,
	};

	let list = [r1];
	return list;

}
function inno_metalworking_pre(otree, r, uname) {
	//this action does not let uname choose anything actually!
	let deck_letter = inno_has_echo(otree, uname) ? 'E' : 'B';
	let card = null;
	while (nundef(card) || inno_has_towers(card)) {
		let deck_age = inno_get_deck_age(otree,deck_letter); //check deck age
		let deck = otree.decks[deck_letter][deck_age];
		let peek = deck[0];
		ckey = deck.shift();
		console.log('age',deck_age,'deck length',deck.length)
		console.assert(isdef(ckey) && peek == ckey, 'metalworking: not drawing top card!!!!!!!');
		card = inno_get_cardinfo(ckey);
		console.log('draw card', ckey, inno_has_towers(card));
		if (inno_has_towers(card)) otree[uname].scored.push(ckey); else otree[uname].hand.push(ckey);
	}
	console.log('metalworking is *DONE*');

	inno_metalworking_post(otree, r, uname);
}
function inno_metalworking_post(otree, r, uname, action, item) {

	next_task(otree, r);
	turn_send_move_update(otree, uname);

}

function inno_code_of_laws_todo(otree, uname) {

	//first this player has to select a hand card to return
	console.log('making todolist for code_of_laws!!!');
	let r1 = {
		id: getUID('r'),
		uname: uname,
		key: 'inno_code_of_laws',
		actions: [],
		selected: null,
	};

	let list = [r1];
	return list;

}
function inno_code_of_laws_pre(otree, r, uname) {
	r.actions = inno_get_hand_actions(otree, uname);
	r.actions.push('pass');
	activate_actions(r, uname);
}
function inno_code_of_laws_post(otree, r, uname, action, item) {

	if (action != 'pass') {

		let card = inno_get_cardinfo(stringAfterLast(action, '.'));

		//tuck card to corresponding board color
		elem_from_to(card.key,otree[uname].hand,otree[uname].board[card.color]);

		//splay this color left: instead of may, implement this as autosplay if this color is not splayed
		let splay = inno_get_splay(otree,`${uname}.board.${card.color}`);
		if (splay == 0 && otree[uname].board[card.color].length > 1) otree[uname].splays[card.color] = 1;

	}

	next_task(otree, r);
	turn_send_move_update(otree, uname);

}

