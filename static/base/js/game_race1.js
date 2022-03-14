//#region racing games
function race_present_table(obj) {
	console.assert(isdef(obj.table), 'present_table_ without obj.table!!!!!!!!!!!!!!');
	if (obj.table.status != 'past') { update_table_options_for_user(Session.cur_user, obj.table.pl_options, obj.table.game); }

	update_session(obj); // updates Session.cur_table, Session.cur_players/me/others

	let table_status = Session.cur_table.status;
	//console.log('phase:',Session.cur_table.fen.phase);

	//console.log('______________', Session.cur_user, 'game update:\ntable status', Session.cur_table.status, '\nmy status', Session.cur_me.player_status);

	if (is_admin() && table_status == 'past') { in_game_off(); in_game_open_prompt_off(); status_message_off(); get_games(); return; }

	if (!in_game()) { open_game_ui(); in_game_on(); }

	let d = mBy('table'); d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 1000, easing: 'ease' });

	//race_reload_on();

	let my_status = Session.cur_me.player_status;

	let have_move = my_status == 'joined';
	if (!have_move) { if (!in_game_open_prompt()) race_open_prompt(Session.cur_me.state); }
	else if (!in_game_open_prompt()) { race_open_prompt(); in_game_open_prompt_on(); }
	else { uiActivated = true; }

	ui_game_stats(Session.cur_players); //ueber den cards soll ein panel sein mit all den spielern

	if (table_status != 'started') {
		stop_game();
		let winners = Session.winners = race_check_endcondition();
		if (!isEmpty(winners)) {
			stop_game();
			show_gameover_new(winners);
		}
	} else Session.scoring_complete = false;
}
function race_open_prompt(fen) {
	// ich weiss ja welche table, welches game, welcher user.....
	console.assert(!uiActivated, 'open_prompt_ with uiActivated ON !!!!!!!!!!!!!!!!!!!!!!!!!!');
	let g = update_game_values();
	clearTable(); set_background_color(g.color); //reset state
	QContextCounter += 1;

	show_game_name(g.friendly);
	show_title(g.table.friendly);
	show_level(g.level, g.maxlevel);
	//console.log('game',Session.cur_game,'Badges:',Session.is_badges?'yes':'no');
	if (Session.is_badges) g.level = setBadgeLevel(g.level, Session.cur_user, Session.cur_game, g.maxlevel);

	g.startTime = get_timestamp();
	mLinebreak(dTable, 15);

	Session.cur_funcs.prompt(g, fen);

	Selected = null;
	if (nundef(fen)) uiActivated = true;

}
function race_update_my_score(inc) {
	let me = Session.cur_me;
	me.score += inc;
	if (me.score >= Session.winning_score) me.player_status = 'done'; //*** player winning ****/

}
function race_check_endcondition() {
	let players = get_values(Session.cur_players);
	//console.log(players.map(x=>'score:'+x.score));
	//console.log('')
	let winners = players.filter(x => x.score >= Session.winning_score).map(x => x.name); //allCondDict(players, x => x.score >= Session.winning_score);

	return winners;

}
function race_set_fen() {
	let me = Session.cur_players[Session.cur_user];

	let fen = Session.cur_funcs.fen();
	//console.log('fen',fen);
	me.state = fen;

}

