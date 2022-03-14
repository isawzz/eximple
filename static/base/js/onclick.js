//#region test buttons (status area)
function onclick_step(){
	TestInfo.step = true;
	TestInfo.running = true;
	if (!isEmpty(DA.chain)) {dachainext(1000); return; }

	let testnumber = valf(mBy('intestnumber').value,110);
	if (!isNumber(testnumber)) testnumber = 110;
	console.log('test for step is',testnumber);
	//onclick_ut_n('ari', testnumber);
	TestInfo.number = testnumber;
	onclick_last_test();
	//jetzt nur den ersten step wie mach ich das?
}

//reload and polling
function onclick_reload_state() {
	let g = Session;
	let tid = g.cur_tid;
	if (nundef(tid) && is_admin()) get_games();
	else if (nundef(tid)) get_intro();
	else if (is_admin()) { stop_game(); get_play(); }
	else {
		// non admin reload: es koennte sein dass die current table veraltet ist und auch das current game!
		//eigentlich soll der dasselbe machen wie bei waiting for start!
		stop_game();
		//console.log('was soll da geschehen???');
		//er soll erst checken ob current table die neueste table ist
		Session.cur_tid = null;
		to_server({ uname: g.cur_user }, 'newest_table');
		//get_newest_table();

	}
}
function onclick_toggle_polling() { toggle_polling_status(); }

//1. line: pre inno sim tests
function onclick_preinno_create() { Session.cur_game = 'gPreinno'; get_create_table({ level_setting: 'min' }, ['mimi', 'leo']); }

function onclick_ut(func) {
	let [fen, player_names] = func(); //inno_ut0_create_staged(); //setup a simulation
	get_create_staged(fen, { level_setting: 'min' }, player_names);
}
function onclick_inno_ut0() { onclick_ut(inno_ut0_create_staged); }
function onclick_inno_ut1() { onclick_ut(inno_ut1_create_staged); }
function onclick_inno_ut2() { onclick_ut(inno_ut2_create_staged); }
function onclick_ut_n(g, n) {

	TestInfo.running = true;
	let [fen, player_names] = window[`${g}_ut${n}_create_staged`]();
	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// if (isdef(Session.cur_tid) && Session.cur_tid > 1) {
	// 	get_delete_last_and_create_staged(fen, { level_setting: 'min' }, player_names);
	// } else {
	// 	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// }
}






//aeltere sims
function onclick_sim_inno_init_complete() {
	delete_current_table();
	Session.cur_game = 'gPreinno';
	test_sim_inno_init_complete(); //setup a simulation
	get_create_table({ level_setting: 'min' }, ['mimi', 'leo']);
}
function onclick_sim_inno_after_init_mimi_turn() {
	delete_current_table();
	Session.cur_game = 'gPreinno';
	test_sim_inno_after_init_mimi_turn(); //setup a simulation
	get_create_table({ level_setting: 'min' }, ['mimi', 'leo']);
}
//function onclick_preinno_create3() { Session.cur_game = 'gPreinno'; get_create_table({ level_setting: 'min', winning_score: 1 }, ['mimi', 'leo', 'valerie']); }
//function onclick_preinno_poll() { get_send_poll(); }

// 2. line of test buttons: create different games
function onclick_set_test() { Session.cur_game = 'gSet'; get_create_table({ level_setting: 'min', winning_score: 1 }, ['mimi', 'leo']); }
function onclick_spotit1() { Session.cur_game = 'gSpotit'; get_create_table({ level_setting: 'min', winning_score: 1 }, ['mimi', 'leo']); }
function onclick_test_create2_maze() { Session.cur_game = 'gMaze'; get_create_table({ level_setting: 'min', winning_score: 1 }); }
function onclick_test_create2_anagram() { Session.cur_game = 'gAnagram'; get_create_table({ level_setting: 'min', winning_score: 1 }); }
function onclick_test_create_spotit_AI() { Session.cur_game = 'gSpotit'; get_create_table({ winning_score: 2 }, ['mimi', 'bob']); }
function onclick_test_create_maze_AI() { Session.cur_game = 'gMaze'; get_create_table({ winning_score: 2 }, ['mimi', 'bob', 'guest']); }
function onclick_test_create_anagram_AI() { Session.cur_game = 'gAnagram'; get_create_table({ winning_score: 2 }, ['mimi', 'bob', 'guest', 'leo']); }

