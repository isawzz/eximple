var MAXITER = 200, ITER = 0;

function ari_branch(obj, otree, rtree) {

	//wie weiss ich dass gerade mein turn gestartet hat???
	//ich bin otree.plturn

	verify_unit_test(otree);
	ari_player_stats(otree);

	//presentation
	//worin unterscheiden sich presentations? (vor activation)???
	//1. in reihenfolge der players: bei non_admin ist IMMER cur_user first, dann plorder
	//  bei admin ist IMMER cur_user first, dann plorder
	//also eigentlich ueberhaupt kein unterschied!

	//2. in which cards are face_up or face_down: bei non_admin ist immer cur_user open hand
	// bei admin ist immer plturn open hand

	//admin has one kind of presentation
	//non_admin if its my turn

	G.plprev = G.plturn;
	let plturn = G.plturn = otree.plturn; // = otree.plorder[otree.iturn];
	let turn_changed = G.plprev != G.plturn;
	let my_turn = G.plturn == G.cur_user;
	console.assert(otree.plturn == otree.plorder[otree.iturn], 'TURN MIXUP!');
	if (TESTING) console.log('___ ITER:' + ITER, plturn, turn_changed ? '(changed)' : '', my_turn ? 'ME!' : '', isdef(otree.num_actions) ? 'actions:' + otree.num_actions : '');

	ari_present(otree,plturn);
	// if (G.cur_user == plturn || is_admin(G.cur_user)) ari_present(otree, plturn);
	// else ari_present_non_admin(otree, plturn);

	//interactions
	A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	console.assert(G.otree == otree, 'OTREE FAIL!!!!!!!!!!!');

	//console.log('dTableShield',dTableShield);
	table_shield_off();
	if (isdef(otree.winner)) {
		stop_game();
		ari_reveal_all_buildings(otree);
		if (!TestInfo.running) turn_show_gameover(otree);

	} else if (G.cur_user == plturn || is_admin(G.cur_user)) {
		ari_pre_action(otree, plturn);
	} else {
		// output_error('NOT YOU TURN!!!!!!!!!');
		let txt = otree.num_actions > 0 ? ('(' + otree.action_number + '/' + otree.total_pl_actions + ')') : '';
		dTop.innerHTML =
			`<div style='padding:4px 10px;font-size:20px;display:flex;justify-content:space-between'>
			<div>${G.table.friendly.toLowerCase()}</div>
			<div>${plturn} ${txt} ${ARI.stage[otree.stage]}</div>
			<div>phase: ${otree.phase.toUpperCase()}</div>
		</div>`;

		table_shield_on();
	}

	//hier muss auto_unit_test passieren!!!
	//aber wie?
	//console.assert(isEmpty(A.selected),A);
	//
	//test8_mimi_hand_card_0_hover()


}

//beispiel inno
function turn_present(obj) {
	if (ITER >= Math.min(DA.iter, MAXITER)) { console.log('iter', ITER == MAXITER ? 'MAX' : 'DA.iter'); TOMan.clear(); return; } ITER++;

	//*** 1 *** translate_fen_to_otree
	let otree = turn_unpackage_fen(obj);	//console.log('otree',otree); 

	//*** TODO!!! *** verify result of unit_test here ***
	//console.assert(verify_unit_test(ITER, otree), 'unit test FAILED!!!!');

	//*** 2 ***  create R (= registered game objects)
	let rtree = turn_create_R(otree);

	//*** 3 ***  present ui WITHOUT activation! (creating R.nodes and R.uiNodes, settings Items...)
	ui_table_actions_stats();

	if (G.cur_game == 'gAristo') { ari_branch(obj, otree, rtree); }
	else if (G.cur_game == 'gPreinno') { inno_branch(obj, otree, rtree); }
}
function inno_branch(obj, otree, rtree) {
	//das ist der rest fuer inno only!
	ui_present_stats(otree);
	let uitree = ui_present_table(rtree, dTable);

	//*** 4 *** get current request
	if (nundef(otree.todo)) { otree.todo = inno_todo_init(otree); }

	let req = otree.todo[otree.itask];
	console.log('____________', ITER); //, 'task:', r);

	//*** 5 *** get stage func for this request
	let my_turn = true; //is_it_my_turn(r,g.cur_user); //nur cur_user wird activated!

	window[req.key + '_pre'](otree, req, req.uname);
	//test0_show_all_inno_cards();
}

