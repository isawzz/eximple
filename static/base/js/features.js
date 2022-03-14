//#region dictionaries
async function create_pic_dicts(list = ['e', 'd', 'f', 's']) {
	let syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	for (const l of list) {
		let di = await create_pic_dict(l, syms);
		downloadAsYaml(di, l + 'picdict');
	}
	loader_off();
}
async function create_pic_dict(l, syms) {
	//first need to get dicts in asset loading!
	//wo werden assets geladen?
	//kann ich txt file mit einfachem ajax holen?
	let edict = await route_path_text(`../base/assets/words/${l}dict.txt`);
	console.log('dict', edict);
	let lang = l.toUpperCase();

	let words = l == 'e' ? edict.split('\r\n') : edict.split('\n');

	console.log('words', words);
	console.log('syms', syms);

	let wdi = {};
	for (const w of words) {
		let w1 = w.trim().toLowerCase();
		if (isEmpty(w1)) continue;
		//console.assert(w1 == w1.toLowerCase(),'not in lower case:',l,w1);
		wdi[w1] = true;
	}

	let slist = [];
	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		slist.push({ key: skey, w: e });
	}
	slist_sorted = sortBy(slist, 'w');
	console.log('slist sorted', slist_sorted);

	console.log(wdi);
	let edi = {};
	for (const o of slist_sorted) {
		let [e, skey] = [o.w, o.key];
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;

	return;

	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		console.assert(isdef(e) && e == e.toLowerCase(), 'word in syms not lowercasse:' + e);
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;
}
function ensureDictionary() {
	if (nundef(Dictionary)) { Dictionary = { E: {}, S: {}, F: {}, C: {}, D: {} } };
	for (const k in Syms) {
		for (const lang of ['E', 'D', 'F', 'C', 'S']) {
			let w = Syms[k][lang];
			if (nundef(w)) continue;
			Dictionary[lang][w.toLowerCase()] = Dictionary[lang][w.toUpperCase()] = k;
		}
	}
}


//#endregion

//#region fleetingMessage
var TOFleetingMessage;
function clearFleetingMessage() {
	//console.log('HIER!');//, getFunctionsNameThatCalledThisFunction());
	clearTimeout(TOFleetingMessage);
	clearElement(dLineBottom);
}
function showActiveMessage(msg, handler, styles = {}, fade = false) {

	let defStyles = { fz: 22, rounding: 10, vpadding: 12, hpadding: 0, matop: 50 };
	styles = mergeOverride(defStyles, styles);
	if (nundef(styles.fg)) styles.fg = colorIdealText(Session.color);

	clearFleetingMessage();
	let d = fleetingMessage(msg, styles, fade);
	d.onclick = handler;

}
function showFleetingMessage(msg, msDelay, styles = {}, fade = false, ms = 3000) {

	let defStyles = { fz: 22, rounding: 10, padding: '2px 12px', matop: 50 };
	styles = mergeOverride(defStyles, styles);

	//console.log('bg is', Session.color, '\n', styles, arguments)
	if (nundef(styles.fg)) styles.fg = colorIdealText(Session.color);

	clearFleetingMessage();
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, styles, fade, ms), msDelay);
	} else {
		fleetingMessage(msg, styles, fade, ms);
	}
}
function fleetingMessage(msg, styles, fade = false, ms = 3000) {
	let d = mDiv(dLineBottom);
	if (isString(msg)) {
		d.innerHTML = msg;
		mStyle(d, styles)
	} else {
		mAppend(d, msg);
	}
	if (fade) animateProperty(dLineBottom, 'opacity', 1, .4, 0, ms);
	return d;
}
//#endregion fleetingMessage

//#region keys.js
//prep key sets at start of prog
function getKeySets() {
	//let ks = localStorage.getItem('KeySets');

	makeCategories();	//console.log('Categories',Categories)

	//if (isdef(ks)) { return JSON.parse(ks); }

	//console.log('hallo'); return [];
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			//console.log('ksk',ksk,'k',k);
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;

}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;

		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;

			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function makeCategories() {
	//console.log(ByGroupSubgroup);
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};

	let incompatible = DA.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
	//console.log('categories', keys);

}