// 3. line: delete reset
function onclick_run_tests() {
	stop_game();
	stop_polling();
	shield_on();
	ITER = 0;
	TestInfo.suiteRunning = true;
	if (nundef(TestInfo.list)) {
		console.log('taking default TestInfo.list');
		TestInfo.list = [100, 101];
	}
	test_engine_run_next(TestInfo.list);
	//onclick_ut_n('ari', 104);
}
function onclick_last_test(){
	stop_game();
	stop_polling();
	ITER = 0;
	TestInfo.suiteRunning = false;
	onclick_ut_n('ari', TestInfo.number);
}
function onclick_delete_table() { stop_game(); stop_polling(); delete_current_table(); }
function onclick_reset_tables() { stop_game(); stop_polling(); DA.chain = [get_games]; to_server({}, 'reset_tables'); }
function onclick_reset_user() { reset_game_values_for_user(Session.cur_user); db_save(); }
function onclick_reset_db() { reset_db_values(); db_save(); }

// 4. line
function onclick_internet() { toogle_internet_status(); }
function onclick_log_session() { log_object(Session, 'Session'); }
function onclick_log_otree() { log_object(Session.otree, 'otree'); }
function onclick_log_R() { log_object(Session.R, 'R'); }
function onclick_log_R_nodes() { if (isdef(Session.R)) log_object(Session.R.nodes, 'R.nodes'); }
function onclick_log_R_uiNodes() { if (isdef(Session.R)) log_object(Session.R.uiNodes, 'R.uiNodes'); }
function onclick_log_R_path2oid() { if (isdef(Session.R)) log_object(Session.R.path2oid, 'R.path2oid'); }
function onclick_log_R_oid2uids() { if (isdef(Session.R)) log_object(Session.R.oid2uids, 'R.oid2uids'); }
function onclick_log_R_uid2oids() { if (isdef(Session.R)) log_object(Session.R.uid2oids, 'R.uid2oids'); }
function onclick_view_ranking() { if (nundef(Session.cur_table)) { console.log('need table!'); return; } out1(); csv = make_csv_for_rankings(); }

//disabled buttons to login specific users (mimi, felix,...):
function onclick_user(ev) { let name = ev.target.innerHTML; load_user(name); get_tables(); }

//#endregion

//#region admin main screen showing game menu

// main menu (auf sidebar)
function onclick_games() { if (!menu_enabled('games')) return; stop_game(); get_games(); }
function onclick_play() {
	if (!menu_enabled('play')) return;
	stop_game();
	let tid = Session.cur_tid;
	if (isdef(tid)) get_play();
	else if (is_admin()) get_games();
	else present_non_admin_user();
}
function onclick_account() { if (!menu_enabled('account')) return; stop_game(); get_account(); }//console.log('menu',getFunctionCallerName());}
function onclick_login() { if (!menu_enabled('login')) return; stop_game(); get_login(); }//console.log('menu',getFunctionCallerName());}
function onclick_settings() { if (Session.cur_menu == 'games') { alert('click on a game icon!'); return; } present_game_options(Session.cur_tid); }

// sidebar open close
function onclick_header(ev) { if (!is_admin() && ev.path[0].id != 'header') return; open_sidebar(); close_mini_user_info(); }
function onclick_left_panel(ev) { if (ev.path[0].id != 'left_panel') return; close_sidebar(); open_mini_user_info(); }
function onclick_toggle_sidebar(ev) {
	evNoBubble(ev);
	//console.log('click!',DA.left_panel,ev);
	toggle_sidebar(); toggle_mini_user_info();
}

