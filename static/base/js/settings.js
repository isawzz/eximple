function present_game_options(tid) {

	//console.log('tid',tid)
	if (isdef(tid)){
		let table = Session.cur_table; 
		Session.cur_game = table.game;
		if (nundef(Session.game_options)) Session.game_options = table_options_to_game_options(table);
		//console.log('have options:',Session.game_options);
	}else{
		Session.game_options = {};
	}

	let gname = Session.cur_game;
	let g = DB.games[gname];

	let d = mBy('inner_left_panel');
	d.innerHTML = get_lobby(tid);
	let d1 = mBy('d_game_options');

	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players

	populate_game_settings(d1,tid);

	populate_playmode(d1, g.av_modes); //sowieso nur multi for now!

	populate_players(isdef(tid)?get_keys(Session.cur_players):get_def_players_for_user(Session.cur_user));


}


//#region game options helpers
function populate_game_settings(dParent,tid) {
	//console.log('HALLO!!!!!!!!!!!!!');
	if (nundef(tid)) Session.game_options.game = {};
	

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(','); // make a list 
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			let checkfirst = nundef(tid); //let checkfirst = true;
			for (const v of list) {
				let d = mRadio(v, isNumber(v) ? Number(v) : v, fs, { cursor: 'pointer' }, null, key);
				if (checkfirst || lookup(Session.game_options.game, [key]) == v) {
					let inp = d.firstChild;
					inp.setAttribute('checked', true);
					checkfirst = false;
				}
			}

			measure_fieldset(fs);

		} 
	}

}
function populate_playmode(d, modes) {
	//only multi is enabled right now!!!!
	let group = mRadioGroup(d, {}, 'd_mode', 'play mode');

	modes = modes.split(',');
	//console.log('modes', modes);
	for (const m of modes) {
		let name = m == 'pp' ? 'pass&play' : m == 'multi' ? 'multiplayer' : m;
		//let d = mRadio(name, m, group, {cursor:'pointer'}, v => { Session.game_options.mode = v; populate_players(v); }, 'mode'); //{h:40,w:150,bg:'red'},'mode');
		let d = mRadio(name, m, group, { cursor: 'default' }, null, 'mode');
		let inp = d.firstChild;
		inp.setAttribute('disabled', true);
		if (m != 'multi') mClass(d, 'disabled');
		//let d = mRadioAttrappe(name, m, group, {});
		//for(el of [d,d.firstChild,d.children[1]])		mClass(el,m=='multi'?'enabled':'disabled');
	}

	measure_fieldset(group);

	//at population, set first option or param defaultMode
	let mode = Session.game_options.mode = modes.includes(Session.def_playmode) ? Session.def_playmode : modes[0];
	let el = mBy(`i_mode_${mode}`).checked = true;

}
function populate_players(list) {
	let d = mBy('d_players');
	if (nundef(d)) return;
	mRemoveChildrenFromIndex(d, 1);
	Session.game_options.players = [];

	//multi mode: TODO select/add/remove players for now: fixed Session.def_players
	for (const name of list) {
		Session.game_options.players.push(name); //initially all default players are in list

		let d1 = mDiv(d,{},'dpl_'+name);
		let b=mButton('edit',ev=>open_player_editor(ev),d1);

		//host cannot be removed from player list!
		let label = `${name} (${get_startlevel(name,Session.cur_game)} ${get_preferred_lang(name)})`;
		if (name == Session.cur_user) { let el = mToggle(label, name, d1,{display:'inline'}); el.firstChild.setAttribute('disabled', true); }
		else { mToggle(label, name, d1, { cursor: 'pointer',display:'inline' }); }

	}

	measure_fieldset(d);

	let styles = { fz: 14, wmin: '90%',matop:8 };
	mButton('clear all', clear_all_players, d_players, styles, null, 'b_clear_players');
	mButton('add players', add_players, d_players, styles, null, 'b_add_players');
	mButton('hand select', hand_select, d_players, styles, null, 'b_select_players');
	mButton('reduce', reduce_to_current_players, d_players, styles, null, 'b_reduce_players');
	mButton('show all', show_all_players, d_players, styles, null, 'b_show_all_players');


	// d_players.innerHTML += '<br>';
	// mTextArea(3, 20, d_players, { fz: 16, display: 'none', resize: 'none', border: 'none', outline: 'none' }, 'ta_edit_players');
	// d_players.innerHTML += '<br>';
	// //mLinebreak(d_players,0);

	// mButton('edit', onclick_edit_players, d_players, { fz: 14, wmin: '90%' }, null, 'b_edit_players');

}