//keys and categories
function genCats(n) {
	//console.log('???????',DA.incompatibleCats)
	let di = {};
	let cats = Object.keys(Categories);
	//console.log('cats available:',cats)
	for (let i = 0; i < n; i++) {
		let cat = chooseRandom(cats);
		let incompat = DA.incompatibleCats[cat];
		//console.log('cats',cats,'\ncat',cat,'\nincompat',incompat)
		cats = arrMinus(cats, incompat);
		removeInPlace(cats, cat);
		//console.log('cats after minus',cats);
		di[cat] = Categories[cat];
	}
	return di;
}
function oneWordKeys(keys) { return keys.filter(x => !x.includes(' ')); }

function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		// if (item.key.includes('key')) console.log('hallo',item)
		// if (isdef(di[item.best])) {console.log('dupl:',item.key); continue;}
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);

	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;

		//console.log('diff', diff, additionalSet, keys)
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x)); //
		//if (additionalSet) keys = keys.concat(keySets[additionalSet]);
		//console.log(keys)
	}

	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];

		//console.log('info',info);
		info.best = info[lang];
		//console.log(info.best)

		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			//console.log(k,lang,klang)
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		//console.log(k,lang,lastOfLanguage(k,lang),info.best,info)
		let isMatch = true;
		//if (isdef(filterFunc)) console.log(filterFunc,filterFunc(k,info.best))
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}

	if (isdef(nMin)) {
		//if result does not have enough elements, take randomly from other
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}

	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }

	if (isdef(nMin)) console.assert(primary.length >= nMin);
	//console.log(primary)
	if (nundef(allowDuplicates)) {
		//console.log('hhhhhhhhhhhhhhh',primary.length)
		primary = removeDuplicates(primary);
	}
	return primary;
}

//#endregion

//#region loader and _on _off switches
function testbuttons_on() {
	let buttons = arrChildren(mBy('dTestButtons'));
	for (const b of arrFromIndex(buttons, 1)) {
		mClassRemove(b, 'disabled');
		mClass(b, 'enabled');
	}
	mBy('b_delete_table').innerHTML = 'delete current table';
}
function testbuttons_off() {
	let buttons = arrChildren(mBy('dTestButtons'));
	for (const b of arrFromIndex(buttons, 1)) {
		mClass(b, 'disabled');
		mClassRemove(b, 'enabled');
		// mClassReplace(b,'enabled','disabled');
	}
	mBy('b_delete_table').innerHTML = 'delete most recent table';
}

function loader_on() { mBy('loader_holder').className = 'loader_on'; }
function loader_off() { mBy('loader_holder').className = 'loader_off'; }
function table_shield_on() {
	if (nundef(dTableShield)) {
		dTableShield = mDiv(dTable, { position: 'absolute', bg: '#0000ff80', w: '100%', h: '100%' }); //VERTICAL SIDEBAR!!!
		dTableShield.style.zIndex = 1000;
	}
}
function table_shield_off() { 
	if (isdef(dTableShield)) { dTableShield.remove(); dTableShield = null; } 
}
function shield_on() { show('dShield'); mStyle(dShield, { bg: '#00000080' }); }
function shield_off() { hide('dShield'); }
function click_shield_on(msg) { show_shield(msg); }
function click_shield_off() { mBy('dShield').style.display = 'none'; }
function show_shield(msg) {
	mBy('dShield').style.display = 'block';
	mBy('dShield').innerHTML = msg;
}
function modal_on() { let d = mBy('dModal'); return d; }
function modal_off() { let d = mBy('dModal'); d.innerHTML = ''; d.style.display = 'none'; }
function polling_shield_on(msg) {
	let d = mBy('dPollingShield');
	d.style.display = 'block';
	d.innerHTML = msg;
}
function polling_shield_off() { mBy('dPollingShield').style.display = 'none'; }
function just_message(msg, styles = {}) {//,handler) {
	alert(msg);
	// let d = mBy('dMessage1');
	// show(d);
	// clearElement(d);
	// let def_styles = { padding: 20, align: 'center', position: 'absolute', fg: 'contrast', fz: 24, bg: 'silver', w: '100vw' };
	// copyKeys(styles, def_styles);
	// let dContent = mDiv(d, def_styles, null, msg);
}
function badges_on() {
	if (!isdef(mBy('dLeiste'))) initSidebar();
	Session.is_badges = true;
	Badges = [];
}
function badges_off() {
	hide('dLeftSide');
	delete Session.is_badges;
	Badges = [];
}
function actions_on() {
	if (!isdef(mBy('dLeiste'))) initActionPanel();
	Session.is_actions = true;
	Actions = [];
}
function actions_off() {
	hide('dLeftSide');
	delete Session.is_actions;
	Actions = [];
}
//function turn_reload_on(){Session.reload_func = 'turn'}
//function race_reload_on(){Session.reload_func = 'race'}

