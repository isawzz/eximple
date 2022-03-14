//#region account
function get_account() {
	let udata = get_current_userdata();
	mBy("inner_left_panel").innerHTML = present_account(udata);
	// to_server(Session.cur_user, "contacts", php); 
}
function addColorPicker(c) {
	//console.log('addColorPicker geht!',c);
	//if (DA.colorPickerLoaded) return;
	//DA.colorPickerLoaded=true;
	let form = mBy('myform');
	let img = mBy('imgPreview');
	//let c = Session.cur_me.color; //get_user_color()
	let picker = mColorPickerBehavior(anyColorToStandardString(c), img, form,
		(a) => { DA.newColor = a; DA.colorChanged = true; },
		{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });

	if (is_online()) {
		img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
		//hier brauch noch das drag to change image!
	}
	mBy('img_dd_instruction').style.opacity = is_online() ? 1 : 0;
	img.onload = null;
}
function collect_data() {
	var myform = mBy("myform");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
			case "name":
				let uname = inputs[i].value;
				console.log(`${key} in input is`, uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data[key] = uname.toLowerCase();
				break;
			case "motto":
				data[key] = inputs[i].value.toLowerCase();
		}
	}
	if (DA.imageChanged) {
		//do the same as I did before!
		sendHtml('imgPreview', Session.cur_user);
		//DA.imageChanged = false;
	} else {
		let udata = get_current_userdata();
		let changed = false;
		if (DA.colorChanged) { udata.color = DA.newColor; changed = true; }// DA.colorChanged = false;}
		if (data.motto != udata.motto) {
			changed = true;
			udata.motto = data.motto;
			mBy('motto').innerHTML = udata.motto;
		}
		if (changed) {
			//console.log('changed!');
			DA.next = get_login;
			db_save(); //save_users();

		}

	}


}
function sendHtml(id, filename) {
	//console.log('_______________HALLO!!!!')
	window.scrollTo(0, 0);
	html2canvas(document.getElementById(id)).then(function (canvas) {
		let imgData = canvas.toDataURL("image/jpeg", 0.9);
		var profile_image = mBy("profile_image");
		profile_image.src = imgData;
		mBy('imgPreview').src = imgData;
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "server/save_url_encoded_image.php", true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//ajax.setRequestHeader("Cache-Control", "no-cache"); das ist es nicht!!!!!!!!!!!!!!!!!!!
		ajax.send("image=" + canvas.toDataURL("image/jpeg", 0.9) + "&filename=" + filename + ".jpg");
		ajax.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				//console.log('RESPONSE IMAGE UPLOAD!!!!!!!', this.responseText);
				let udata = get_current_userdata();
				if (!udata.image) { udata.image = true; db_save(); } //save_users(); }
				get_login();
				//window.location.replace('index.html');
			}
		};
	});
}
//#endregion