// game menu: item
function onclick_game_menu_item(ev) {
	Session.cur_game = ev_to_gname(ev);

	set_cur_tid_for_game();

	if (nundef(Session.cur_tid) && is_admin()) { present_game_options(); }
	else if (isdef(Session.cur_tid)) get_play();
}

//login screen: login other user
function onclick_user_login(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	load_user(username);

	get_tables();

}

//#endregion

function onclick_logout() {
	stop_polling();
	localStorage.removeItem('user');
	Session.cur_user = null;
	get_intro();

}

//#region settings screen: game options (only admin) =>see settings.js also!
function onclick_create_game_button() {

	console.assert(is_admin(), 'non admin is creating game!!!!!!!!!!!');

	collect_game_options();

	get_create_table();
}
function onclick_resume_game_button() {
	console.assert(is_admin(), 'non admin is creating game!!!!!!!!!!!');
	collect_game_options();
	get_modify_table();
}

//#region old code mit text area parsing for players
function onclick_modify_def_players(ev) {
	let ta = mBy('ta_edit_players');
	let text = ta.value;
	let words = splitAtAnyOf(text, ', \n');
	//console.log('text', text, 'words', words);

	//provide for startlevel

	let names = [];
	let levels = {};
	for (const w of words) {
		if (w.indexOf('(') < 0) { names.push(w); continue; }
		let name = stringBefore(w, '(');
		let level = firstNumber(w);
		//console.log('name', name, 'level', level);
		levels[name] = level;
		names.push(name);
	}
	console.log('levels', levels, 'names', names);
	if (!isEmpty(get_keys(levels))) {
		for (const n in levels) {
			lookupSetOverride(DB.users, [n, 'games', Session.cur_game, 'startlevel'], levels[n]);
		}
		db_save();
	}

	//hier kann ich bereits checken to make sure all players exist!
	let non_existent = names.filter(x => nundef(DB.users[x]));
	//remove non-existent players from the list and show an alert!
	if (!isEmpty(non_existent)) {
		status_message('the following players will be discarded because they dont exist: ' + non_existent.join(', '));
		names = arrMinus(names, non_existent);
		if (names.length < 2) {
			//add a random player
			let plname = chooseRandom(get_keys(DB.users), x => x != Session.cur_user);
			names.push(plname);
		}
	}

	let final_players = get_def_players_for_user(Session.cur_user, names);
	populate_players(final_players);
}
function onclick_edit_players() {
	let ta = mBy('ta_edit_players');
	show(ta);
	let button = mBy('b_edit_players');
	button.innerHTML = 'submit';
	button.onclick = onclick_modify_def_players;
	ta.onkeyup = ev => {
		if (ev.key === "Enter") {
			ev.preventDefault();
			//mBy('dummy').focus();
			ev.cancelBubble = true;
			onclick_modify_def_players(ev);
		}
	};
	ta.focus();
}

//#endregion

//#endregion

//#region non_admin
function onclick_user_in_intro(ev) {
	let uname = try_find_username(ev);
	//console.log('..................clicked', uname);	//window.location = './index.html?user=' + uname;  return;
	if (uname) { present_non_admin_user(uname); }
	// 	console.assert(isString(uname), 'SCHEISSE..............');
	// 	if (KeepSessionUser) {
	// 		console.log('uname',uname)
	// 		//window.location = './index.html?user=' + uname; return;
	// 	} else {
	// 		present_non_admin_user(uname);
	// 	}
	// }
}
//#endregion

//#region in play:
function onclick_gameover_new() {
	if (is_admin()) {
		let txt = jsyaml.dump(DB);
		DA.chain = [get_games];
		let end_scoring = get_scores_from_cur_players();
		//console.log('table finalized: fen:' + fen);
		to_server({ tid: Session.cur_tid, end_scoring: end_scoring, uname: Session.cur_user, db: txt }, 'save_and_delete');
	} else {
		present_non_admin_user(Session.cur_user);
	}

}
function onclick_status_message(ev) {

	evNoBubble(ev); hide('dMessage');

	if (isdef(DA.after_status_message)) {
		let func = DA.after_status_message;
		DA.after_status_message = null;
		func();
	}

}


