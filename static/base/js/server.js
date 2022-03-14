
function from_server(result, type) {
	StepCounter++;
	//console.log('from_server',type);
	//if (type == "turn_update") { console.log('______from server:', type, '\nresult:', result); } // return; }
	//console.log('______from server:', type, '\nresult:', result);  //return;
	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	//console.log('from_server: obj',obj,'result size',result.length);
	convert_from_server(obj); //number strings => number, players => list, string starting with '{'=:JSON.parse

	switch (type) {
		// have obj.users
		case "intro": got_intro(obj); break;

		case "newest_table": //console.log('newest tid',obj.message,obj.player_recs);
			Session.cur_tid = obj.table.id; Session.cur_table = obj.table; Session.cur_game = obj.table.game; got_play_start(obj); break;

		//have obj.table / obj.players: 
		//both turn and race:
		case "play_start": got_play_start(obj); break;
		case "play": got_play_start(obj); break;
		case 'modify_table': Session.cur_tid = obj.table.id; Session.cur_table = obj.table; got_play_start(obj); break;
		case 'create_table_and_start': Session.cur_tid = obj.table.id; Session.cur_table = obj.table; DA.is_first_move = true; got_play_start(obj); break;

		//only turn game:
		//case 'AI_send_poll': turn_check_poll_AI(obj); break;
		// case 'host_send_poll': turn_collect_and_transform(obj); got_play_start(obj); poll_for_change(); break;
		case 'turn_update': got_play_start(obj); break;
		case 'turn_send_move': got_play_start(obj); break;
		case 'delete_and_create_staged': Session.cur_tid = obj.table.id; Session.cur_table = obj.table; DA.is_first_move = true; got_play_start(obj); break;

		//only race game:
		case 'send_move': start_bots(obj); got_play_start(obj); break; //fuer racing games
		case 'poll_bot_send_move': check_poll_bot_send_move(obj); break;

		// have obj.tables: both turn and race
		case 'non_admin_reload': got_non_admin_reload(obj); break;
		case "games": got_games(obj); break;
		case "poll_table_started": check_poll_table_started(obj); break;
		case "get_tables": got_tables(obj); break;

		case 'dictionary': got_dictionary(obj); break;

		case "dbsave": break; //console.log('db has been saved to server:'); break; //,obj.message,obj.data)console.log('dbsave', obj); break;
		case 'delete_table': get_games(obj); break;
		case 'save_and_delete':
			console.assert(is_admin(), 'SAVE_AND_DELETE NOT SENT BEI ADMIN!!!!');
			get_games();
			break;

		case "login": present_login(obj); break;

		// ************************** unused ******************
		case 'standard_assets':
		case 'assets': alert('ERROR! ' + type); assets_parse(obj.response); break;
		case "get_user_game_tables": alert('ERROR! ' + type); got_user_game_tables(obj); break;

		case "poll_table_show": alert('ERROR! ' + type); check_poll_table_show(obj); break;
		case 'seen': alert('ERROR! ' + type); poll_for_table_seen_or_deleted(); break;
		case "poll_table_seen": alert('ERROR! ' + type); check_poll_table_seen(obj); break;
		case "get_past_tables": alert('ERROR! ' + type); test_user_endscreen(obj); break;
		case "contacts": alert('ERROR! ' + type); present_contacts(obj); break;

		case 'host_send_poll': alert('ERROR! ' + type); got_play_start(obj); poll_for_change(); break;
		case 'guest_send_poll': alert('ERROR! ' + type); got_play_start(obj); poll_for_turn(); break;

		//#region sequence if dont join players automatically (unused)
		case 'create_table': alert('ERROR! ' + type);
			Session.cur_tid = obj.table.id;
			Session.cur_table = obj.table;
			//update_cur_table(obj);
			break;
		case "join_table": alert('ERROR! ' + type);
			status_message('You have joined the game! Wait for the host to start it!');
			update_cur_table(obj, 'red');
			//need to update DA[Session.cur_user].tables_by_game und tables_by_id
			//joined_table(obj.table);

			//long_polling_shield_on();

			break;
		case "toggle_join": alert('ERROR! ' + type);
			let t = obj.table;
			let st = obj.player_status;
			update_cur_table(obj, st == 'joined' ? 'red' : 'orange');
			status_message(`You have ${st == 'joined' ? 'joined' : 'left'} the game! Wait for the host to start it!`);
			// mStyle(mBy(`rk_${obj.table.id}`), { bg: st == 'joined' ? 'red' : 'orange' }); //table status has changed!
			//joined_table(obj.table);
			break;
		case "start_table": alert('ERROR! ' + type);
			update_cur_table(obj, 'green');
			// mStyle(mBy(`rk_${obj.table.id}`), { bg: 'green' }); //table status has changed!
			status_message('You have started the game! ', obj.table.status);
			break;
		//#endregion

		default: break;

	}
	dachain(500);
}

//#region send to server 