//#region assets
function ensure_assets_old(obj) {
	DB = jsyaml.load(obj.db);
	symbolDict = Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	WordP = jsyaml.load(obj.allWP);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	inno_create_card_assets();
	ari_create_card_assets('rbgyop');
	FenPositionList = csv2list(obj.fens);
	KeySets = getKeySets();
	if (isdef(obj.edict)) { Dictionary = { E: to_words(obj.edict), S: to_words(obj.sdict), F: to_words(obj.fdict), D: to_words(obj.ddict) } };
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
//#endregion

//#region create table
function create_table(options, players) {
	Session.cur_tid = Session.cur_table = Selected = null;
	let gname = Session.cur_game;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = Session.cur_game;
	t.host = Session.cur_user;

	t.turn = 'none'; //valf(gfunc.turn,()=>'')();

	//console.log('turn info at create',gname,t.turn);
	t.players = valf(players, valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user)));
	t.options = valf(options, lookup(Session, ['game_options', 'game']));
	t.pl_options = get_player_options(t.players, gname);
	t.status = 'started'; // created
	t.host_status = 'joined'; // joined
	t.player_status = 'joined'; // join
	t.player_init = DB.games[gname].game_type == 'turn' ? null : {}; //{};

	// init fen
	if (gname == 'gPreinno') { t.fen = inno_setup(t.players); }
	else if (gname == 'gAristo') { t.fen = ari_setup(t.players); }

	return t;
}
function modify_table() {
	let uname = Session.cur_user;

	let table = Session.cur_table;
	if (nundef(table)) { alert('no table available!'); return; }

	let game = Session.cur_game = table.game;
	let tid = Session.cur_tid = table.id;

	let t = {};
	t.id = Session.cur_tid;
	t.players = valf(lookup(Session, ['game_options', 'players']), table.players);
	t.options = valf(lookup(Session, ['game_options', 'game']), table.options);
	t.pl_options = get_player_options(t.players, game); //jeder bekommt seine settings als pl_options!

	console.log('settings to table:\nnew players', t.players, '\nnew options', t.options);
	t.player_init = {};

	return t;
}
//#region drag drop
function drag(e) {
	where();
	let newUsername = e.target.parentNode.getAttribute('username');
	//console.log('drag', newUsername);
	e.dataTransfer.setData("username", newUsername);
}
function handle_drag_and_drop(e) {
	//return;
	if (e.type == "dragover") {
		e.preventDefault();
		mClass(e.target, "dragging");
	} else if (e.type == "dragleave") {
		mClassRemove(e.target, "dragging");
	} else if (e.type == "drop") {
		let target = e.target;
		let id = target.id;
		mClassRemove(e.target, "dragging");
		//changing user image
		console.log('===>dropped on target:', e.target);
		e.preventDefault();
		DA.imageChanged = true;
		mClassRemove(e.target, "dragging");
		mDropImage(e, e.target);
	} else {
		mClassRemove(e.target, "dragging");
	}
}
//#endregion

//#region ranking
function make_csv_for_rankings() {
	let csv = 'players,';
	let games = get_values(DB.games);
	let gamenames = games.map(x => x.friendly).join(',');
	csv += gamenames;
	for (const name in DB.users) {
		let [dbuser, values, usergames] = [DB.users[name], [], []];
		for (const gname in dbuser.games) {
			let rec = dbuser.games[gname];
			if (isdef(rec.total) && rec.total > 0) usergames.push(gname);
		}
		if (isEmpty(usergames)) continue;
		for (const gname in DB.games) {
			let info = lookupSet(DB.users, [name, 'games', gname], {});
			//test if (nundef(info.total)) values.push('' + randomNumber(0, 100) + '%'); else values.push('' + Math.round(100 * info.wins / info.total) + '%');
			// if (nundef(info.total)) values.push('0%'); else values.push('' + Math.round(100 * info.wins / info.total) + '%');
			if (nundef(info.total)) values.push('0/0'); else values.push(`${info.wins}/${info.total}`);
		}
		if (!isEmpty(values)) csv += `\n${name},` + values.join(',');
	}
	return csv;
}
function get_csv_example() {
	let csv = `"Model","mpg","cyl","disp","hp","drat","wt","qsec","vs","am","gear","carb"
	"Mazda RX4",21,6,160,110,3.9,2.62,16.46,0,1,4,4
	"Mazda RX4 Wag",21,6,160,110,3.9,2.875,17.02,0,1,4,4
	"Datsun 710",22.8,4,108,93,3.85,2.32,18.61,1,1,4,1
	"Hornet 4 Drive",21.4,6,258,110,3.08,3.215,19.44,1,0,3,1
	"Hornet Sportabout",18.7,8,360,175,3.15,3.44,17.02,0,0,3,2
	"Valiant",18.1,6,225,105,2.76,3.46,20.22,1,0,3,1
	"Duster 360",14.3,8,360,245,3.21,3.57,15.84,0,0,3,4
	"Merc 240D",24.4,4,146.7,62,3.69,3.19,20,1,0,4,2
	"Merc 230",22.8,4,140.8,95,3.92,3.15,22.9,1,0,4,2
	"Merc 280",19.2,6,167.6,123,3.92,3.44,18.3,1,0,4,4
	"Merc 280C",17.8,6,167.6,123,3.92,3.44,18.9,1,0,4,4
	"Merc 450SE",16.4,8,275.8,180,3.07,4.07,17.4,0,0,3,3
	"Merc 450SL",17.3,8,275.8,180,3.07,3.73,17.6,0,0,3,3
	"Merc 450SLC",15.2,8,275.8,180,3.07,3.78,18,0,0,3,3
	"Cadillac Fleetwood",10.4,8,472,205,2.93,5.25,17.98,0,0,3,4
	"Lincoln Continental",10.4,8,460,215,3,5.424,17.82,0,0,3,4
	"Chrysler Imperial",14.7,8,440,230,3.23,5.345,17.42,0,0,3,4
	"Fiat 128",32.4,4,78.7,66,4.08,2.2,19.47,1,1,4,1	`;
	return csv;
}
function csv_table_example(dParent) {
	mystring = get_csv_example();
	present_table_from_csv(mystring, dParent);
}
function present_table_from_csv(csv_text, dParent) {
	//console.log('present_table_from_csv');
	prepare_table();
	dParent.innerHTML = get_table_html();
	import_the_text(csv_text);
}
//#endregion