//#region misc legacy game helpers: (from game.js aus chatas: TODO: streamline code! was fuer eine API will ich?...)
function collect_innerHTML(arr, sep = '') { return arr.map(x => iDiv(x).innerHTML).join(sep); }
function distribute_innerHTML(arr, s, sep = '') {
	let letters = s.split(sep);
	for (let i = 0; i < letters.length; i++) {
		let d = iDiv(arr[i]);
		//console.log('d',d);
		let l = letters[i];
		if (l.length > 1) {
			//console.log('ja, letter ist mehr als 1 lang!!!');
			//unicode
			//l=`\u00c4`; //geht
			//l=`\u` + `${l.substring(1)}`; //geht nicht weil ich '\u' nicht in code schreiben kann!!!!!
			l = '&#x' + l.substring(3) + ';'; // geht!!!!
		}
		d.innerHTML = l; //etters[i];
	}
	return;

	let i = 0; arr.map(x => { iDiv(x).innerHTML = s[i]; if (i < s.length - 1) i++; });
}
function createLetterInputsX(s, dParent, style, idForContainerDiv) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyle(d1, style);
	}
	return d;
}
function blankInputs(d, ilist, blink = true) {
	let inputs = [];
	for (const idx of ilist) {
		let inp = d.children[idx];
		inp.innerHTML = '_';
		if (blink) mClass(inp, 'blink');
		inputs.push({ letter: Goal.word[idx].toUpperCase(), div: inp, index: idx });
	}
	return inputs;
}
function ipaddX(elem, role) {
	//role can be source,target,both,
	let isSource = role != 'target';
	let isTarget = role != 'source';
	if (isSource) elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		if (isTarget) elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		//console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			//second click
			if (isTarget) {
				if (source == elem) {
					console.log('INPUT');
					elem.innerHTML = '_';
				} else {
					elem.innerHTML = source.innerHTML;
				}

				toggleSelectionOfPicture(source);
				DA[aname] = null;
			}
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else {
					//if this is a letter
					//console.log('HAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOO')
					let is_letter = !isTarget;
					if (is_letter) {
						//console.log('LETTER');
						let l = elem.innerHTML;
						//find first available empty input element
						let inp_empty;
						for (const inp of Goal.inputs) {
							//console.log('inp', inp);
							let di = iDiv(inp);
							let inner = di.innerHTML;
							//console.log('inner', inner)
							if (iDiv(inp).innerHTML == '_') { inp_empty = inp; break; }
						}
						if (isdef(inp_empty)) iDiv(inp_empty).innerHTML = l;
					}
					DA[aname] = null;
				}
			}
		}
	}
	if (isSource) elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;

	DA.data_transport = null;
}
function ipaddX_v1(elem, role) {
	//role can be source,target,both,
	let isSource = role != 'target';
	let isTarget = role != 'source';
	if (isSource) elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		if (isTarget) elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		//console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			//second click
			if (isTarget) {
				if (source == elem) {
					console.log('INPUT');
					elem.innerHTML = '_';
				} else {
					elem.innerHTML = source.innerHTML;
				}

				toggleSelectionOfPicture(source);
				DA[aname] = null;
			}
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else {
					//if this is a letter
					//console.log('HAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOO')
					let is_letter = !isTarget;
					if (is_letter) {
						//console.log('LETTER');
						let l = elem.innerHTML;
						//find first available empty input element
						let inp_empty;
						for (const inp of Goal.inputs) {
							//console.log('inp', inp);
							let di = iDiv(inp);
							let inner = di.innerHTML;
							//console.log('inner', inner)
							if (iDiv(inp).innerHTML == '_') { inp_empty = inp; break; }
						}
						if (isdef(inp_empty)) iDiv(inp_empty).innerHTML = l;
					}
					DA[aname] = null;
				}
			}
		}
	}
	if (isSource) elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;

	DA.data_transport = null;
}
function ipaddX_orig(elem, role) {
	//role can be source,target,both,
	let isSource = role != 'target';
	let isTarget = role != 'source';
	if (isSource) elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		if (isTarget) elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		//console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			if (isTarget) { elem.innerHTML = source.innerHTML; toggleSelectionOfPicture(source); DA[aname] = null; }
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else { DA[aname] = null; }
			}
		}
	}
	if (isSource) elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;
	DA.data_transport = null;
}
function toggleSelectionOfPicture(pic, selectedPics, className = 'framedPicture') {

	//	console.log(pic)

	let ui = iDiv(pic);
	//if (pic.isSelected){pic.isSelected=false;mRemoveClass(ui,)}
	//console.log('pic selected?',pic.isSelected);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, className); else mRemoveClass(ui, className);

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}
function show_dd_click_letters(word, dTable, wTotal, gap = 4) {
	let wmax = wTotal / word.length;
	let fzMax = wmax - 3 * gap;
	fz = Math.min(60, fzMax);
	let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
	shuffle_children(dp);
	let letters = Array.from(dp.children);
	for (let i = 0; i < letters.length; i++) {
		let l = letters[i];
		l.setAttribute('draggable', true);
		ipaddX(l, 'source');
		l.id = 'letter' + i;
	}
	return letters;
}
function show_letter_inputs(word, dTable, wTotal, gap = 4) {
	let fzMax = wTotal / word.length - 3 * gap;
	let fz = Math.min(70, fzMax);
	let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: gap }); //,w:40,h:80,margin:10});
	let inputs = blankInputs(dpEmpty, range(0, word.length - 1), false);
	for (let i = 0; i < inputs.length; i++) {
		let l = iDiv(inputs[i]);
		ipaddX(l, 'both');
		mClass(l, 'dropzone');
		l.id = 'input' + i;
	}
	return inputs;
}


