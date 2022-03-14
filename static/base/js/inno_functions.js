//creating actions
function inno_get_all_actions(otree, uname) {
	//actions ist eine liste
	let actions = [];
	let ameld = inno_action_meld(otree, uname);
	let atop = inno_action_topcard(otree, uname);
	let achieve = inno_action_achieve(otree, uname);
	let adraw = inno_action_draw(otree, uname);
	actions = atop.concat(ameld, achieve, adraw); //console.log('actions', actions);

	return actions;

}
function inno_action_topcard(otree, uname) {
	// let pl = otree[uname];
	// let board = pl.board;
	// let top = [];
	// for (const k in board) { if (!isEmpty(board[k])) top.push(`${uname}.board.${k}.${arrFirst(board[k])}`); }
	//let top = board.map(x => arrLast(x));
	//console.log('top cards of player',uname,top);
	let top2 = inno_get_top_card_actions(otree,uname);
	//console.assert(sameList(top,top2),'NO LISTS ARE NOT THE SAME!!!!!!!!!!!!')
	return top2;
}
function inno_action_meld(otree, uname) {
	return otree[uname].hand.map(x => `${uname}.hand.${x}`);
}
function inno_action_achieve(otree, uname) {
	//was ist next one to achieve regular achievements?
	//check each and every special achievement for fulfilled!
	return [];
}
function inno_get_deck_info_for_player(otree,uname){
	let has_echo = inno_has_echo(otree, uname);
	let letter = has_echo||isEmpty(otree[uname].hand) ? 'B' : 'E';
	let min_age = inno_get_player_age(otree, uname); //check player age

	let age = inno_get_deck_age(otree,letter,min_age);
	return [age,letter];

}
function inno_action_draw(otree, uname) {
	let [age,letter] = inno_get_deck_info_for_player(otree,uname); //check deck age
	let res = `draw.decks.${letter}.${age}`;

	return [res];
}

//inno effects
function inno_perform_action(otree, r, uname, action, item) {

	console.log('inno_perform_action',otree, r, uname, action, item);

	//item.path = 'mimi.board.yellow.agriculture'; //example
	let a = action;
	console.assert(r.selected == action,'r.selected NOT SAME AS action!!!!!!!!!!!!!!!!!!!!!!!!');
	let parts = a.split('.');
	//console.log('process', uname, 'action', a);
	if (parts.length == 3) {
		let [x, obj, cardname] = parts;
		if (obj == 'hand' && x == uname) {
			inno_meld(otree,r, uname, cardname);
		}
		let [deck, exp, age] = parts;
		if (deck == 'decks') {
			//console.log('goto inno_draw_action')
			console.assert(false,'SHOULD NOT GET HERE HAPPEN!!!! inno_perform_action draw mit a=draw.decks...!!!!!!!!!!!!!!!');
			//inno_draw_action(otree,r, uname, exp, age);
		}

	} else if (parts.length == 4) {
		let [x, obj, color, cardname] = parts;
		if (obj == 'board' && x == uname) {
			inno_activate(otree, r, uname, cardname);
		}
		let [action, deck, exp, age] = parts;
		if (action =='draw' && deck == 'decks') {
			//console.log('goto inno_draw_action')
			inno_draw_action(otree, r, uname, exp, age);
		}
	}
}
function inno_meld(otree,r,uname,cardname){
	//console.log('inno_meld',otree,r,'\n',uname,cardname)
	let ci=inno_get_cardinfo(cardname);
	//console.log('cardinfo',ci);

	let pl = otree[uname];
	//console.log('pl',pl.hand,pl.board,pl.board[ci.color])
	elem_from_to_top(cardname,pl.hand, pl.board[ci.color]);

	//splay!!!


	//have to check effects of figures if this player has a top figure!
	// let fig = inno_get_top_figure(otree, uname);
	// if (fig) {
	// 	inno_card_effect(otree, uname, fig, 'draw');
	// }
	next_task(otree, r);
	//turn_send_move_update(otree, uname);

}
function inno_draw_action(otree,r, uname, exp, age) {
	//console.log('inno_draw_action',otree,r,'\n',uname,exp,age)
	//console.log('drawing from deck', exp, age);
	//console.log('deck', otree.decks[exp][age]);
	//console.log('uname', uname, '\npl', otree[uname]);
	//console.log('hand', otree[uname].hand);
	draw_from_deck_to(otree.decks[exp][age], otree[uname].hand);

	//have to check effects of figures if this player has a top figure!
	// let fig = inno_get_top_figure(otree, uname);
	// if (fig) {
	// 	inno_card_effect(otree, uname, fig, 'draw');
	// }
	next_task(otree, r);
	//turn_send_move_update(otree, uname);

}
function inno_activate(otree, r, uname, cardname) {

	//example: mimi activates agriculture: calls inno_agriculture_todo(otree,uname)
	let fname = `inno_${cardname}_todo`;
	if (nundef(window[fname])) { console.log('activate', cardname, 'NOT IMPLEMENTED!!!!'); return; }
	
	let todo = window[fname](otree, uname); //hier wird todo action von ckey (eg metalworking) aufgerufen!
	let todo_incl_sharing = inno_add_sharing_players(otree,uname,cardname,todo);

	//replace r in otree by todo list
	let idx = otree.todo.indexOf(r);
	console.assert(idx == otree.itask, 'inno_activate: itask does NOT point to r!!!!!');
	otree.todo.splice(idx, 1, ...todo_incl_sharing);
	//log_object(otree.todo,'otree.todo');


}
//sharing and demand
function inno_add_sharing_players(otree,uname,cardname,todo){
	otree.pl_sharing = inno_calc_sharing(otree,uname,cardname);
	let task_list = jsCopy(todo); //these are actions by player himself
	todo = [];
	for(const plname of otree.pl_sharing){
		let new_task_list = [];

		for(const t of task_list){ let t1 = {}; t1.uname = plname; t1.id = getUID('r'); addKeys(t,t1); new_task_list.push(t1); }
		todo = todo.concat(new_task_list);
	}
	todo=todo.concat(task_list);
	return todo;
}
function inno_calc_sharing(otree,uname,ckey){

	//find sym
	let ci = inno_get_cardinfo(ckey);
	let sym = ci.type;

	//find players in plorder with at least as many sym as uname
	//console.log('card',ci,'totals',otree[uname].totals);
	let n=otree[uname].totals[sym];
	//return;
	let pl_sharing = otree.plorder.filter(x=>x!=uname && otree[x].totals[sym] >= n);
	return pl_sharing;

}



//inno helpers
function inno_has_echo(otree, uname) {
	//check if this player has an echo card
	let handcardinfo = otree[uname].hand.map(x => inno_get_cardinfo(x));
	//console.log('hand cards:',handcardinfo);
	let has_echo = firstCond(handcardinfo, x => x.exp[0] == 'E');
	return has_echo;
}
function inno_has_towers(cardinfo) { return cardinfo.resources.includes('tower'); }
function inno_is_figure(cardinfo) { return cardinfo.exp[0] == 'F'; }
function inno_is_echoes(cardinfo) { return cardinfo.exp[0] == 'E'; }
function inno_is_artifact(cardinfo) { return cardinfo.exp[0] == 'A'; }
function inno_is_basic(cardinfo) { return cardinfo.exp[0] == 'B'; }
function inno_is_city(cardinfo) { return cardinfo.exp[0] == 'C'; }