function turn_set_game_assets(g) {
	if (g.cur_game == 'gPreinno') g.cards = InnoById;
	else if (g.cur_game == 'gAristo') g.cards = Aristocards;
}
function turn_set_keys(g, obj) {
	let fen = obj.table.fen;
	let di = {
		table: get_keys(fen),
		players: get_keys(fen.players[fen.plorder[0]]),
		r_nodes: [],
		ui_nodes: []

	};
	//console.log('fen player keys',get_keys(fen.players.mimi));
	let rks = arrMinus(di.table.concat(di.players), ['splays', 'herald', 'plorder', 'coins']);
	rks = arrPlus(rks, ['green', 'purple', 'blue', 'red', 'yellow']);
	rks = rks.concat(fen.plorder);

	di.r_nodes = rks;
	di.ui_nodes = arrMinus(di.r_nodes, []);

	g.game_keys = {};
	for (const k in di) {
		let di1 = g.game_keys[k] = {};
		for (const k1 of di[k]) di1[k1] = true;
	}

	//console.log('keys',g.game_keys);
}
function test0_show_all_inno_cards() {
	clearElement(dTable);
	for (const k in InnoById) {
		let ci = InnoById[k];
		console.log('ci', ci);
		if (ci.exp[0] == 'F') inno_present_card(dTable, k);
	}
}
function mHigh(d) { d = isString(d) ? mBy(d) : d; mStyle(d, { border: 'yellow' }); }
function munhigh(d) { d = isString(d) ? mBy(d) : d; mStyle(d, { border: 'none' }); }
function highlight_player(uname) { mHigh(`d_${uname}`); mHigh(iDiv(Items[uname])); }
function activate_actions(r, uname) {
	console.log('actions', r.actions);
	if (!isEmpty(DA.staged_moves)) {
		//console.log('autoselecting...');
		dastaged(r, uname, 500);
	} else if (r.actions.length == 1) {
		autoselect_action(r, r.actions[0], uname);
	} else {
		//console.log('task', uname, r.actions)
		for (const a of r.actions) {
			//console.log('****action', a);
			if (isdef(Items[a])) {
				let item = R.get_item(a);
				let d = iDiv(item);
				mStyle(d, { cursor: 'pointer' });
				d.onclick = ev => onselect_action(ev, r, a, uname);
			} else if (a == 'pass') {
				//console.log('****dTable', dTable);
				activate_pass_button(a, uname);
			} else if (startsWith(a, 'draw')) {
				//draw actions
				let path = stringAfter(a, '.');
				let item = R.get_item(path);
				let d = iDiv(item);
				mStyle(d, { cursor: 'pointer' });
				d.onclick = ev => onselect_action(ev, r, a, uname);
				activate_draw_button(r, a, uname);
			}
		}
		highlight_player(uname);
		uiActivated = true;
		//hier muss ich wenn staged autoselect action machen!!!
	}
}
function activate_draw_button(r, action, uname) {
	mButton('draw', ev => select_action(r, action, uname), dActions, { fz: 13 }, ['donebutton', 'enabled'], 'd_draw');
}
function activate_pass_button(r, action, uname) {
	mButton('pass', ev => select_action(r, action, uname), dActions, { fz: 13 }, ['donebutton', 'enabled'], 'd_pass');
}
function select_action(r, action, uname, item) {
	uiActivated = false;
	r.selected = action;
	console.log('action selected:', r.key, uname, action, item);
	window[r.key + '_post'](Session.otree, r, uname, action, item);
}
function autoselect_action(r, action, uname, item) {	/*item is added to simulated ui clicks only!*/	select_action(r, action, uname, item); }
function onselect_action(ev, r, action, uname) { let item = get_selected_ui_item(ev); select_action(r, action, uname, item); }
function turn_send_move_update(otree, uname) {
	//console.log('send_move_update',getFunctionsNameThatCalledThisFunction());
	let fen = turn_package_otree(otree);

	let g = Session;
	let o = { uname: uname, tid: g.table.id, fen: fen, table_status: g.table.status };
	to_server(o, 'turn_update');

	//console.log('sending game state update...') 
}
function turn_send_gameover(otree, uname) {
	//console.log('send_move_update',getFunctionsNameThatCalledThisFunction());
	let fen = turn_package_otree(otree);
	let g = Session;
	//console.log('sending fen:',fen)
	let o = { uname: uname, tid: g.table.id, fen: fen, table_status: 'over' };
	to_server(o, 'turn_update');

	//console.log('sending game state update...') 
} 
function turn_send_reload(uname) {
	let g = Session;
	let o = { uname: uname, tid: g.table.id, table_status: g.table.status };
	to_server(o, 'turn_update');

	//console.log('sending game state update...') 
}
function turn_package_otree(otree) {
	//package otree into fen!
	// let keys = inno_get_object_keys(otree);
	let keys = Session.game_keys.players; // inno_get_object_keys(otree);
	//console.log('keys',keys);
	let fen = otree;
	fen.players = {};
	for (const plname of otree.plorder) fen.players[plname] = stripToKeys(otree[plname], keys);
	otree.plorder.map(x => delete fen[x]);

	return fen;
}
function turn_unpackage_fen(obj) {
	//translate_fen_to_otree
	let g = Session;
	turn_set_game_assets(g);
	turn_set_keys(g, obj);

	g.obj = ServerData = obj;
	let otree = Fen = g.otree = turn_create_otree(obj);	//console.log('otree', otree);
	return otree;
}
function otree2cur_players(otree){
	Session.cur_players = {};
	//console.log('otree',otree)
	for(const uname of otree.plorder){
		Session.cur_players[uname] = otree[uname];
	}
	return Session.cur_players;
}
function turn_create_otree(obj) {
	console.assert(isdef(obj.table), 'turn_create_otree without obj.table!!!!!!!!!!!!!!');
	let g = Session;
	let [menu, table, fen, plist, players] = [g.cur_menu, g.table, g.fen, g.plist, g.players] = ['play', obj.table, obj.table.fen, obj.playerdata, obj.table.fen.players];
	//console.log('table', table, '\nfen', fen, '\nplist', plist, '\nplayers', players);

	//HIER MUESSEN DIE FEN KEYS GEMACHT WERDEN!!!
	// let otree = {}; // jsCopy(fen); //fuer INNO!!!!!
	let otree = jsCopy(fen); //fuerr ARISTO!!!!

	let order = isdef(fen.plorder) ? fen.plorder : plist.map(x => x.name);
	otree.player_names = order; //plist.map(x => x.name);
	//console.log('order.......',order);
	for (const uname of order) {
		let pl = firstCond(plist, x => x.name == uname);
		copyKeys(DB.users[uname], pl);
		copyKeys(fen.players[uname], pl);
		otree[uname] = pl;
	}
	addKeys(fen, otree);
	delete otree.players;
	//console.log('keys.......',get_keys(otree));
	return otree;

}
function turn_create_R(otree) {
	Items = {};
	let g = Session;
	R = g.R = new RSG(); R.otree = otree;

	let r_keys = R.keys = Session.game_keys.r_nodes; //inno_get_object_keys(otree); //console.log('r_keys',r_keys)
	//console.log('r_keys', get_keys(r_keys));

	// let root = R.root = rec_create_nodes_tree(R, otree, '', r_keys);

	//test in welcher reihenfolge er eigentlich de nodes durchgeht
	let akku = G.akku = [];
	let root = R.root = rec_create_nodes_tree_akku(R, otree, '', r_keys, akku);
	//console.log('akku',akku);

	return R;
}
function ui_table_actions_stats() {
	let d = mBy('inner_left_panel'); clearElement(d);

	let dou = mDiv100(d, { display: 'flex' }); //VERTICAL SIDEBAR!!!

	// use VERTICAL SIDEBAR!!!
	//dLinks =mDiv(dou, { flex:1, bg:'blue', overflow:'hidden' },'dLinks','hallo'); 
	//dLinks.style.flex=0;

	dTable = mDiv(dou, { flex: 5, display: 'flex', overflow: 'auto', position: 'relative' }); //2 lines WORK!!!
	mCenterFlex(dTable, false); //no horizontal centering!
	//dTable = mDiv(dou, { flex: 5 });
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 1000, easing: 'ease' });

	// let dou = mDiv100(d); //HORIZONTAL BAR!!!
	dTop = mDiv(dTable, { bg: '#00000040', fg: 'white', w: '100%' }, 'dOben', 'hallo');
	dTop.innerHTML = ''; //style.flex=0;

	dOben = mDiv(dTable, { bg: '#ffffff40', w: '100%' }, 'dOben', 'hallo');
	dOben.innerHTML = ''; //style.flex=0;

	dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) {
		window[`dActions${i}`] = mDiv(dActions, { w: '100%' });
	}
	dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow' });
	// dActions2 = mDiv(dOben,{w:'100%'});

	// use VERTICAL SIDEBAR!!!
	// dPlayerStats = dRechts =mDiv(dou, { flex:1, bg:'blue', overflow:'hidden' },'dRechts','hallo'); 
	dPlayerStats = dRechts = mDiv(dou, { flex: 1 }, 'dRechts', 'hallo');

	//dRechts.style.flex=0;

	//use HORIZONTAL BAR!!!
	//dUnten =mDiv(dou, { bg:'blue' },'dUnten','hallo'); 
	//dUnten.innerHTML = ''; //style.flex=0;
}
function ui_present_table(r, dParent) {

	//present
	let g = Session;
	let uitree = r.uiNodes = {};

	if (g.cur_game == 'gPreinno') inno_create_ui_tree(R.root, dParent, r);
	else if (g.cur_game == 'gAristo') ari_create_ui_tree(R.root, dParent, r);

	return uitree;
}
function turn_show_gameover(otree) {
	//console.log('winners', winners)//winners: non-empty list of names!
	let game = Session.cur_game;
	let table = Session.cur_table;
	let players = otree2cur_players(otree);
	let winner = otree.winner;

	//scoring update
	if (!Session.scoring_complete) {
		console.log('======>scoring!!!!!', table.friendly);
		scoring_update(otree.plorder, [otree.winner], game);
		//if (Session.level_setting == 'player') { inc_level_on_winstreak(winners, game); dec_level_on_losestreak(); }
		out1();
		Session.scoring_complete = true;
	}

	//show game over
	let pl = otree[winner];
	let styles = { bg: pl.color, alpha: .75, fg: 'contrast', top: 220, };
	let msg = 'GAME OVER - The ' + `winner is ${otree.winner}!!!`;
	let d = status_message(msg, styles);

	//show score table
	//how to show score table?
	let end_scores = table.status == 'past' ? table.end_scoring : get_scores_from_cur_players();
	//console.log('score fen:' + fen);
	show_score_table(end_scores, table.friendly, d);

	//show ok button: back to home screen fuer guest, get_games fuer mimi
	mLinebreak(d);
	mButton('click to close', onclick_gameover_new, d, { fz: 20 }, ['buttonClass', 'donebutton']);

}