//#region scoring
function scoring_update(players, winners, game) {
	for (const p of players) {
		let info = lookupSet(DB.users, [p, 'games', game], {});
		let total = lookupSet(info, ['total'], 0);
		let wins = lookupSet(info, ['wins'], 0); //brauch ich fuer spaeter!
		//console.log('settings wins',wins,'for',p)
		lookupSetOverride(info, ['total'], total + 1);
	}
	for (const p of winners) {
		let info = lookup(DB.users, [p, 'games', game]);
		let wins = lookup(info, ['wins']);
		console.assert(isdef(info) && isdef(wins), 'SCORING DB INFO MISSING FOR ' + p);
		lookupSetOverride(info, ['wins'], wins + 1);
	}

}
function compute_elo_ranking(players, game) {
	//brauch ein ELO ranking! ranking ist: wer am oeftesten gewonnen hat
	//for each player in Session.cur_players
	players = sortBy(players, 'score');

	//jetzt mach ich aus den players buckets von gleichen scores
	let buckets = {};
	for (const pl of players) {
		let sc = pl.score;
		if (nundef(buckets[sc])) buckets[sc] = [];
		buckets[sc].push(pl.name);
	}
	//wieviele buckets gibt es?
	let nBuckets = get_keys(buckets).length;
	let elopart = 2 / (nBuckets - 1);
	let val = -1;
	for (const b in buckets) {
		for (const name of buckets[b]) {
			let elo = get_elo(name, game);
			set_elo(name, game, elo + val);
			console.log('user', name, 'with score', b, 'gets', val, 'added to elo!');
		}
		val += elopart;
	}
}
function inc_level_on_winstreak(winners, game) {
	//console.log('winners', winners);
	for (const w of winners) {
		let o = lookup(DB.users, [w, 'games', game]);
		console.assert(isdef(o), 'no DB.users record for game', game);
		o.winstreak = DB.users[w].games[game].winstreak = isdef(o.winstreak) ? o.winstreak + 1 : 1;
		if (o.winstreak >= 1) {
			//this player will get his startlevel increased!!!!
			let currentlevel = get_startlevel(w, game);
			//console.log('current level for', w, currentlevel);
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.min(currentlevel + 1, Session.maxlevel));
			delete o.winstreak;
			//console.log('...startlevel of', w, 'is increased to', get_startlevel(w, game));
		}
		//console.log('user', w, 'db entry', o);
	}
}
function dec_level_on_losestreak() {
	let players = get_values(Session.cur_players);
	let scores = players.map(x => x.score);
	let min = arrMin(scores);
	let losers = players.filter(x => x.score == min).map(x => x.name);
	let game = Session.cur_game;
	//console.log('losers', losers, 'game', game);

	for (const w of losers) {
		let o = lookup(DB.users, [w, 'games', game]);
		//console.assert(isdef(o), 'no DB.users record for game', game);
		o.losestreak = DB.users[w].games[game].losestreak = isdef(o.losestreak) ? o.losestreak + 1 : 1;
		if (o.losestreak >= 1) {
			//this player will get his level decreased!!!!
			let currentlevel = get_startlevel(w, game);
			//console.log('current level for', w, currentlevel);
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.max(currentlevel - 1, 0));
			delete o.losestreak;
			//console.log('...startlevel of', w, 'is decreased to', get_startlevel(w, game));
		}
	}
}
function record_winners(winners, game) { ensure_winnerlist(game).push(winners); } // lookupAddToList(DB.games, [game, 'winnerlist'], winners); }
//#endregion

