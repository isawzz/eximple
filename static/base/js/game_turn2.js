//inno: init
function inno_todo_init(otree) {
	let r = {
		key: 'inno_init',
		actions: [],
		selected: null,
	};
	let list = [];
	for (const uname of otree.plorder) {
		let task = jsCopy(r);
		task.id = getUID('r');
		task.uname = uname;
		list.push(task);
	};
	otree.itask = 0;
	return list;
}
function inno_init_pre(otree, r, uname) {
	r.actions = inno_get_hand_actions(otree, uname);
	activate_actions(r, uname);
}
function inno_init_post(otree, r, uname, action,item) {
	//console.log('pl', uname, 'selected initial card', item.path);

	//update game and send update
	//console.log('todo list', otree.todo);
	//integrate r.selected into otree
	let path = r.selected;
	let cardname = stringAfterLast(path, '.');
	let card = inno_get_cardinfo(cardname);
	let pl = otree[uname];
	lookupAddToList(otree, ['progress'], { name: uname, key: cardname });
	elem_from_to(cardname, pl.hand, pl.board[card.color]);

	let i = otree.itask + 1;
	if (i >= get_num_players(otree)) {
		//all users have selected an initial card
		//proceed to next phase
		//console.log('*** initial selection completed!!! ***', otree.progress);

		//turn order set according to cards
		//let sorted = sortBy(otree.progress,'key'); console.log('SORTED ORDER:',sorted);
		otree.plorder = sortBy(otree.progress, 'key').map(x => x.name);
		//console.log('final plorder', otree.plorder);

		otree.history = otree.todo;
		otree.progress = null;
		otree.todo = inno_todo_justone(otree);

	} else {
		otree.itask = i;

	}

	turn_send_move_update(otree, uname);

}
function inno_perform_initial_selections(r, otree) {
	let pl_order = [];
	for (const uname of otree.turn) {
		let path = r.selected[uname][0];
		let cardname = stringAfterLast(path, '.');
		let card = inno_get_cardinfo(cardname);
		let pl = otree[uname];
		pl_order.push({ name: uname, key: cardname });
		elem_from_to(cardname, pl.hand, pl.board[card.color]);
	}
	return pl_order;
}

//inno: justone
function inno_todo_justone(otree) {
	let r = {
		key: 'inno_justone',
		actions: [],
		selected: null,
	};
	let list = otree.todo = [];
	for (const uname of otree.plorder) {
		let i = get_index_in_plorder(otree, uname);
		if (i >= otree.plorder.length / 2) break;
		let task = jsCopy(r);
		task.id = getUID('r');
		task.uname = uname;
		list.push(task);
	};
	otree.itask = 0;
	return list;
}
function inno_justone_pre(otree, r, uname) {
	r.actions = inno_get_all_actions(otree, uname);
	activate_actions(r, uname);
}
function inno_justone_post(otree, r, uname, action, item) {
	//console.log('inno_justone_post', uname, 'selected action', item.path);
	inno_perform_action(otree, r, uname, action, item);

	//itask stays the same!!!???
	turn_send_move_update(otree, uname);
}

//inno: regular
function inno_todo_regular(otree, uname) {
	let r = {
		key: 'inno_regular',
		uname: uname,
		actions: [],
		selected: null,
	};
	let r1 = jsCopy(r); r1.id = getUID('r');
	let r2 = jsCopy(r); r2.id = getUID('r');
	let list = [r1, r2];
	otree.itask = 0;
	return list;
}
function inno_regular_pre(otree, r, uname) {inno_justone_pre(otree, r, uname);}
function inno_regular_post(otree, r, uname, action, item) { inno_justone_post(otree, r, uname, action, item); }