function main_menu_off() { close_sidebar(); open_mini_user_info(); }
function main_menu_on() { open_sidebar(); close_mini_user_info(); }

//#endregion

//#region initTable
function initTable() {
	let table = mBy('table');
	clearElement(table);
	mStyle(table, { overflow: 'hidden' });

	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	show('dLeftSide');
	let dParent = mBy('dLeftSide');
	clearElement(dParent);
	//console.log('dLeiste wird angelegt!!!!!!!')
	dLeiste = mDiv(dParent);
	mStyle(dLeiste, { wmin: 70, hmax: '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initActionPanel() {
	show('dLeftSide');
	let dParent = mBy('dLeftSide');
	clearElement(dParent);
	//console.log('dLeiste wird angelegt!!!!!!!')
	dLeiste = mDiv(dParent);
	mStyle(dLeiste, { wmin: 70, hmin: '100%', display: 'flex', 'flex-flow': 'column wrap' });
}
function initAux() {
	dAux = mBy('dAux');
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	if (PROJECTNAME != 'belinda') mStyle(dLineTitle, { matop: 5 });
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottom = mDiv(dLineBottom); dLineBottom.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion

//#region internet
function init_internet() { DA.internet = navigator.onLine; } //if (is_really_online()) go_online();}
function go_online() { DA.internet = true; }//lookupSet(DA, ['internet'], true); }
function go_offline() { DA.internet = false; }//lookupSet(DA, ['internet'], false); }
function is_online() { return lookup(DA, ['internet']); }
function is_really_online() { return navigator.onLine; }
//#endregion

//#region menu (enabling and disabling any element by key) requires: key must be unique system-wide!!!!
function register_menu_item(elem, key, handler) { }
function menu_find_elem(key, elem) {
	//id could be label_key or Items[key]
	elem = isdef(elem) ? elem : isdef(mBy('label_' + key)) ? mBy('label_' + key) : isdef(mBy(key)) ? mBy(key) : isdef(Items[key]) ? iDiv(Items[key]) : null;
	if (nundef(elem)) { console.log('no menu with key', key); return null; }
	return elem;
}
function menu_enable(key, elem) {
	let d = menu_find_elem(key, elem);
	if (d) {
		mClassRemove(d, 'disabled');
		mClass(d, 'enabled');
		d.setAttribute('enabled', true);
	}
}
function menu_disable(key, elem) {
	let d = menu_find_elem(key, elem);
	if (d) {
		mClassRemove(d, 'enabled');
		mClass(d, 'disabled');
		d.setAttribute('enabled', false);
	}
}
function menu_enabled(key, elem) {
	let d = menu_find_elem(key, elem);
	return d ? mHasClass(d, 'enabled') : false;
}

//#endregion

//#region sidebar
function disable_sidebar() { close_sidebar(); }
function close_sidebar() {
	let d = mBy('left_panel'); d.style.flex = 0;
	// console.log('hallo',d,d.parentNode.style.display);
	// //d.remove(); return;
	// d.style.flexGrow = 0;
	// d.style.flexShrink = 1;
	// d.style.flexBasis = 0;
	// d.style.overflowX = 'hidden';
	// // = '0 0 0'; 
	// //d.style.minWidth = 0;	d.style.width = 0;
	DA.left_panel = 'closed';
}
function open_sidebar() {
	DA.left_panel = 'open';
	mBy('left_panel').style.flex = 1;
}
function sidebar_transition_on() {
	let d = mBy('left_panel');
	mClass(d, 'alltransition');

}
function sidebar_transition_off() {
	let d = mBy('left_panel');
	mClass(d, 'notransition');
}
function toggle_sidebar() {
	//console.log('DA.left_panel:',DA.left_panel, nundef(DA.left_panel) || DA.left_panel == 'open'?'should close':'should open');

	if (nundef(DA.left_panel) || DA.left_panel == 'open') close_sidebar(); else open_sidebar();
}

//#endregion

//#region user
function add_new_user(udata, save = true) {
	//alert('add_new_user!!!! ' + udata.name);
	console.log('WILL NOT ADD NEW USERS AT THIS TIME!!!', udata); return;
	console.assert(isDict(udata) && isdef(udata.name) && isString(udata.name) && udata.name.length < 50, 'CANNOT ADD THIS WEIRED USER ' + udata.name);

	DB.users[udata.name] = udata;
	if (save) db_save();
	return udata;
}
async function add_users_to_sql_db(not_in_sql_db) { to_server(not_in_sql_db, 'add_users'); }
function ensure_winnerlist(game) { return lookupSet(DB.games, [game, 'winnerlist'], []); }
function get_def_players_for_user(uname, list) {
	if (nundef(list)) list = Session.def_players;
	removeInPlace(list, uname);
	list.unshift(uname);
	Session.def_players = list;
	return list;
}
function get_user_color() { return get_current_userdata().color; }
function get_user_names() { return Object.keys(DB.users); }
function get_current_userdata() { return DB.users[Session.cur_user]; }
function get_preferred_lang(uname) { return lookup(DB.users, [uname, 'lang']) ?? 'E'; }
function get_startlevel(user, game) { return lookup(DB.users, [user, 'games', game, 'startlevel']) ?? lookup(DB.games, [game, 'def_startlevel']) ?? 0; }
function set_preferred_lang(uname, val) { val = val.toUpperCase(); if ('EDSFC'.indexOf(val) >= 0) return lookupSetOverride(DB.users, [uname, 'lang'], val); }
function set_startlevel(user, game, val) { return lookupSetOverride(DB.users, [user, 'games', game, 'startlevel'], val); }
function get_elo(user, game) { return lookup(DB.users, [user, 'games', game, 'elo']) ?? 100; }
function get_winnerlist(game) { return lookupSet(DB.games, [game, 'winnerlist'], []); }
function set_elo(user, game, val) { lookupSetOverride(DB.users, [user, 'games', game, 'elo'], val); }
function reset_elo(user, game) { set_elo(user, game, 100); }
function reset_game_values_for_user(user) {
	let defaults = {
		'gul': { gSpotit: { startlevel: 0 }, gMaze: { startlevel: 0 }, gAnagram: { startlevel: 0 } },
		'nasi': { gSpotit: { startlevel: 0 }, gMaze: { startlevel: 0 }, gAnagram: { startlevel: 0 } },
		'felix': { gSpotit: { startlevel: 5 }, gMaze: { startlevel: 5 }, gAnagram: { startlevel: 3 } },
		'lauren': { gSpotit: { startlevel: 5 }, gMaze: { startlevel: 5 }, gAnagram: { startlevel: 5 } },
		'mimi': { gSpotit: { startlevel: 0 }, gMaze: { startlevel: 0 }, gAnagram: { startlevel: 0 } },
	};

	let norm = {};
	for (const g in DB.games) {
		norm[g] = { startlevel: DB.games[g].def_startlevel };
	}
	lookupSetOverride(DB.users, [user, 'games'], valf(defaults[user], norm));
}
function reset_game_values_for_all_users() { for (const uname in DB.users) { reset_game_values_for_user(uname); } }
function reset_winnerlist_for_game(game) { lookupSetOverride(DB.games, [game, 'winnerlist'], []); }
function reset_winnerlist_for_all_games() { for (const gname in DB.games) { reset_winnerlist_for_game(gname); } }
function reset_db_values() {
	reset_winnerlist_for_all_games();
	reset_game_values_for_all_users();
}
function load_user(name, display_ui = true) {
	//console.log('...load_user',name);
	//sets Session.cur_user and adds user if DB.users[name] does not exist
	//if show, also show_user() on screen
	//console.log('load_user',getFunctionsNameThatCalledThisFunction(),name);

	//if (user_already_loaded(name)) return DB.users[name];
	//console.log('no,user has NOT been loaded!',name);

	if (nundef(name)) name = 'guest';

	// make sure there are data in DB.users
	let udata = lookup(DB, ['users', name]);
	//console.log('found user in db? udata for',name,udata);
	if (!udata) udata = add_new_user({ name: name, color: randomColor(), motto: random_motto(), image: false, games: {}, tables: {} });

	Session.cur_user = name;
	if (!is_admin(name)) localStorage.setItem('user', name);
	if (display_ui) show_user(udata);

	if (name == 'mimi') show('dAdminButtons'); else hide('dAdminButtons');

	return udata;
}
//function save_users() { save_db('users'); }
//function save_tables() { save_db('tables'); }
// function save_db(key) {
// 	let txt = jsyaml.dump(DB[key]);
// 	to_server(txt, `save_${key}`);
// }
function show_user(user) {
	//where(user);
	//console.log('show user',user);
	mStyle(mBy('user_info'), { opacity: 1 });
	//mBy('user_info').style.opacity = 1;
	mBy("username").innerHTML = mBy('mini_username').innerHTML = user.name;
	mBy("motto").innerHTML = user.motto;

	let path = '../base/assets/images/' + (user.image ? user.name : 'unknown_user') + '.jpg';
	mBy("profile_image").src = mBy('mini_profile_img').src = path + (is_online() ? '?=' + Date.now() : '');
}
function sync_users(php_users) {
	//changes php_users in order to fit DB.users style (id=>name,hasImage=>image,motto needs to be added)
	let result = [];
	let changed = false;
	for (const udata of php_users) {
		if (nundef(udata.id)) return php_users;
		let name = udata.username;
		let u = DB.users[name];
		if (nundef(u)) {
			changed = true;
			let db_user = { name: name, color: randomColor(), motto: random_motto(), image: startsWith(udata.image, name), games: {}, tables: {}, };
			add_new_user(db_user, false);
			result.push(db_user);
		} else result.push(u)
	}
	if (changed) db_save(); //save_users();
	if (!is_online()) return result; //das ist wenn zu from_server von server_offline gegangen bin!

	//jetzt noch das umgekehrte: falls in db wer ist der NICHT in php_users ist, muss den zu sql db adden!

	let di = {}; php_users.map(x => di[x.username] = x);
	//console.log('di', di);
	let not_in_sql_db = [];
	for (const name in DB.users) {
		let u = DB.users[name];
		if (nundef(di[name]) && name != Session.cur_user) { not_in_sql_db.push(name); addIf(result, u); }
	}
	//console.log('not in sql', not_in_sql_db);
	if (!isEmpty(not_in_sql_db)) add_users_to_sql_db(not_in_sql_db);

	//console.log('result', result);
	return result;
}
function user_already_loaded(name) { return isdef(name && name == Session.cur_user); }

function close_mini_user_info() {
	//console.log('haaaaaaaaaaaaaaloooooooooooooo')
	setTimeout(() => {
		mBy('user_info_mini').style.display = 'none';
	}, 500);
	//mBy('mini_profile_img').style.visibility = 'hidden';
}
function open_mini_user_info() {
	//console.log('haaaaaaaaaaaaaaloooooooooooooo')
	setTimeout(() => {
		mBy('user_info_mini').style.display = 'flex';
	}, 500);

	//mBy('mini_profile_img').style.visibility = 'visible';

}
function toggle_mini_user_info() {
	//console.log('DA.left_panel:',DA.left_panel);
	if (nundef(DA.left_panel) || DA.left_panel == 'open') close_mini_user_info(); else open_mini_user_info();
}

//#endregion user




