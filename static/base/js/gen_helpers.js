function convert_from_server(obj) {
	//console.log('obj',obj)
	if (isdef(obj.table)) convert_from_row(obj.table);
	if (isdef(obj.playerdata)) {
		for (const row of obj.playerdata) {
			convert_from_row(row);
		}
	}
	if (isdef(obj.moves)) {
		for (const row of obj.moves) {
			convert_from_row(row);
		}
	}
}
function dachain(ms=0) { 
	console.log('TestInfo',TestInfo)
	if (!isEmpty(DA.chain) && !(TestInfo.running && TestInfo.step == true)) { 
		dachainext(ms);
	} else if (isEmpty(DA.chain)) console.log('DA.chain EMPTY '+ITER)
} 
function dachain_orig(ms=0) { 
	if (!isEmpty(DA.chain)) { 
		dachainext(ms);
	} else console.log('DA.chain EMPTY '+ITER)
} 
function dachainext(ms=0){
	let f = DA.chain.shift();
	//console.log('====>CHAINING: func',f.name);
	if (ms>0) TOMan.TO[getUID('f')]=setTimeout(f,ms); 
	else f(); 
}
function danext() { if (isdef(DA.next)) { let f = DA.next; DA.next = null; f(); } }
function dastaged(r,uname,ms=0) { 
	//autoselect a staged action
	if (!isEmpty(DA.staged_moves)) { 
		let action = DA.staged_moves.shift();

		//using 'meld' in staged moves:
		if (action == 'meld'){
			//need to meld a hand card
			//actions of this kind start with uname.hand
			let a = firstCond(r.actions,x=>startsWith(x,`${uname}.hand.`));
			if (!a) {console.log('staged action',action,'cannot be completed',r.actions);return;} else action = a;
		}
		//using 'draw' in staged moves:
		if (action == 'draw'){
			//need to draw from appropriate deck
			//actions of this kind start with draw.decks
			let a = firstCond(r.actions,x=>startsWith(x,`draw.decks.`));
			if (!a) {console.log('staged action',action,'cannot be completed',r.actions);return;} else action = a;
		}

		//console.log('f.name',f.name);
		if (ms>0) TOMan.TO[getUID('f')]=setTimeout(()=>autoselect_action(r,action,uname),ms); 
		else autoselect_action(r,action,uname); 
	} 
} 
function endit() { throw new Error("*** THE END ***"); }
function get_first_player(otree){return otree.player_names[0];}
function get_index_in_plorder(otree,uname){return otree.plorder.indexOf(uname);}
function get_num_players(otree) { return otree.player_names.length; }
function get_random_player_order(otree){let res=jsCopy(otree.player_names);shuffle(res);return res;}
function get_selected_ui_item(ev) {
	ev.cancelBubble = true;
	if (!canAct()) { console.log('no act'); return null; }
	uiActivated = false;
	let id = evToId(ev);
	//console.log('id',id)
	if (nundef(Items[id])) { return null; console.log('clicked on element') }
	let item = Items[id];
	return item;
}
function is_game_card(k){return isdef(Session.cards[k]);}
function is_it_my_turn(r, uname) { return r.uname == uname; }
function log_object(o,title) {console.log('___',getFunctionsNameThatCalledThisFunction(), isdef(title)?title:''); if (nundef(o)) {console.log('undefined');return;} let keys = get_keys(o); keys.sort(); for (const k of keys) { console.log('', k + ':', o[k]); } }
function log_objectX(o, props, msg) { console.log('___',getFunctionsNameThatCalledThisFunction(), msg); let keys = get_keys(o); keys.sort(); for (const k of props.split(' ')) { console.log('', k + ':', o[k]); } }

function next_task(otree, r) {
	//inc task pointer
	//console.log('next_task start:',otree.itask,otree.todo.map(x=>x.id),r.id);
	let i = otree.itask += 1;
	//if no more tasks in todo, move all of todo into history and start a new turn!
	let n_todo = otree.todo.length;
	if (i >= n_todo) {
		move_todo_to_history(otree);
		start_new_todo_list(otree, r);
	}
	//console.log('next_task ende:',otree.itask,otree.todo.map(x=>x.id),otree.todo[otree.itask].id);
}


function start_new_todo_list(otree, r) {
	let i_last = otree.plorder.indexOf(r.uname);
	let i_next = (i_last + 1) % otree.plorder.length;

	otree.todo = inno_todo_regular(otree, otree.plorder[i_next]);
}
function move_todo_to_history(otree) {
	otree.history = otree.history.concat(otree.todo);
}

function ui_player_info(players){
	let dParent = dPlayerStats;
	clearElement(dParent);
	mCenterFlex(dParent);
	// let dPanel = dParent; //mDiv(dParent, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	// mStyle(dPanel,{align:'center'});
	//mStyle(dParent,{align:'center'})
	let dPanel = mDiv(dParent, { display: 'flex', dir:'column'}); //, 'justify-content': 'center', 'align-items': 'space-evenly' });
	let items = {};
	for (const pl of players) {
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`; 
		let item = mDivItem(dPanel,{ bg:pl.color,margin:4,rounding:10 }, name2id(uname));
		// let item = mDivItem(dPanel,{ bg:'red',w:'100%',margin: 4, align: 'center' }, name2id(uname));
		let img = mImage(imgPath,iDiv(item),{w:50,h:50},'img_person');
		items[uname]=item;

		//or: (zweite version hat mehr info und stored auch das img in live)
		// let gi = gameItem(plname,pl.color);
		// let d = mDiv(dPanel, { margin: 4, align: 'center' }, gi.id);
		// let img = mImage(pl.imgPath,d,{w:50,h:50},'img_person');
		// iAdd(gi,{div:d,img:img});
		// items[plname]=gi;
	}
	return items;
}
function ui_present_stats(otree) {

	let players = otree.player_names;
	//console.log('players',players)
	let items = ui_player_info(players.map(x=>otree[x]));
	for (const uname of players) {
		let pl = otree[uname];
		let totals = inno_calc_visible_syms(pl.board, pl.splays);
		pl.totals = totals;
		let item = items[uname];
		let d = iDiv(item); mCenterFlex(d);mLinebreak(d);
		//d.onmouseenter = inno_show_other_player_info;
		//mStyle(d, { w: 120, mabottom: 20 });
		//let d1 = mDiv(d, { w: 100, matop: -10 }); mFlex(d1);
		for (const r in totals) {
			// inno_stat_sym(r, totals[r], d1, 20);
			inno_stat_sym(r, totals[r], d, 20);
		}
	}

	return items;
}

//#region base
function arrByClassName(classname,d){
	if (nundef(d)) d=document;
	return Array.from(d.getElementsByClassName(classname));
}










