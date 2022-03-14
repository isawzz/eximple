
function gSet() {
	function set_fen() {
		let items = Session.items;
		let fen = items.map(x => x.fen).join(',');
		//let goal = Goal.set.join(',');
		//fen += ':'+goal;
		return fen;
	}
	function set_prompt(g, fen) {
		//console.log('>>fen',fen);
		//build a set
		let [n, rows, cols] = [g.num_attrs, g.rows, g.cols];
		let all_attrs = gSet_attributes();
		let attrs_in_play = arrTake(get_keys(all_attrs), n);
		//console.log('current attributes:', attrs_in_play);

		let deck = g.deck = make_set_deck(n); // alle card fens
		shuffle(deck);

		let goal = Goal = { set: make_goal_set(deck, g.prob_different), cards:[] };
		//console.log(goal.set);

		//present the set
		let dCards = stdRowsColsContainer(dTable, cols, styles = { bg: 'transparent' }); //create a cards container
		let card_styles = { w: cols > 4 ? 130 : 160 };
		let items = g.items = [];

		let deck_rest = arrWithout(deck, goal.set);
		let fens = choose(deck_rest, rows * cols - 3);
		let all_fens = goal.set.concat(fens);
		shuffle(all_fens);

		if (isdef(fen)){all_fens = fen.split(',');}

		for (const f of all_fens) {
			let item = create_set_card(f, dCards, card_styles);
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = set_interact;
			if (Goal.set.includes(item.fen)) Goal.cards.push(item);
			items.push(item);
		}

		g.selected = [];
		return items;
	}
	function set_interact(ev) {
		//console.log('click');
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let id = evToId(ev);

		if (isdef(Items[id])) {
			let item = Items[id];
			//console.log('clicked card', id, item);
			toggleSelectionOfPicture(item, Session.selected);

			if (Session.selected.length == 3) {
				let correct = check_complete_set(Session.selected.map(x => x.fen));

				if (correct) {
					Selected = { isCorrect: true, feedbackUI: Session.selected.map(x => iDiv(x)) };
				} else {
					Selected = { isCorrect: false, correctUis: Goal.cards.map(x => iDiv(x)), feedbackUI: null, animation: 'onPulse1' };
				}

				set_eval();
			}
		}
	}
	function set_eval() {
		//console.log('evaluating move: was soll geschehen?')
		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		IsAnswerCorrect = Selected.isCorrect;

		race_set_fen();
		race_update_my_score(IsAnswerCorrect ? 1 : 0);

		//console.log('move ist correct?', IsAnswerCorrect ? 'JA!' : 'nope');
		let delay = show_feedback(IsAnswerCorrect);

		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			race_send_move();
		}, delay);

	}
	return {
		prompt: set_prompt,
		fen: set_fen,
	}
}