function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	TOMan.TO.anim = setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function clear_table_all() {
	clear_table_events();
	if (isdef(mBy('table'))) clearTable();
	resetUIDs(); //sicherheitshalber!
	Items = {};
}
function clear_table_events() {
	clear_timeouts();
	STOPAUS = true;
	pauseSound();
	DELAY = 1000;
	uiActivated = aiActivated = false;
	onclick = null;
	clearMarkers();
}
function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
}
function clear_timeouts() {
	clearTimeout(TOAnim); TOAnim = null;
	clearTimeout(TOMain); TOMain = null;
	clearTimeout(TOTicker); TOTicker = null;
	clearTimeout(TOFleetingMessage); TOFleetingMessage = null;
	clearTimeout(TOTrial); TOTrial = null;
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } TOList = {}; }
	if (isdef(TOMan)) TOMan.clear();
}
function convert_from_row(row) {
	//row is modified!
	for (const k in row) {
		let val = row[k];
		if (isNumber(val)) row[k] = Number(val);
		if (isString(val) && val[0] == '{') { row[k] = JSON.parse(val); }
		if (val == 'null') row[k] = null;
		if (k == 'players' && isString(row[k])) row[k] = val.split(',');
	}

}
function db_save() {
	//console.log('_____db_save: InternetStatus:', is_online() ? 'online' : 'OFFLINE', '\nuser', DB.users[Session.cur_user]);
	if (!is_online()) { console.log('not saving! (no internet)'); return; }
	let txt = jsyaml.dump(DB);
	to_server({ db: txt }, 'dbsave');
}
function delete_current_table() {
	if (nundef(Session.cur_tid)) return;

	to_server(Session.cur_tid, 'delete_table');
	Session.cur_tid = null;
	Session.cur_table = null;
}
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function generate_friendly_table_name(game, players) {
	//list of places
	const europe_capitals = 'Amsterdam,	Ankara,	Astana,	Athens,	Baku,	Belgrade,	Berlin,	Bern,	Bratislava,	Brussels,	Bucharest,	Budapest,	Chisinau,	Copenhagen,	Dublin,	Helsinki,	Kiev,	Lisbon,	Ljubljana,	London,	Luxembourg,	Madrid,	Minsk,	Monaco,	Moscow,	Nicosia,	Oslo,	Paris,	Podgorica,	Prague,	Reykjavík,	Riga,	Rome,	San Marino,	Sarajevo,	Skopje,	Sofia,	Stockholm,	Tallinn,	Tbilisi,	Tirana,	Vaduz,	Valletta,	Vatican City,	Vienna,	Vilnius,	Warsaw,	Yerevan,	Zagreb';
	const asia_capitals = 'Abu Dhabi,	Amman,	Ankara,	Ashgabat,	Astana,	Baghdad,	Baku,	Bangkok,	Beijing,	Beirut,	Bishkek,	Cairo,	Colombo,	Damascus,	Dhaka,	Dili,	Doha,	Dushanbe,	Hanoi,	Islamabad,	Jakarta,	Jerusalem,	Kabul,	Kathmandu,	Kuala Lumpur,	Kuwait City,	Malé,	Manama,	Manila,	Moscow,	Muscat,	Naypyidaw,	New Delhi,	Nicosia,	Phnom Penh,	Pyongyang,	Ramallah,	Riyadh,	Sana’a,	Seoul,	Singapore,	Taipei,	Tashkent,	Tbilisi,	Tehran,	Thimphu,	Tokyo,	Ulaanbaatar,	Vientiane,	Yerevan';

	//let list = europe_capitals.split(',\t');
	//console.log('list',list);
	return 'Battle of ' + chooseRandom(coin() ? europe_capitals.split(',\t') : asia_capitals.split(',\t'));
}
function generate_table_id(gamename) {
	//wie macht man einen timestamp?
	return gamename + '_' + get_timestamp();
}
function get_cur_menu() { if (isdef(Session.cur_menu)) window['get_' + Session.cur_menu](); }
function get_scores_from_cur_players() {
	let players = get_values(Session.cur_players);
	let sorted = sortByDescending(players, 'score');
	let list = sorted.map(x => `${x.name}:${x.score}`);
	let fen = list.join(',');
	return fen;
}
function get_game_option(g, key) {
	let set_option = lookup(Session, ['cur_table', 'options', key]);
	if (set_option) return set_option;
	let opts = g.options[key];
	let defval = opts.split(',')[0];
	return defval;
}
function get_game_or_user_option(g, key) {
	let opts = g.options[key].split(',');
	let defval = opts[0];
	let userval = lookup(DB.users, [Session.cur_user, key]);
	if (userval && opts.includes(userval)) return userval;

	//if (key == 'level_setting') console.log('immer noch da, ok');
	let set_option = lookup(Session, ['cur_table', 'options', key]);
	if (set_option) return set_option;
	//if (key == 'level_setting') console.log('immer noch da, NOT ok!!!!!!!');
	return defval;
}
function get_user_game_tables() { to_server({ uname: Session.cur_user, game: Session.cur_game }, "get_user_game_tables"); }
function get_keys(o) { return Object.keys(o); }
function get_values(o) { return Object.values(o); }
function get_image_path(userdata) {
	let p = '../base/assets/images/';
	if (userdata.image) p += userdata.name; else p += 'unknown_user';
	p += '.jpg';
	if (is_online()) p += '?=' + Date.now();
	//console.log('image path', p);
	return p;
}
function get_timestamp() { return new Date().getTime(); }
function get_player_options(players, game) { return players.map(x => `${x}:${get_startlevel(x, game)}:${get_preferred_lang(x)}`).join(','); }
function got_user_game_tables(obj) {
	let tables = obj.tables;
	if (!isEmpty(tables)) { Session.cur_tid = tables[0].id; Session.cur_table = tables[0]; }

}
function in_game() { return isdef(mBy('table')) && Session.in_game == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_on() { Session.in_game = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_off() { Session.in_game = null; }
function in_game_open_prompt() { return uiActivated && Session.in_prompt == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_on() { Session.in_prompt = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_off() { Session.in_prompt = null; }
function is_admin(name) { return ['mimi'].includes(isdef(name) ? name : Session.cur_user); }
function is_game_host() { return Session.cur_table.host == Session.cur_user; }
function is_a_word(w, lang) { return lookup(Dictionary, [lang, w]) != null; }
function is_race_game(gname) { return DB.games[gname].game_type == 'race'; }
function make_players(playernames) {
	let o = Session.cur_players = {};

	for (const plname of playernames) {
		o[plname] = { name: plname, color: getColorDictColor(DB.users[plname].color), imgPath: `../base/assets/images/${plname}.jpg`, score: 0 };
	}

	Session.cur_me = o[Session.cur_user];
	Session.cur_others = get_values(o).filter(x => x.name != Session.cur_user);

}
function modify_def_players(list) {
	console.log('list', list);
	return;
	let uname = Session.cur_user;
	Session.def_players = list;
	newlist = get_def_players_for_user(uname);
	populate_players(newlist);
	// setTimeout(() => {
	// 	// let ta = mBy('ta_edit_players');
	// 	// hide(ta);
	// 	let button = mBy('b_edit_players');
	// 	button.innerHTML = 'edit';
	// }, 100);

}
function open_game_ui() {

	clear_table_all();

	let hmin = firstNumber(getCssVar('--inner_left_panel_height'));

	//console.log('hmin', hmin);

	mBy("inner_left_panel").innerHTML = `<div style='min-height:${hmin}px'>
	<div id="md" style="display: flex;min-height:${hmin}px">
		<div id="dLeftSide" style="align-self: stretch;min-height:${hmin}px"></div>
		<div id="dRightSide" style='min-height:${hmin}px'>
			<div id="table" class="flexWrap"></div>
		</div>
	</div></div>`;

	initTable();
	badges_off(); //badges_on | badges_off ==>dann geht setBadgeLevel automatisch!
	//initAux();
}
function param_present_contacts(obj, dParent, onclick_func_name) {
	let others = sync_users(obj.users);//after this DB.users is up-to-date![others,has_changed]
	Session.others = others.map(x => x.name);
	let msgs = valf(obj.msgs, {});
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  `;

	let mydata_list = '';
	for (const r of others) {
		row = r;
		let image = get_image_path(row); // `../base/assets/images/${row.image ? row.name : 'unknown_user'}.jpg`;
		let mydata_element = `
				<div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' 
					onclick='${onclick_func_name}(event)'>
					<img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
					<br>${row.name}`;

		if (isdef(msgs[row.username])) {
			mydata_element += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
		}

		mydata_element += "</div>";
		mydata_list += mydata_element;
	}

	mydata += mydata_list;
	dParent.innerHTML = mydata;
}
function send_timer_ticker() {
	let me = Session.cur_players[Session.cur_user];
	to_server({ tid: Session.cur_tid, score: me.score, state: me.state, uname: me.name }, 'ticker_status_send_receive');
}
function set_background_color(color, elem) { if (nundef(elem)) elem = mBy('md').parentNode; mStyle(elem, { bg: getColorDictColor(color) }); }
function set_cur_tid_for_game() {
	console.assert(isdef(Session.tables_by_game) && isdef(Session.cur_game), "set_cur_tid_for_game");
	let tables = Session.tables_by_game;
	let game = Session.cur_game;
	if (!isEmpty(tables[game])) Session.cur_tid = tables[game][0].id;
	else Session.cur_tid = null;

}
function set_most_recent_table_as_cur_tid(tables) { if (!isEmpty(tables)) Session.cur_tid = tables[0].id; }
function set_tables_by_game(obj, is_set_cur_id = true) {
	//console.log('set_tables_by_game: obj', obj);
	let tables = Session.tables = obj.tables;
	//tables.map(x => console.log('table:', x));

	//what if tables is empty?
	let bygame = Session.tables_by_game = {};

	if (isEmpty(tables)) {
		Session.cur_tid = null;
		Session.tables_by_game = {};
	} else {
		//got tables sorted by most recent first
		if (is_set_cur_id) {
			let t = tables[0];
			Session.cur_tid = t.id; //this would be the most recent table
			Session.cur_game = t.game;
		}
		for (const t of tables) { lookupAddToList(bygame, [t.game], t); }
	}
	return bygame;
}
function show_feedback(is_correct, correction = true) {
	function success() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist;
			if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
			else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			let sz = getRect(uilist[0]).h;
			//console.log('in der succesfunc!!!!!!!', uilist)
			for (const ui of uilist) {

				//mpOverImage(createSuccessMarker(sz), ui, sz);
				//mpOverImage(markerSuccess(), ui, sz);
				mpOver(markerSuccess(), ui, sz, 'green', 'segoeBlack'); //, 'openMojiTextBlack'); //WORKS!!!


				//show_checkmark(ui); NO

				//let d = create_marker('A');	mp_over(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); NO

				//let d = markerSuccess();
				//console.log('sz',sz,'ui',ui,'\nmarker',d);
				//mpOver(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); //no:segoe,openmo,orig: 'segoeBlack');
				// mpOver(d, ui, Math.max(sz,40), 'limegreen', 'none'); //no:segoe,openmo,orig: 'segoeBlack');
			}
		}
		return 500;
	}
	function fail() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			//console.log('fail',uilist)
			let sz = getRect(uilist[0]).h;
			//console.log('failFunc:',uilist,sz)
			for (const ui of uilist) {

				//console.log('hallo!!!')
				// mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'segoeBlack'); //, 'openMojiTextBlack');
				mpOver(markerFail(), ui, sz, 'red', 'segoeBlack'); //, 'openMojiTextBlack');
			}
		}
		return 1000;
	}
	if (is_correct) { return success(); }
	else {
		if (correction) {
			//console.log('CORRECTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Selected.correctUis)
			let anim = valf(Selected.animation, 'onPulse5');
			for (const ui of Selected.correctUis) { mClass(ui, anim); }
		}
		return fail();
	}
}
function show_user_image(uname, dParent, sz = 300) {
	let d = mDiv(dParent, { margin: 'auto', w: sz });
	let html = `
	<div style='text-align:center;margin-top:50px'>
		<img src='../base/assets/images/${uname}.jpg' class="img_person" height=150 />
	</div>
	`;
	d.innerHTML = html;
	return d;
}
function show_level(level, maxlevel) {
	//console.log('level', level, 'maxlevel', maxlevel);
	let handicap = maxlevel - level;
	dLevel.innerHTML = `level: ${level}`;
	mStyle(dLevel, { fg: level >= 8 ? get_user_color() : 'white' });
}
function show_title(title) { mBy('dScore').innerHTML = title; }
function show_my_score() { let me = Session.cur_players[Session.cur_user]; console.log('my', me.name, 'score is', me.score); }
function show_game_name(gname) { dGameTitle.innerHTML = gname; }
function show_score_table(fen, game_title, dParent) {
	let d = mDiv(dParent, { margin: 'auto', wmin: 300, wmax: 500 }); //, bg:'red'});

	html = `<div style='text-align:center;margin-top:100px'>
	<h1>${game_title}</h1>
	<table id='customers'><tr><th>player</th><th>score</th></tr>
	`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;

}
function show_gameover_new(winners) {
	//console.log('winners', winners)//winners: non-empty list of names!
	let game = Session.cur_game;
	let table = Session.cur_table;

	//scoring update
	if (!Session.scoring_complete) {
		console.log('======>scoring!!!!!', table.friendly);
		scoring_update(get_keys(Session.cur_players), winners, game);
		if (Session.level_setting == 'player') {
			inc_level_on_winstreak(winners, game);
			dec_level_on_losestreak();
		}
		out1();
		Session.scoring_complete = true;
	}

	//show game over
	let pl = Session.cur_players[winners[0]];
	let styles = { bg: pl.color, alpha: .75, fg: 'contrast', top: 220, };
	let msg = 'GAME OVER - The ' + (winners.length > 1 ? `winners are ${winners.join(', ')}!!!` : `winner is ${winners[0]}!!!`);
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
function show_rankings(dParent) {
	csv = make_csv_for_rankings();
	//console.log('csv', csv);
	let ch = csv[csv.length - 1];
	if (ch == '%' || isNumber(ch)) {
		//console.log('===>show rankings');
		let d = mDiv(dParent, { align: 'center' }, null, `<h1>All Time Ranking</h1>`);
		let d1 = mDiv(d, { align: 'center', display: 'flex' });
		mCenterCenterFlex(d1);
		present_table_from_csv(csv, d1);
		mLinebreak(dParent);
	}

}
function status_message_new(msg, dParent, styles = {}) {
	let d = mDiv(dParent, { margin: 0 });
	let def_styles = { vpadding: 10, align: 'center', position: 'absolute', fg: 'contrast', fz: 24, w: '100vw' };
	copyKeys(styles, def_styles);
	let dContent = mDiv(d, def_styles, null, msg);
}
function status_message(msg, styles = {}) {
	let d = mBy('dMessage'); show(d); clearElement(d);
	let def_styles = { padding: 20, align: 'center', position: 'absolute', fg: 'contrast', fz: 24, w: '100vw' };
	copyKeys(styles, def_styles);
	let dContent = mDiv(d, def_styles, null, msg);
	return dContent;
}
function status_message_off() {
	let d = mBy('dMessage');
	clearElement(d);
	hide(d);
	onclick = null;
}
function stop_game() { clear_table_events(); }
function to_words(x) {
	//console.log(x);
	let list = x.split('\n');
	//console.log(list);
	let di = {};
	list.map(x => di[x.toLowerCase()] = x);
	return di;
}
function toogle_internet_status() {
	if (is_online()) {
		go_offline();
		//menu_disable('chat');
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled off';
		b.innerHTML = 'offline';
	} else {
		go_online();
		//menu_enable('chat');
		db_save();
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled on';
		b.innerHTML = 'online';
	}
	console.log('InternetStatus:', is_online() ? 'online' : 'OFFLINE');
}
function toggle_polling_status() {
	if (is_polling_on()) {
		stop_polling();
		let b = mBy('b_polling');
		b.className = 'buttonClass donebutton enabled off';
		b.innerHTML = 'polling off';
	} else {
		allow_polling();
		let b = mBy('b_polling');
		b.className = 'buttonClass donebutton enabled on';
		b.innerHTML = 'polling on';
	}
	console.log('Polling Status:', is_polling_on() ? 'ON' : 'OFF');
}
function try_find_username(ev) {
	evNoBubble(ev);
	let username = findAttributeInAncestors(ev.target, 'username');
	//console.log('found username in ancestor:',username);
	if (nundef(Session.users_by_name[username])) { alert('ERROR username!'); return null; }
	return username;


}
function update_db_user_from_pl_options(fen, game) {
	let parts = fen.split(',');
	for (const p of parts) {
		let [name, startlevel, lang] = p.split(':');
		startlevel = Number(startlevel);
		set_startlevel(name, game, startlevel);
		set_preferred_lang(name, lang);
		//console.log('reading player', name, startlevel, lang);
	}
}
function update_game_values() {
	let game = Session.cur_game;
	let uname = Session.cur_user;

	//update all game values for this round:
	let g = Session;
	let basevals = lookup(DB.games, [game]); if (basevals) copyKeys(basevals, g); //g = mergeOverride(g, next);
	for (const k in g.options) { g[k] = get_game_or_user_option(g, k); } //set options chosen in game_options or default
	//if (TESTING) g.level_setting = 'max';
	let uservals = lookup(DB.users, [uname, 'games', game]); if (uservals) copyKeys(uservals, g);
	let levels = lookup(DB.games, [game, 'levels']);
	g.maxlevel = valf(get_keys(levels).length, 0) - 1;
	g.color = getColorDictColor(g.color);

	//level setting:
	//unless this setting is 'player' levels should NOT be changed!
	//g.level is used for all purposes in this game, g.startlevel is NEVER modified
	let level = g.level = nundef(g.level_setting) || g.level_setting == 'player' ? valf(g.startlevel, g.def_startlevel)
		: g.level_setting == 'min' ? 0 : g.level_setting == 'max' ? g.maxlevel : g.def_startlevel;
	if (levels) copyKeys(levels[level], g);
	delete g.levels;

	return g;
}
function update_table_options_for_user(uname, table_options, game) {
	let lang = get_preferred_lang(uname);

	update_db_user_from_pl_options(table_options, game);

	let lang2 = get_preferred_lang(uname);
	if (lang != lang2) get_dictionary();

}
function update_session(obj) {
	//console.log('update_session obj', obj);
	for (const k in obj) { if (isdef(Session[k])) copyKeys(obj[k], Session[k]); else Session[k] = obj[k]; }
	if (isdef(obj.table)) {
		Session.cur_table = Session.table;

		Session.cur_funcs = window[Session.cur_game]();

		if (!isEmpty(obj.playerdata)) make_players(Session.table.players);

		console.assert(isdef(Session.cur_user) && Session.cur_game == Session.table.game && Session.cur_tid == Session.table.id, "SESSION MISMATCH IN GAME_OPEN_FOR_MOVE!!!!!!!!!!!!!!!!!!!!!");
	}
	if (isdef(obj.playerdata)) {
		let o = Session.cur_players;
		for (const rec of obj.playerdata) {

			//console.log('score', rec.name, rec.score, o[rec.name].score);
			if (rec.state == 'null') rec.state = null;
			copyKeys(rec, o[rec.name]);
		}
	}
}
function ui_game_menu_item(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], getColorDictColor(g.color), null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
		let have_another_move = t.player_status == 'joined';
		color = have_another_move ? 'green' : 'red';
		id = `rk_${t.id}`;
	}
	return `
	<div onclick="onclick_game_menu_item(event)" gamename=${g.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
	${nundef(color) ? '' : runderkreis(color, id)}
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${g.friendly}</div>
	`;
}
function ui_game_stats(players) {
	let d = dTitle;
	clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}

function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
	//if (fname.includes('asset')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('server')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('user')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('drag')) console.log(':',fname,isdef(o)?o:'(no data)');
}
function out1() {
	let game = Session.cur_game;

	let msg = 'stats:score wins total\n';
	for (const x in Session.cur_players) {
		let pl = Session.cur_players[x];
		let info = DB.users[x].games[game];
		msg += `${x}: ${pl.score} ${info.wins} ${info.total}\n`;
	}
	console.log(msg);
	//console.log('stats', Session.cur_table.friendly, get_values(Session.cur_players).map(x => `${x.name}:${x.score}`).join(','), get_keys(Session.cur_players).map(x => `total:${DB.users[x].games[game].total}`).join(','));
}