function to_server(req, type, to_php = true) {
	//console.log('...to_server:', type, type == 'send_move' ? req.player_status : ''); //, '\nreq', req);
	where(type);
	if (!to_php) {
		server_offline(req, type);
	} else if (is_online()) {
		server_online(req, type);
	} else {
		if (type == 'chat') { alert('no internet!'); mClassReplace(mBy("label_chat"), 'enabled', 'disabled'); }
		server_offline(req, type);
	}
}
function server_online(req, type) {
	//handled by apisi ... ends up in from_server
	//console.log('php server requesting:', req, type)
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";

	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			//if (type == 'games' || startsWith(type,'play')) console.log('xml.responseText', xml.responseText);
			from_server(xml.responseText, type);
		}
	}
	var data = { req: req, type: type };
	data = JSON.stringify(data);
	xml.open("POST", "./server/apisi.php", true);
	xml.send(data);
}
function server_offline(req, type) {
	// handled on client just using DB and Session
	if (type == 'user_info') console.log('_______to server offline!', 'req', req, 'type', type, 'Session.cur_user', Session.cur_user);
	let response = {};
	switch (type) {
		case 'user_info':
		case 'account':
			if (nundef(req.user)) req.user = Session.cur_user;
			let u = response.message = DB.users[req.user];
			console.log('udata', u);
			response.name = u.name;
			break;

		case 'contacts':
			//get all users except Session.cur_user
			let usernames = get_user_names().filter(x => x != Session.cur_user);
			//console.log('usernames', usernames);
			response.users = usernames.map(x => DB.users[x]);
			break;

	}
	response.type = type;
	from_server(JSON.stringify(response), type);

}
//#endregion

//#region old_api get_data: only because beginning somehow cant make to work!... to be eliminated in future
function get_data(find, type) { //genau gleich wie chatas api.js get_data
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			handle_result(xml.responseText, type);
		}
	}
	var data = {};
	data.find = find;
	data.data_type = type;
	data = JSON.stringify(data);
	xml.open("POST", "server/api.php", true);
	xml.send(data);
}
function handle_result(result, type) {
	//console.log('type', type, '\nresult', result); //return;
	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	switch (obj.data_type) {
		case "user_info": ensure_assets_old(obj); start_with_basic_assets(); break;
		default: alert('handle_result with type == ' + obj.data_type); break;
	}
}
//#endregion

//#region get_got routes including race games
//route: intro
function get_intro() { to_server(Session.cur_user, "intro"); }
function got_intro(obj) {
	Session.users = obj.users;
	Session.users_by_name = {};
	for (const u of Session.users) {
		Session.users_by_name[u.username] = u;
		if (isdef(DB.users[u.username])) { copyKeys(DB.users[u.username], u); }
	}
	//console.log('Session.users', Session.users);
	//console.log('users_by_name', Session.users_by_name);
	present_intro();
}

//following routes ALL end up in got_play_start!!!!!
//route: send_move
function race_send_move(fen) {
	let me = Session.cur_players[Session.cur_user];
	let o = { tid: Session.cur_tid, uname: me.name, player_status: me.player_status, score: me.score, state: me.state };
	if (isdef(fen)) o.fen = fen; //das ist erst in turn based!
	to_server(o, 'send_move');
}
//route: play_start
function get_play_start() { Session.cur_menu = 'play'; to_server({ uname: Session.cur_user, tid: Session.cur_tid }, 'play_start'); }
//route: play
function get_play() { Session.cur_menu = 'play'; to_server({ uname: Session.cur_user, tid: Session.cur_tid }, 'play'); }
//route: modify_table
function get_modify_table() { let t = modify_table(); to_server(t, 'modify_table'); }
//route: create_table
function get_create_table(options, players) { let t = create_table(options, players); to_server(t, 'create_table_and_start'); }

function get_delete_and_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ alltables: true, table: t }, 'delete_and_create_staged');
}
function get_delete_last_and_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ tid: Session.cur_tid, table: t }, 'delete_and_create_staged');
}
function get_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ table: t }, 'delete_and_create_staged');
}

function got_play_start(obj) {

	let table = obj.table;
	console.assert(Session.cur_game == table.game && Session.cur_tid == table.id, "PROBLEM got_play_start!!!!!!");

	Session.cur_menu = 'play'; if (is_admin()) testbuttons_on();

	if (is_race_game(table.game)) { race_present_table(obj); } else { turn_present(obj); }
}

//route: non_admin_reload
function get_non_admin_reload() { to_server(Session.cur_user, 'non_admin_reload'); }
function got_non_admin_reload(obj) {
	in_game_off();
	in_game_open_prompt_off();
	set_tables_by_game(obj);
	tables = obj.tables;
	//console.log('tables for',Session.cur_user,tables);
	if (isEmpty(tables)) {
		console.assert(nundef(Session.cur_tid), 'reload no table still cur_tid!!!!!')
		present_non_admin_user();
	} else {
		get_play_start();
	}
}
//route: games
function get_games() { Session.cur_menu = 'games';testbuttons_off(); to_server(Session.cur_user, "games"); }
function got_games(obj) {
	let tables = obj.tables;
	let bygame = set_tables_by_game(obj, false);
	set_most_recent_table_as_cur_tid(tables);
	present_games();
}
//route: get_tables
function get_last_table() { to_server(Session.cur_user, "get_tables"); }
function get_tables() { to_server(Session.cur_user, "get_tables"); }
function got_tables(obj) {
	set_tables_by_game(obj);
	//console.log('===Session.cur_user', Session.cur_user, 'Session.cur_tid', Session.cur_tid);
	//if (is_admin(Session.cur_user)) {
	if (isdef(Session.cur_tid)) {
		//console.log('get_play');
		get_play();
	} else {
		//console.log('get_games')
		get_games();
	}
}


//route: dictionary
function get_dictionary() {
	let u = DB.users[Session.cur_user];
	let lang = valf(u.lang, 'E');
	//console.log('ensure dictionary for user',u,lang);
	if (isdef(Dictionary) && isdef(Dictionary[lang])) return;
	to_server(lang, 'dictionary');
}
function got_dictionary(obj) {

	let lang = obj.lang;
	let x = obj.dict;
	Dictionary[lang] = to_words(x);
	//console.log('Dictionary',Dictionary);
}

//route: login
function get_login(php = true) { to_server(Session.cur_user, "login", php); }




//#endregion