function gSpotit() {
	function spotit_fen() {
		let items = Session.items;

		console.log('items',items)

		//state in spotit game is just 'key key..., key key...'
		let fen = items.map(x => x.keys.join(' ')).join(',');

		//neu: 'k:s k:s...,k:s k:s...
		let item_fens = [];
		for (const item of items) {
			let arr = arrFlatten(item.pattern);
			let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
			item_fens.push(ifen);
		}

		fen = item_fens.join(',');
		return fen;
	}
	function spotit_prompt(g, fen) {
		g.items = spotit_deal(g.num_cards, g.rows, g.cols, g.vocab, g.lang, g.min_scale, g.max_scale, fen);
	}
	function spotit_interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
				//console.log('otherCard', otherCard);
				let cardSymbol = ev.target;
				let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
				//console.log('otherSymbol', otherSymbol);
				//mach die success markers auf die 2 symbols!
				Selected = { isCorrect: true, feedbackUI: [cardSymbol, otherSymbol] };

			} else {
				//console.log('fail!!!!!!!!'); //fail
				let cardSymbol = ev.target;
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: spotit_get_shared_symbols(), correctionDelay: Session.items.length * 1500 };

			}
			spotit_eval();
		}
	}
	function spotit_eval() {
		//console.log('evaluating move: was soll geschehen?')
		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		IsAnswerCorrect = Selected.isCorrect;

		race_set_fen();
		race_update_my_score(IsAnswerCorrect ? 1 : 0);

		//console.log('move ist correct?', IsAnswerCorrect ? 'JA!' : 'nope');
		let delay = show_feedback(IsAnswerCorrect);

		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			race_send_move();
		}, delay);

	}

	function spotit_card(info, dParent, cardStyles, onClickSym) {
		Card.sz=300;
		copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);

		// //let card_container = mDiv(dParent,{padding:20});
		// mStyle(dParent,{bg:'red',hmin:Card.sz+50});
		// let x = mDiv(dParent,{margin:20, w:200,h:200, bg:'white',fg:'black'},getUID(),'hallo','card',false);
		// return x;	

		let card = cRound(dParent, cardStyles, info.id);
		// return card;

		addKeys(info, card);

		let d = iDiv(card);
		//card.pattern = fillColarr(card.colarr, card.keys);

		//could make each pattern be object {key:card.key,scale:card.scale}
		//instead of line above do this to include scale in pattern!
		let zipped = [];
		//console.log(card.scales);
		for (let i = 0; i < card.keys.length; i++) {
			zipped.push({ key: card.keys[i], scale: card.scales[i] });
		}
		card.pattern = fillColarr(card.colarr, zipped);

		// symSize: abhaengig von rows
		let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };
		//console.log('sz',symStyles.sz,info.rows,info.cols);

		let syms = [];
		mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
		for (let i = 0; i < info.keys.length; i++) {
			let key = card.keys[i];
			let sym = syms[i];
			card.live[key] = sym;
			sym.setAttribute('key', key);
			sym.onclick = onClickSym;
		}

		return card;
	}

	function spotit_deal(numCards, rows, cols, vocab, lang, min_scale, max_scale, fen) {
		lang = valf(lang, 'E');
		let colarr = _calc_hex_col_array(rows, cols);

		//console.log('scales', min_scale, max_scale);

		//correction for certain perCard outcomes:
		if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; }
		else if (rows == 2 && cols == 1) { colarr = [1, 2]; }
		else if (rows == 4 && cols == 1) { rows = 3; colarr = [2, 3, 1]; }
		else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; }
		else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; }
		else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; }
		else if (rows == 6 && cols == 3) { rows = 5.8; colarr = [2, 4, 5, 4, 3]; }

		//from here on, rows ONLY determines symbol size! colarr is used for placing elements

		let perCard = arrSum(colarr);
		let nShared = (numCards * (numCards - 1)) / 2;
		let nUnique = perCard - numCards + 1;
		let numKeysNeeded = nShared + numCards * nUnique;
		let nMin = numKeysNeeded + 3;
		let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
		//console.log('keys', keypool);

		let keys = choose(keypool, numKeysNeeded);
		let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < numCards; i++) {
			let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < numCards; i++) {
			for (let j = i + 1; j < numCards; j++) {
				let c1 = infos[i];
				let c2 = infos[j];
				let dupl = dupls[iShared++];
				c1.keys.push(dupl);
				c1.shares[c2.id] = dupl;
				c2.shares[c1.id] = dupl;
				c2.keys.push(dupl);
				//each gets a shared card
			}
		}

		for (const info of infos) { shuffle(info.keys); }

		//for each key make a scale factor
		//console.log('min_scale',min_scale,'max_scale',max_scale);
		for (const info of infos) {

			// info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
			info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.25]));

			//chooseRandom([.5, .75, 1, 1.25]);
			//info.scales = info.scales.map(x=>coin()?x:-x);
		}

		//spotit fen muss ein string sein!
		if (!isEmpty(fen)) {
			let ks_for_cards = fen.split(',');
			for (let i = 0; i < infos.length; i++) {
				let info = infos[i];
				//console.log('vorher', jsCopy(info.keys), jsCopy(info.scales));
				let ks_list = ks_for_cards[i].split(' ');
				info.keys = ks_list.map(x => stringBefore(x, ':'));
				info.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
				//console.log('nachher', info.keys, info.scales);
			}
		}


		let items = [];
		for (const info of infos) {
			let item = spotit_card(info, dTable, { margin: 20 }, spotit_interact);
			//mStyle(iDiv(item), { animation: 'appear 1s ease' });
			items.push(item);
		}

		return items;

	}

	function spotit_get_shared_symbols() {
		let result = [];
		for (const item of Session.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	//#region future: verbessere die art wie symbols auf card verteilt (unused)
	function spotit_colarr_settings(num) {
		//from here on, 

		let di = {
			3: { rows: 2, colarr: [1, 2] },
			4: { rows: 2, colarr: [2, 2] },
			5: { rows: 2.5, colarr: [2, 3] },
			6: { rows: 3, colarr: [1, 2] },
			7: { rows: 3, colarr: [1, 2] },
			8: { rows: 3.2, colarr: [1, 2] },
			9: { rows: 2, colarr: [1, 2] },
			10: { rows: 2, colarr: [1, 2] },
			11: { rows: 2, colarr: [1, 2] },
			12: { rows: 2, colarr: [1, 2] },
			13: { rows: 2, colarr: [1, 2] },
			14: { rows: 2, colarr: [1, 2] },
			15: { rows: 2, colarr: [1, 2] },
		}



		let colarr = _calc_hex_col_array(rows, cols);

		//console.log('scales',min_scale,max_scale);

		//correction for certain perCard outcomes:
		if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; }
		else if (rows == 2 && cols == 1) { colarr = [1, 2]; }
		else if (rows == 4 && cols == 1) { rows = 3; colarr = [2, 3, 1]; }
		else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; }
		else if (rows == 3 && cols == 3) { rows = 3; cols = 3; colarr = [1, 3, 3, 1]; }
		else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; }
		else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; }

	}
	function spotit_deal_new_not_yet(numCards, rows, colarr, vocab, lang, min_scale, max_scale, fen) {
		//rows ONLY determines symbol size! colarr is used for placing elements
		lang = valf(lang, 'E');

		let perCard = arrSum(colarr);
		let nShared = (numCards * (numCards - 1)) / 2;
		let nUnique = perCard - numCards + 1;
		let numKeysNeeded = nShared + numCards * nUnique;
		let nMin = numKeysNeeded + 3;
		let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
		//console.log('keys', keypool);

		let keys = choose(keypool, numKeysNeeded);
		let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < numCards; i++) {
			let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < numCards; i++) {
			for (let j = i + 1; j < numCards; j++) {
				let c1 = infos[i];
				let c2 = infos[j];
				let dupl = dupls[iShared++];
				c1.keys.push(dupl);
				c1.shares[c2.id] = dupl;
				c2.shares[c1.id] = dupl;
				c2.keys.push(dupl);
				//each gets a shared card
			}
		}

		for (const info of infos) { shuffle(info.keys); }

		//for each key make a scale factor
		//console.log('min_scale',min_scale,'max_scale',max_scale);
		for (const info of infos) {

			// info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
			info.scales = info.keys.map(x => chooseRandom([.6, .75, 1, 1.25]));

			//chooseRandom([.5, .75, 1, 1.25]);
			//info.scales = info.scales.map(x=>coin()?x:-x);
		}

		//spotit fen muss ein string sein!
		if (!isEmpty(fen)) {
			let ks_for_cards = fen.split(',');
			for (let i = 0; i < infos.length; i++) {
				let info = infos[i];
				//console.log('vorher', jsCopy(info.keys), jsCopy(info.scales));
				let ks_list = ks_for_cards[i].split(' ');
				info.keys = ks_list.map(x => stringBefore(x, ':'));
				info.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
				//console.log('nachher', info.keys, info.scales);
			}
		}


		let items = [];
		for (const info of infos) {
			let item = spotit_card(info, dTable, { margin: 20 }, spotit_interact);
			//mStyle(iDiv(item), { animation: 'appear 1s ease' });
			items.push(item);
		}

		return items;

	}
	//#endregion

	return {
		prompt: spotit_prompt,
		fen: spotit_fen,
	}
}