function reduce_to_current_players(){
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	let list = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			list.push(chk.value);
		}
	}
	populate_players(list);
}
function show_all_players(){	populate_players(get_def_players_for_user(Session.cur_user));}
function present_resume_game_options() {
	let gname = Session.cur_game;
	let g = DB.games[gname];
	Session.game_options = {};

	let d = mBy('inner_left_panel');
	let game = DB.games[Session.cur_game];
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button id='bJoinGame' class='button' style='display:none'>join game</button>
					<button id='bCreateGame' class='button' onclick='onclick_create_game_button()' style='display:none'>create game</button>
					<button id='bResumeGame' class='button' onclick='onclick_resume_game_button()'>resume game</button>
					<button id='bLobbyOk' class='button' onclick='onClickCreateGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyCancel' class='button' onclick='onClickCreateGameCancel()' style='display:none'>Cancel</button>
					<button id='bLobbyJoinOk' class='button' onclick='onClickJoinGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyJoinCancel' class='button' onclick='onClickJoinGameCancel()' style='display:none'>Cancel</button>
				</div>
			</div>
		</div>

	`;
	d.innerHTML = html;
	let d1 = mBy('d_game_options');

	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players

	populate_game_settings(d1);

	populate_playmode(d1, g.av_modes);
	populate_players(get_def_players_for_user(Session.cur_user));


}
function collect_game_options() {
	//extract options
	collect_player_list();//players are all the toggles that are checked
	collect_game_specific_options();
	//playmode nothing to collect
}
function collect_game_specific_options(){
	//retrieve game options from settings window
	let go = Session.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		let key = p;
		let val = poss[key];

		//console.log('key',key);
		let widget = mBy(`d_${key}`);
		if (nundef(widget)) { console.log('skipping key', key); continue; }
		let children = widget.getElementsByTagName('input');
		let widget_type = isString(val) ? 'radio' : 'checkbox'; //for now only user radio!!!!
		if (widget_type == 'radio') {
			for (const ch of children) {
				//console.log('===>ch',ch,ch.checked); //,ch.firstChild);
				if (ch.checked) go[key] = ch.value;
			}
		}
	}
	//console.log('go',go);
}
function collect_player_list(){

	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	Session.game_options.players = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			Session.game_options.players.push(chk.value);
		}
	}


}
function close_game_options() { mBy('inner_left_panel').innerHTML = ''; }
function get_lobby() {
	let game = DB.games[Session.cur_game];
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button id='bJoinGame' class='button' style='display:none'>join game</button>
					<button id='bCreateGame' class='button' onclick='onclick_create_game_button()'>create game</button>
					<button id='bResumeGame' class='button' onclick='onclick_resume_game_button()' style='display:none'>resume game</button>
					<button id='bLobbyOk' class='button' onclick='onClickCreateGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyCancel' class='button' onclick='onClickCreateGameCancel()' style='display:none'>Cancel</button>
					<button id='bLobbyJoinOk' class='button' onclick='onClickJoinGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyJoinCancel' class='button' onclick='onClickJoinGameCancel()' style='display:none'>Cancel</button>
				</div>
			</div>
		</div>

	`;
	return html;// createElementFromHTML(html);
}
function get_lobby(tid) {
	//console.log('get_lobby',tid);
	let game = DB.games[Session.cur_game];
	let resume_or_create = isdef(tid) ? 'resume' : 'create';
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button class='button' onclick='onclick_${resume_or_create}_game_button()'>${resume_or_create} game</button>
				</div>
			</div>
		</div>

	`;
	return html;// createElementFromHTML(html);
}
function mTextArea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}" rows="${rows}" cols="${cols}" wrap="hard"></textarea>`;
	let t = createElementFromHTML(html);
	mAppend(dParent, t);
	mStyle(t, styles);
	return t;
}
function clear_all_players(){
	console.log('trying to clear!!!')
	let d=mBy('d_players');
	let children = d.getElementsByTagName('input');
	console.log('children',children);
	
	for(const ch of children){if (!ch.getAttribute('disabled')) ch.checked=false;}
	//Session.game_options.players = [];
}
function open_player_editor(ev){
	console.log('ev',ev)
	let id = evToId(ev);
	console.log('open player editor for player ',id);
	let uname = id.substring(4);
	let game = Session.cur_game;
	console.log('player is',uname);
	let res = prompt(`enter [level lang] for player ${uname}: `);
	console.log('user entered',res);
	if (nundef(res) || isEmpty(res)) return; //enter player settings canceled!
	let parts = splitAtAnyOf(res,' ,');
	let level='none',lang='none';
	if (parts.length >=1) {level=set_startlevel(uname,game,Number(parts[0]));}
	if (parts.length >=2) {lang=set_preferred_lang(uname,parts[1]); }
	console.log('selected language',lang,'and level',level);
	console.log('should save DB',DB.users[uname]);
	if (isdef(DB.users[uname])) db_save();
	populate_players(Session.game_options.players);
	//let d=mDiv(ev.target,{position:'absolute',top:10,left:10})
}
function add_players(){
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are added to the list
	let res = prompt('enter player names to be added: ');
	let parts = splitAtAnyOf(res,' ,');
	let list = Session.game_options.players.slice(1); //removing mimi
	for(const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list,name);
	}
	list.sort();list.unshift(Session.cur_user);
	populate_players(list);
}
function hand_select(){
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are the only ones on the list + mimi natuerlich!
	let res = prompt('enter player names: ');
	let parts = splitAtAnyOf(res,' ,');
	let list = [];
	for(const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list,name);
	}
	list.sort();list.unshift(Session.cur_user);
	populate_players(list);
}


function table_options_to_game_options(t){
	console.log('t',t);
	let settings = {game:{}};
	copyKeys(t.options,settings.game);
	return settings;
}



