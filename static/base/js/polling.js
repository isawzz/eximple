//#region polling

IS_POLLING_ALLOWED = true;
function allow_polling() { IS_POLLING_ALLOWED = true; if (isdef(DA.poll)) poll(); }
function is_polling_on() { return IS_POLLING_ALLOWED; }
function stop_polling() { clearTimeout(TOTicker); IS_POLLING_ALLOWED = false; if (isdef(DA.poll)) console.log('...polling is OFF'); }
function start_polling(data, type, onsuccess, ms = 5000, func) {
	delete DA.poll; allow_polling();

	//console.log('data type is:', typeof (data));
	DA.poll = {
		data: data,
		type: type,
		onsuccess: onsuccess,
		ms: ms,
		func: func
	};

	poll();
}
function poll() {
	if (IS_POLLING_ALLOWED) {
		if (isdef(DA.poll.func)) DA.poll.data = DA.poll.func(DA.poll.data);
		console.log('...poll')
		to_server(DA.poll.data, DA.poll.type);
	} else console.log('polling OFF!');
}

//#region BOTS: poll_bot_send_move: polls until finds a table with status 'started'

function start_bots(obj) {
	if (is_admin() && DA.is_first_move == true) {
		DA.bots = [];
		let bots = { bob: 5000 }; // { ally: 10000, bob: 5000, nimble: 4000, wolfgang: 3000 };
		for (const botname in bots) {// ['ally','bob','leo','nimble','wolfgang'])
			if (obj.table.players.includes(botname)) { start_poll_bot_send_move(botname, bots[botname]); } //break;}
			//break; //limits participation to 1 robot!
		}
	}
	DA.is_first_move = false;

}
function create_ai_move(data) {
	//console.log('ai is moving!');
	let newscore = Math.min(Session.winning_score, data.score + 1);
	console.log('AI score is', newscore);
	let newstate = data.state;
	let newdata = {
		tid: data.tid,
		player_status: newscore >= Session.winning_score ? 'done' : 'joined',
		score: newscore,
		state: newstate,
		uname: data.uname
	};
	return newdata;
}
function start_poll_bot_send_move(botname = 'bob', ms = 3000) {
	DA.bots.push(botname);

	if (DB.games[Session.cur_game].game_type == 'race') {
		let o = { tid: Session.cur_tid, player_status: 'joined', score: 0, state: 'bot', uname: botname };
		start_polling(o, 'poll_bot_send_move', on_poll_bot_send_move, ms, create_ai_move); //, 5000); //check_table_exists, 5000);
	} else {
		//turn_start_polling_for_AI(botname,ms);
	}
}
function check_poll_bot_send_move(obj) {
	//das wird aufgerufen in server.js from_server poll_bot_send_move? JA
	console.log('...bot check table status: ', lookup(obj, ['table', 'status']) ?? 'no obj.table.status!!!', obj);
	if (nundef(DA.poll)) return;
	else if (isdef(obj) && isdef(obj.table) && obj.table.status == 'over') {
		DA.poll.onsuccess(obj);
	} else {
		//console.log('again!');
		BotTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_bot_send_move(obj) {
	console.log('game is over for AI', DA.poll.data.uname);
	clearTimeout(BotTicker);
	delete DA.poll;
}
//#endregion

//#region guest waiting for table to start: _poll_table_started: polls until finds a table with status 'started'
function poll_for_table_started() {
	//let username = Session.cur_user;
	start_polling(Session.cur_user, 'poll_table_started', on_poll_table_started, 3000); //, 5000); //check_table_exists, 5000);
}
function check_poll_table_started(obj) {
	//das wird aufgerufen in server.js from_server _poll_table_started?
	//console.log('obj', obj);
	if (isdef(obj) && !isEmpty(obj.tables)) {
		DA.poll.onsuccess(obj);
	} else {
		let dcheck = document.getElementById('ddd_logout');
		//console.log('dcheck',dcheck,isdef(dcheck));
		// let vis = mBy('divTest').style.display;
		// console.log('d',mBy('divTest'));
		// console.log('polling no table:',isVisible('divTest')?'visible':'NOT visible', '\nvis',isdef(vis)?vis:'undefined');
		if (!dcheck) {
			//console.log('need to present!!!');
			present_non_admin_waiting_screen();
		}
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_started(obj) {

	//player options(start data) start data in pl_options!
	let t = obj.tables[0];
	update_db_user_from_pl_options(t.pl_options, t.game);
	Session.cur_tid = t.id;
	Session.cur_game = t.game;

	delete DA.poll;
	status_message_off(); //???
	hide('divTest');
	close_sidebar();
	mBy('user_info_mini').style.display = 'flex';

	//load_user();
	Session.scoring_complete = false;
	get_play();

}
//#endregion