function gMaze() {
	function maze_fen() { return 'nix'; }
	function maze_prompt(g, fen) {
		let [rows, cols, sz, gap] = [g.rows, g.cols, g.sz, g.gap];

		clear_graph();
		//console.log('rows',rows,'cols',cols);
		let maze = new MazeGraph(dTable, rows, cols, sz, gap);
		//console.log('maze', maze);
		setRectInt(maze.dGraph);

		mLinebreak(dTable, 12);

		//set content of start and goal cells
		let cellStart = maze.getTopLeftCell();
		mCellContent(iDiv(cellStart), { w: '60%', h: '60%', fz: '50%', padding: '5%', bg: 'green', fg: 'white', rounding: '50%' }, 'A');
		let cellGoal = maze.getBottomRightCell();
		mCellContent(iDiv(cellGoal), { w: '60%', h: '60%', fz: '50%', padding: '5%', bg: 'red', fg: 'white', rounding: '50%' }, 'B');

		let [roomFrom, roomTo] = [cellStart.nodeId, cellGoal.nodeId];

		if (isdef(fen)) {
			let instruction = mText('game over!', dTable, { fz: 24, display: 'inline-block' });
			return;
		}

		let instruction = mText('is there a path from A to B?', dTable, { fz: 24, display: 'inline-block' });
		mLinebreak(dTable);

		let path = maze.getShortestPathFromTo(roomFrom, roomTo);

		console.assert(path.length < Infinity, 'WAAAAAAAAAAAAAAS?');
		if (coin()) maze.cutPath(path, .5, .75);
		let len = maze.getLengthOfShortestPath(roomFrom, roomTo); //verify that no longer a path!!!!!

		let is_yes = len != Infinity;

		let byes = mButton('yes', (ev) => maze_eval(is_yes, ev), dTable, { fz: 20 }, ['donebutton', 'buttonClass']);
		let bno = mButton('no', (ev) => maze_eval(!is_yes, ev), dTable, { fz: 20 }, ['donebutton', 'buttonClass']);

		if (is_yes) { Goal = { b_correct: byes, b_wrong: bno, is_yes: true, maze: maze, path: path }; }
		else { Goal = { b_correct: bno, b_wrong: byes, is_yes: false, maze: maze, path: path }; }
		animatePropertyX(dTable, 'opacity', [0, 0, 1], 500, 'both', 'ease', 0);
	}
	function maze_eval(is_correct, ev) {

		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		let button_clicked = ev.target;
		//console.log(is_correct ? 'correct' : 'WRONG');

		race_set_fen();
		race_update_my_score(is_correct ? 1 : -1);

		let delay = maze_feedback(is_correct, button_clicked);
		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			race_send_move();
		}, delay);

	}

	function clear_graph() { if (nundef(Goal)) return; let cy = lookup(Goal, ['maze', 'cy']); if (cy) cy.destroy(); }
	function maze_feedback(is_correct, button_clicked, show_feedback = true) {
		let delay = !is_correct && show_feedback ? 1000 : 100;
		if (!is_correct) {
			mStyle(Goal.b_correct, { bg: 'green' });
			animate(Goal.b_correct, 'komisch', 1000);
			if (Goal.is_yes) Goal.maze.breadCrumbs(Goal.path); else Goal.maze.colorComponents();

		}
		if (is_correct) { mStyle(button_clicked, { bg: 'green' }); mCheckit(button_clicked, 100); }
		else { mXit(button_clicked); }

		return delay;
	}

	return {
		prompt: maze_prompt,
		fen: maze_fen, //function that again presents last game state! needed when game is over
	}
}

function gAnagram() {
	function anagram_fen() {
		return { key: Goal.key, lang: Goal.lang, inputs: collect_innerHTML(Goal.inputs, ':'), letters: collect_innerHTML(Goal.letters, ':') };
	}
	function anagram_prompt(g, fen) {

		//console.log('fen',fen);
		let [vocab, lang, min, max] = [g.vocab, isdef(fen) ? fen.lang : g.lang, g.minWordLength, g.maxWordLength];

		let keypool = KeySets[vocab];
		keypool = keypool.filter(x => { let w = Syms[x][lang]; let l = w.length; return w.indexOf(' ') < 0 && l >= min && l <= max; });

		//console.log('keypool', k1.map(x => Syms[x][lang])); console.log('lang', lang); return; //jeder hat jetzt sein language!

		let key = isdef(fen) ? fen.key : chooseRandom(keypool); //'carpentry saw'; 
		let pic = mSym(key, dTable, { fz: 100, opacity: g.hidden ? 0 : 1 });
		//console.log('pic', pic);
		if (g.hidden) {
			let d = pic;
			let r = getRect(d, dTable);
			let dHint = mDiv(dTable, { opacity: 0, position: 'absolute', align: 'center', left: 0, w: '100%', top: r.t + r.h / 2 }, null, 'category: ' + Syms[key].subgroup);
			animatePropertyX(dHint, 'opacity', [0, 0, 1], 2000, 'both', 'ease-in', 6000);
			//animatePropertyX(d,'opacity',[0,1],8000,'forwards','ease-out',16000);
		}

		let word = Syms[key][lang].toUpperCase();
		Goal = { div: pic, key: key, word: word, lang: lang };

		mLinebreak(dTable, 12);

		let wTotal = getRect(mBy('table')).w;
		Goal.inputs = show_letter_inputs(word, dTable, wTotal);

		mLinebreak(dTable, 12);
		Goal.letters = show_dd_click_letters(word, dTable, wTotal);

		if (isdef(fen) && isdef(fen.inputs)) {
			distribute_innerHTML(Goal.inputs, fen.inputs, ':');
			distribute_innerHTML(Goal.letters, fen.letters, ':');
		} else {
			mLinebreak(dTable, 12);
			Goal.bDone = mButton('Done!', anagram_eval, dTable, { fz: 28, matop: 10, rounding: 10, hpadding: 16, border: 8 }, ['buttonClass']);
		}
	}
	function anagram_eval() {

		if (!canAct()) return;
		uiActivated = false; clear_timeouts();

		let answer = collect_innerHTML(Goal.inputs);
		let is_correct = answer == Goal.word;

		let is_word;
		if (!is_correct && answer.length == Goal.word.length && is_a_word(answer.toLowerCase(), Session.lang)) is_word = true;

		Selected = { answer: answer, reqAnswer: Goal.word, feedbackUI: Goal.inputs.map(x => iDiv(x)) };

		race_set_fen();
		race_update_my_score(is_correct ? 1 : is_word ? 0 : -1);

		let delay = anagram_feedback(is_correct, is_word);
		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			race_send_move();
		}, delay);

	}
	function anagram_feedback(is_correct, is_word, show_feedback = true) {
		let delay = !is_correct && show_feedback ? 1000 : 300;
		let d = iDiv(Goal);
		mStyle(d, { opacity: 1 });
		if (!is_correct) {
			for (let i = 0; i < Goal.word.length; i++) {

				let ch = Goal.word[i];

				let dl = iDiv(Goal.letters[i]);
				dl.innerHTML = ch;
				animate(dl, 'onPulse1', 600);

				if (!is_word) {
					let dwrong = iDiv(Goal.inputs[i]);
					if (dwrong.innerHTML != ch) { mXit(dwrong, 90); }
				}
			}
		} else {
			mCheckit(d, 100);
		}
		return delay;
	}

	return {
		prompt: anagram_prompt,
		fen: anagram_fen, //function that again presents last game state! needed when game is over
	}
}





