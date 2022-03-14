function test8_mimi_hand_card_0_hover(){
	let hand = G.mimi.hand.items;
	let card = hand[0];
	mClass(iDiv(card),'hoverScale');

}
function test7_ari_anim_auto_deal(otree) {
	let deck = ui_make_random_deck(50);
	let market = ui_make_random_market(0); 
	mLinebreak(dTable);
	let hand1 = ui_make_random_hand(7); mStyle(hand1.container, { w: '50%' });
	let hand2 = ui_make_random_hand(7); mStyle(hand2.container, { w: '50%' });

	DA.qanim = [
		[anim_from_deck_to_marketX,[deck,market]],
		[anim_from_deck_to_marketX,[deck,market]],
	];
	anim_from_deck_to_marketX(deck, market);

}

function test6_ari_anim_auto_deal(otree) {
	let deck = ui_make_random_deck(50);
	let market = ui_make_random_market(0); 
	mLinebreak(dTable);
	let hand1 = ui_make_random_hand(7); mStyle(hand1.container, { w: '50%' });
	let hand2 = ui_make_random_hand(7); mStyle(hand2.container, { w: '50%' });

	top_card_to_market(deck, market);

}
function test5_ari_anim_deal_market(otree) {
	let deck = ui_make_random_deck(50);
	let market = ui_make_random_market(1); 
	mLinebreak(dTable);
	let hand1 = ui_make_random_hand(7); mStyle(hand1.container, { w: '50%' });
	let hand2 = ui_make_random_hand(7); mStyle(hand2.container, { w: '50%' });

	top_card_to_market(deck, market);

}
function test4_ari_deck_2_fixed_size_hands(otree) {
	let deck = ui_make_random_deck(10);
	mLinebreak(dTable);
	let hand1 = ui_make_random_hand(1); mStyle(hand1.container, { w: '50%' });
	let hand2 = ui_make_random_hand(1); mStyle(hand2.container, { w: '50%' });

	let d = iDiv(deck.topmost);
	top_card_to_hands_abwechselnd(deck, hand1, hand2);

}
function test3_ari_deck_2_hands(otree) {
	let deck = ui_make_random_deck(10);
	//mLinebreak(dTable);
	let hand1 = ui_make_random_hand(1);
	let hand2 = ui_make_random_hand(1);

	let d = iDiv(deck.topmost);
	top_card_to_hands_abwechselnd(deck, hand1, hand2);

}
function top_card_to_hands_abwechselnd(deck, hand1, hand2) {
	DA.hand = hand1;
	deck.items.map(x => {
		mStyle(iDiv(x), { cursor: 'pointer' });
		iDiv(x).onclick = () => {
			anim_from_deck_to_handX(x, deck, DA.hand);
			DA.hand = DA.hand == hand1 ? hand2 : hand1;
		}
	});

}
function top_card_to_market(deck, market) {
	deck.items.map(x => {
		mStyle(iDiv(x), { cursor: 'pointer' });
		iDiv(x).onclick = () => {
			anim_from_deck_to_marketX(x, deck, market);
		}
	});

}
function test2_ari_deck_and_hand(otree) {
	let deck = ui_make_random_deck(10);
	//mLinebreak(dTable);
	let hand = ui_make_random_hand(1);

	let d = iDiv(deck.topmost);

	deck.items.map(x => { mStyle(iDiv(x), { cursor: 'pointer' }); iDiv(x).onclick = () => anim_from_deck_to_hand(x, deck, hand); });

}

function test1_ari_10cards(otree) {
	let n = 10;
	let list = choose(get_keys(Aristocards), n);
	let items = list.map(x => ari_get_card(x));

	let cont = ui_make_deck_container(n, dTable, { bg: 'random', padding: 4 });

	let topmost = ui_add_cards_to_deck_container(cont, items, list);
	iDiv(topmost).onclick = () => anim_toggle_face(topmost);
}

function test0_ari_flip_one_card() {
	//present a card, say, QHb
	let c = ari_get_card('QHo');
	mAppend(dTable, iDiv(c));
	face_down(c);
	iDiv(c).onclick = () => anim_toggle_face(c);

}


//#region test end screen 
async function test_start_test_user_endscreen() {
	console.log('na geh'); //return;
	let fen = "felix:20,amanda:14,mimi:13,gul:12";

	//how do I get DB?
	DB = await route_path_yaml_dict('./DB.yaml');
	console.log('DB', DB);

	present_non_admin_user('gul');
}




//#bg unit tests!
function test_timestep_js_vs_php() {
	console.log('js', get_timestamp());
	to_server({}, 'timestamp_test');
}
function test4_load_games() {

}
function test3_game_options() {
	present_game_options();
	close_sidebar();
}
function test2_show_contacts() {
	get_login();
}
function test1_change_user() {
	setTimeout(() => {
		mStyle(mBy('user_info'), { opacity: 0 });
		setTimeout(() => {
			let name = chooseRandom(get_user_names(), x => x != Session.cur_user);
			load_user(name);
		}, 1000);
	}, 2000)
}

function test0_load_user() {
	let user = load_user(queryStringToJson().user);
}
//coole user transition!


async function test9_only_syms(l) {
	let text = await route_path_text(`../base/assets/words/${l}dict.txt`);
	let picdi = await route_path_yaml_dict(`../base/assets/words/${l}picdict.yaml`);
	let syms = await route_path_yaml_dict(`../base/assets/allSyms.yaml`);
	let keys = Object.keys(syms);
	let lang = l.toUpperCase();
	//are there l words that are in syms but not in picdi
	let res = keys.filter(x => isdef(syms[x][lang]) && nundef(picdi[syms[x][lang].toLowerCase()]));
	console.log('only syms: lang', l, res.map(x => syms[x][lang]));

}
async function test8_multiple_wordlists() {
	for (const l of ['e', 'd', 's', 'f']) {
		for (let i = 3; i < 15; i++) {
			let res = await test7_letters_200from(l, i);
			let s = `${l} >=${i} ${res.all.length} (davon: ${res.pic.length} ${Math.round((res.pic.length / res.all.length) * 100)}%)`;

			console.log('', s);
			console.log('result', res.sel)
			//console.log('result',l,n,result.length,'(davon pics:',result2.length,') '+ Math.round((result2.length/result.length)*100) + '%');
		}
		console.log('________');
	}

}
async function test7_letters_200from(l, n) {
	let text = await route_path_text(`../base/assets/words/${l}dict.txt`);
	let picdi = await route_path_yaml_dict(`../base/assets/words/${l}picdict.yaml`);
	let splitter = l == 'e' ? '\r\n' : '\n';
	let words = text.split(splitter);
	let result = words.filter(x => x.length >= n);
	let result2 = result.filter(x => x in picdi);
	result2.sort((a, b) => a.length - b.length);
	result3 = arrTake(result2, 200);
	return { all: result, pic: result2, sel: result3 };
}

async function test6_multiple_wordlists() {
	for (const l of ['e', 'd', 's', 'f']) {
		for (let i = 3; i < 15; i++) {
			let res = await test5_letters_upto(l, i);
			let s = `${l} ${i} ${res.all.length} (davon: ${res.pic.length} ${Math.round((res.pic.length / res.all.length) * 100)}%)`;
			console.log('', s);
			//console.log('result',l,n,result.length,'(davon pics:',result2.length,') '+ Math.round((result2.length/result.length)*100) + '%');
		}
		console.log('________');
	}

}

async function test5_letters_upto(l, n) {
	let text = await route_path_text(`../base/assets/words/${l}dict.txt`);
	let picdi = await route_path_yaml_dict(`../base/assets/words/${l}picdict.yaml`);
	let splitter = l == 'e' ? '\r\n' : '\n';
	let words = text.split(splitter);
	let result = words.filter(x => x.length >= 3 && x.length <= n);
	let result2 = result.filter(x => x in picdi);
	return { all: result, pic: result2 };
}

async function test4_multiple_wordlists() {
	for (const l of ['e', 'd', 's', 'f']) {
		for (let i = 6; i < 15; i++) {
			let res = await test3_letters(l, i);
			let s = `${l} ${i} ${res.all.length} (davon: ${res.pic.length} ${Math.round((res.pic.length / res.all.length) * 100)}%)`;
			console.log('', s);
			//console.log('result',l,n,result.length,'(davon pics:',result2.length,') '+ Math.round((result2.length/result.length)*100) + '%');
		}
		console.log('________');
	}

}

async function test3_letters(l, n) {
	let text = await route_path_text(`../base/assets/words/${l}dict.txt`);
	let picdi = await route_path_yaml_dict(`../base/assets/words/${l}picdict.yaml`);
	let splitter = l == 'e' ? '\r\n' : '\n';
	let words = text.split(splitter);
	let result = words.filter(x => x.length == n);
	let result2 = result.filter(x => x in picdi);
	return { all: result, pic: result2 };
}

function test2_pic_dicts() {
	create_pic_dicts(['d']);
}

function test1_open_sidebar() {
	//console.log('test1_open_sidebar loaded!')
	mBy('b_test').onclick = open_sidebar;
}
function test0_turn_loader_off() {
	mClassReplace(mBy('loader_holder'), 'loader_off');
}



//#region chatas tests
function testColarrVersions() {
	let tests = [[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [6, 3]];
	for (let i = 0; i < 50; i++) {
		//for (const t of tests) {
		let [rows, cols] = [randomNumber(1, 10), randomNumber(1, 10)];
		//let [rows, cols] = t; 
		let carr1 = _calc_hex_col_array(rows, cols);
		let carr2 = _calc_hex_col_arrayNew(rows, cols);
		let even = (rows % 2) == 0;
		console.log('rows', rows, (even ? 'even' : 'odd'), 'cols', cols, '\nold', carr1, '\nnew', carr2);
		console.assert(even || sameList(carr1, carr2), 'FEHLER!!!!!!!!!!!!!!!!!!');
	}
}

function testSpotit() {

	//prompt for 2 cards gesamter ablauf!
	let [rows, cols, numCards, setName] = [3, 2, 3, 'animals'];
	let infos = spotitDeal(rows, cols, numCards, setName); //backend
	//items.map(x => console.log('item.keys', x.keys));

	//frontend
	let items = [];
	for (const info of infos) {
		let item = spotitCard(info, dTable, { margin: 10 }, spotitOnClickSymbol);




		items.push(item);
	}
	return;
	for (const item of items) {
		//shared symbol shouldn't be same size as on the other card!

		for (const k in item.shares) {
			let other = Items[item.shares[k]];
		}
	}
}


function testCardContent0(card) {

	//console.log('card',card); return;
	let dCard = iDiv(card);
	mRows(dCard, spotItPattern(5, 2), { sz: Card.sz / 6, fg: 'random', hmargin: 8, vmargin: 4 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, spotItPattern(5, 2), { sz: Card.sz / 8, fg: 'random', margin: 6 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, cardPattern(13, 'spade suit'), { sz: Card.sz / 8, fg: 'random', margin: 6 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, [['frog', 'frog', 'frog'], ['frog', 'frog'], ['frog', 'frog', 'frog']], { sz: Card.sz / 6, fg: 'random' }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	//mRows(dCard,['dasf rog','der frog','die frog']); return;
	mRows(dCard, [['frog', 'frog', 'frog'], ['frog', 'frog'], ['frog', 'frog', 'frog']], { sz: Card.sz / 5, fg: 'random' }, { 'justify-content': 'center' }, { 'justify-content': 'space-evenly' }); return;
	mSym('frog', dCard, {}, 'cc'); return;
	mRows(iDiv(card), [[['frog', 3], 'HALLO', 'bee'], ['frog', 'HALLO', 'bee'], ['frog', 'HALLO', 4, 'bee'], 'ja das ist es!']);
	//cardRows(card,[['frog','HALLO','bee'],['frog','HALLO','bee'],['frog','HALLO','bee']]);
	return;

	let d = iDiv(dCard, { display: 'flex', dir: 'column', h: '100%', 'justify-content': 'center' }, 'dOuter');
	return;

	for (const arr of rows) {
		let dCol = mDiv(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
		for (const c of arr) {
			let dc;
			if (isdef(Syms[c])) {
				dc = mDiv(dCol, { fg: 'black' });
				ds = mSym(dc, dCol, { sz: Card.sz / 5, fg: 'random' });
			} else {
				dc = mDiv(dCol, { fg: 'black' }, null, c);
			}
		}
	}
}
function testInnoMain() {
	mStyle(dTable, { gap: 10, pabottom: 150 });

	for (const k in Cinno) {
		if (isdef(Cinno[k].expansion)) cardInno(dTable, k);
	}
}
function testInnoCardPhantasie() {

	dTable = mDiv(mBy('wrapper'), { position: 'absolute', padding: 10, w: '100vw', h: '100vh', bg: 'white' });

	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { fg: 'black', bg: INNO.color.red, w: Card.sz, h: Card.sz * .65 });
	let [dCard, sz, szTitle, gap] = [iDiv(card), Card.sz / 4, 24, 8];

	let [dTitle, dMain] = cTitleArea(card, 32);
	let d = mAddContent(dTitle, 'MetalWorking', { bg: INNO.sym.tower.bg, fg: 'white', h: 32, fz: 23, align: 'center', position: 'relative' });
	mAddContent(d, '5', { float: 'right', hpadding: 10 });
	let s = mSym(INNO.sym.tower.key, d, { h: 22, fg: INNO.sym.tower.fg }, 'cl');

	let margin = 20;
	innoSym('leaf', dMain, sz, 'tl', margin);
	innoSym('crown', dMain, sz, 'bl', margin);
	innoSym('leaf', dMain, sz, 'bc', margin);
	innoSym('leaf', dMain, sz, 'br', margin);

	let box = mBoxFromMargins(dMain, 0, margin, sz + margin, sz + margin); //,{bg:'grey',alpha:.5, rounding:10});
	let text = 'I demand if you get [tower] or [crown], immediately switch to age [2]. aber ich hab ja gott sei dank zeit! denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let t2 = innoText(text);
	mFillText(t2, box);

	return;


	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'tl');
	s = mSym('white-tower', box, { sz: sz * .75, fg: 'silver' }, 'cc');
	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'bl');
	s = mSym('frog', box, { sz: sz * .75, fg: 'silver' }, 'cc');

	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'bc');
	s = mSym('maple-leaf', box, { sz: sz * .75, fg: 'silver' }, 'cc');
	// box = mDiv(dMain,{w:sz,h:sz,bg:'grey',alpha:.5, rounding:10}); mPlace(box,'bc');
	// text = 'lorem ipsum bla bla bla denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	// mFillText(text,box);

	box = mDiv(dMain, { w: sz, h: sz, bg: 'grey', alpha: .5, rounding: 10 }); mPlace(box, 'br');
	text = 'denn wenn es nicht geht und ich bin muede dann halt nicht!';
	mFillText(text, box);

	box = mBoxFromMargins(dMain, 4, 4, sz + 8, sz + 10); //,{bg:'grey',alpha:.5, rounding:10});
	text = 'das muss jetzt ein viel laenderer text sein. aber ich hab ja gott sei dank zeit! denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	mFillText(text, box);


	return;

	//mPlaceText(text,where,dParent,styles,classes)
	text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [szTitle, 10, sz + gap, sz + gap], d, { fg: 'dimgrey' }, { bg: 'beige', border: '1px solid grey', rounding: 10 });

	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [sz, sz, 'bl'], d, { fg: 'dimgrey', bg: 'pink', rounding: 10, border: '5px solid pink' });


	let x1 = mSym('crow', d, { w: sz, h: sz, fg: 'green' }, 'br');

	x1 = mSym('abacus', d, { w: sz, h: sz }, 'bc');

	//mPlaceText(text,where,dParent,styles,classes)
	box = mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue', bg: 'orange', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testRectanglesW1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { w: Card.sz, h: Card.sz * .8 });
	let [d, sz, szTitle, gap] = [iDiv(card), Card.sz / 4, 24, 8];


	//mPlaceText(text,where,dParent,styles,classes)
	let text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [szTitle, 10, sz + gap, sz + gap], d, { fg: 'dimgrey' }, { bg: 'beige', border: '1px solid grey', rounding: 10 });

	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [sz, sz, 'bl'], d, { fg: 'dimgrey', bg: 'pink', rounding: 10, border: '5px solid pink' });


	let x1 = mSym('crow', d, { w: sz, h: sz, fg: 'green' }, 'br');

	x1 = mSym('abacus', d, { w: sz, h: sz }, 'bc');

	//mPlaceText(text,where,dParent,styles,classes)
	box = mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue', bg: 'orange', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testRectanglesTextInBoxesW0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { w: Card.sz, h: Card.sz * .8 });
	let [d, sz, szTitle, gap] = [iDiv(card), Card.sz / 4, 24, 8];


	let box = mBoxFromMargins(d, szTitle, 10, sz + gap, sz + gap);
	let r = mMeasure(box);
	text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz, fg: 'black',
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);

	//jetzt mach ein echo mit demselben text
	box = mDiv(d, { w: sz, h: sz });
	mPlace(box, 'bl');
	r = mMeasure(box);
	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	[fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	dText = mDiv(box, {
		w: w, h: h, fz: fz, fg: 'black',
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);


	//mPlaceText(text,where,dParent,styles,classes)
	mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue' }, { bg: 'orange', border: '1px dashed red', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testPositionCardSym() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 5;

	let x1 = mSym('crow', d, { w: sz, h: sz, bg: 'random' }, 'cc'); console.log('\nx1', x1);
}
function testPosition3() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 5;

	let x1 = mShapeR('hex', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2); mPlace(x2, p, 20);
	}

}
function testPositionPatterns() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 5;

	let x1 = mShapeR('hex', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p, p.includes('c') ? 0 : 20);
	}

}
function testPositionPatterns1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 5;

	let x1 = mShapeR('circle', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tr', 'bl', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p, 20);
	}
	for (const p of ['tc', 'cl', 'cc', 'cr', 'bc']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p);
	}

}
function testPositionShapeR0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 4;
	let x1 = mShapeR('triup', d, { sz: sz, bg: 'random' }); console.log('\nx1', x1);
	mPlace(x1, 'tl');

	let x2 = mShapeR('hex', d, { sz: sz, bg: 'random' }); console.log('\nx1', x2);
	mPlace(x2, 'tr');

	let x3 = mShapeR('triangle', d, { sz: sz, bg: 'random' }); console.log('\nx1', x3);
	mPlace(x3, 'br');

	let x4 = mShapeR('hexFlat', d, { sz: sz, bg: 'random' }); console.log('\nx1', x4);
	mPlace(x4, 'bl');


}
function testKartePositionSuit() {
	//stress test: for (let i = 0; i < 100; i++) { testKartePositionSuit(); }

	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 6;

	//alles auf einmal:
	let s1 = mSuit('Herz', d, { sz: sz }, 'tc'); //console.log('s1', s1);
	let s2 = mSuit('Herz', d, { sz: sz }, 'cr'); //console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: sz }, 'bc'); //console.log('s3', s3);
	let s4 = mSuit('Herz', d, { sz: sz }, 'cl'); //console.log('s4', s4);
	let s5 = mSuit('Pik', d, { sz: sz * 2 }, 'cc'); //console.log('s5', s5);

	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'tl'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'tr'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'bl'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'br'); //console.log('s5', s5);

}
function testKarteSizing() {
	mStyle(dTable, { gap: 10 }); let card;
	card = cBlank(dTable);
	let d = iDiv(card);
	let sz = Card.sz;

	//1. produce html elements: prefab
	let arr = [];
	let suit = mSuit('Pik');  // das ist ein prefab
	let triangle = mShape('triangle', null, { bg: 'red' }); //, w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	let sym = mSym('frog');
	let shape = mShape('test1');
	let x = mShapeR(); //console.log('\nx', x); mAppend(d, x);return;

	//2. size the elements: which ones can be sized and how?
	//size a suit? simply set h
	let h = sz / 4;

	suit.setAttribute('height', h);//size a mSuit

	mStyle(sym, { fz: h * .75 });// 88 75 size a mSym: use magic number .75
	mSize(shape, h * .75); //size a mShape: use magic number .75
	mSize(triangle, h * .75); //yes!
	mStyle(x, { w: h * .75 }); mClassReplace(x, 'weired1');
	//mSize(x,h*75);

	arr = [triangle, suit, sym, shape, x];
	// console.log('suit',suit,'\nsym',sym,'\nshape',shape,'\nx',x,'\ntriangle',triangle);
	//console.log('\nx', x);

	//mAppend(d, x); return;
	for (const x of arr) { mAppend(d, x); }
	gSizeToContent(suit);
	// resizeSvg(suit);
	//suit is ein svg element
	//suit.style.backgroundColor = 'blue';

	//mAppend(iDiv(card),suit);

}

//******************************** more tests *************************** */
function testKartePositionSuitOuterCenters() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 4;

	//alles auf einmal:
	let s1 = mSuit('Pik', d, { sz: 60 }, 'tc'); console.log('s1', s1);
	let s2 = mSuit('Karo', d, { sz: 60 }, 'cr'); console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: 60 }, 'bc'); console.log('s3', s3);
	let s4 = mSuit('Treff', d, { sz: 60 }, 'cl'); console.log('s4', s4);

}
function testKartePosition2() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 4;

	//alles auf einmal:
	let s1 = mSuit('Pik', d, { sz: 25 }, 'tl'); console.log('s1', s1);
	let s2 = mSuit('Karo', d, { sz: 50 }, 'tr'); console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: 75 }, 'bl'); console.log('s3', s3);
	let s4 = mSuit('Treff', d, { sz: 100 }, 'br'); console.log('s4', s4);

}
function testKartePosition1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz / 4;

	// let s = mSuit('Karo', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s, { top: 0, right: 0, position: 'absolute' });

	// let s1 = mSuit('Treff', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s1, { top: 100, right: -10, position: 'absolute' });

	// let s2 = mSuit('Pik', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s2, { top: 200, right: getSuitOffset(sz), position: 'absolute' });


	//produce+attach, size, position TL:
	let s3 = mSuit('Pik', d); mSuitSize(s3, 30); mSuitTL(s3); console.log('s3', s3);

	//produce+attach, size, position BR:
	let s4 = mSuit('Treff', d); mSuitSize(s4, 30); mSuitPos(s4, 'bottom', 'right'); console.log('s4', s4); //fail!
	//mStyle(s4,{right:0,bottom:0,position:'absolute'});

	let s5 = mSuit('Herz', d, { sz: 30 }); mSuitPos(s5, 'bottom', 'left'); console.log('s5', s5); //fail!
	let s6 = mSuit('Karo', d, { sz: 30 }); mSuitPos(s6, 'top', 'right'); console.log('s6', s6); //fail!



	//let s1=mSuit('Herz',d,{h:sz}); mSuitRight(s1); //	mSuitBottom(s1);
	//mStyle(s1,{right:0,position:'absolute'});
	//mSuitLeft(s,sz); ok
	//mSuitSize(suit2,sz); NOOOOOOOOOOOOOOO
	//mSuitLeft(suit2,sz);
	return;

	console.log('suit', suit);
	mPos(suit, 0, 0); // ja, geht
	mPos(suit1, -10, Card.h - sz); //so geht es! mit -10 kann ich es an den rand schieben, works with Card.sz/4=75 also 
	//sz*10/75 
	//wieviel prozent ist 10 von 75? 10 / (75/100) ... 1000/75? YES! 13.3
	mPos(suit1, -10 * sz / 100, Card.h - sz); //JA das ist perfect!!!!!
	//bei Card.sz=300 ist 
	//mStyle(suit1,{left:0,top:`calc( 100% - ${sz}px )`,position:'absolute'}); // ja seems to work!
	//mStyle(suit1,{left:0,top:`calc( 100% - ${sz}px )`,position:'absolute'}); // ja seems to work!
	//position:


}
function testKarte0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = Card.sz;

	let suit = mSuit('Pik', d, { h: 300 });  // nope, brauch setAttribute in suit
	let p = suit.firstChild;
	console.log('p', p);
	console.log('child', p.firstChild);

}
function testKarte8() {
	for (let i = 0; i < 1; i++) {
		testKarte7();
	}
}
function testKarte6() {
	for (let i = 0; i < 10; i++) {
		let n = i * 15; // 10*randomNumber(2,25);
		let x = mShapeR('triup', dTable, { sz: n, bg: 'random' }); console.log('\nx', x); mAppend(dTable, x);
	}


}
function testKarte5() {
	for (let i = 0; i < 10; i++) {
		let n = i * 15; // 10*randomNumber(2,25);
		let x = mShapeR(); console.log('\nx', x);
		mStyle(x, { w: n }); mClassReplace(x, 'weired' + (n > 120 ? 8 : n > 80 ? 5 : n > 50 ? 3 : 1));
		mAppend(dTable, x);
	}
}
function testKarte4() {
	mStyle(dTable, { gap: 10 }); let card;
	card = cBlank(dTable);
	let d = iDiv(card);
	let sz = Card.sz;

	//1. produce html elements: prefab
	let arr = [];
	let suit = mSuit('Pik');  // das ist ein prefab
	let triangle = mShape('triangle', null, { bg: 'red' }); //, w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	let sym = mSym('frog');
	let shape = mShape('test1');

	let x = mShapeX98(); console.log('\nx', x); mAppend(d, x);

	return;
	//2. size the elements: which ones can be sized and how?
	//size a suit? simply set h
	let h = sz / 4;
	suit.setAttribute('height', h);//size a mSuit
	mStyle(sym, { fz: h * .75 });// 88 75 size a mSym: use magic number .75
	mSize(shape, h * .75); //size a mShape: use magic number .75
	mSize(triangle, h * .75); //yes!
	// mStyle(x, { w: h*.75 });
	//mSize(x,h*75);




	arr = [triangle, suit, sym, shape, x];
	// console.log('suit',suit,'\nsym',sym,'\nshape',shape,'\nx',x,'\ntriangle',triangle);
	console.log('\nx', x);

	mAppend(d, x); return;

	for (const x of arr) { mAppend(d, x); }
	gSizeToContent(suit);
	//suit is ein svg element
	//suit.style.backgroundColor = 'blue';

	//mAppend(iDiv(card),suit);

}
function testKarte3_svg() {
	mStyle(dTable, { gap: 10 }); let card;

	//card = cBlankSvg(dTable);
	//immer noch brauch ich die Jack,King,Queen,back,Joker vielleicht
	//console.log('card', card);

	card = cBlankSvg(dTable);

	console.log('card', card); //mClass(iDiv(card),'hoverScale')
	let g = iG(card); console.log('g', g);

	//1 produce
	let x = mgSuit('Pik'); console.log('x', x);
	//2 attach
	//mAppend(iG(card),x);
	//3 size
	mgSize(x, Card.sz / 2);
	//4 position
	mgPos(card, x); //,50,50);
	//mgPos(x,)



	//let x = cSuitTR(card, 'Treff');
	//console.log('x',x);
	//let x=mSuit(iDiv(card),'Pik',100,50,50);
	//let d=iDiv(card);

	// let c2 = Card52.get('HQ', Card.sz); mAppend(dTable, iDiv(c2)); //console.log('c2', iDiv(c2)); 
	// let c3 = Card52.get('CQ', Card.sz); mAppend(dTable, iDiv(c3));
	// c3 = Card52.get('DQ', Card.sz); mAppend(dTable, iDiv(c3));
	// c3 = Card52.get('SQ', Card.sz); mAppend(dTable, iDiv(c3));
}
function testKarte2() {
	//let x=mDiv(dTable,{bg:'random',w:70,h:110,rounding:20}); return;
	//let c=cBlank(dTable);	console.log('card',c);
	let card = cLandscape(dTable);
	let isLandscape = card.w > card.h;
	let sz = card.sz; // min of w,h of card
	console.log('sz', sz)
	let text = 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!';

	//place a red triangle in top left corner
	let d = iDiv(card);
	let sh = [
		{ type: 'html', pos: 'TL', sz: 's', content: `<div class="weired"></div>` },
		{ type: 'html', pos: 'TR', sz: 's', content: `<div class="weired" style="--b:linear-gradient(red,blue);"></div>` },
		{
			type: 'html', pos: 'BL', sz: 's', content: `<div class="weired" style=
		"--b:conic-gradient(green,pink,green);
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`},
		{
			type: 'html', pos: 'BR', sz: 's', content: `<div class="weired" style=
		"--b:url(../assets/images/felix.jpg) center/cover;
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`},
		{ type: 'text', pos: 'CC', sz: 'l', content: 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!' },
	];

	//type: html,DOM,text,shape,sym
	//size: xs,s,m,l,xl oder zahl (pixel)
	var SZ = sz;
	var GAP = SZ * .1;
	var SIZE = { xs: SZ / 8, s: SZ / 4, m: SZ / 2, l: SZ * 2 / 3, xl: SZ };
	//pos: TL TC TR CL CC CR BL BC BR dann noch TL2 TC2 TR2 BL2 BC2 CR2
	var POS = { TL: { top: GAP, left: GAP }, TR: { top: GAP, right: GAP }, BL: { bottom: GAP, right: GAP }, BR: { bottom: GAP, right: GAP } };
	//kann auch combi von szpos: TL

	for (const sh1 of sh) {
		// let pos = sh1.pos;
		// let size = SIZE[sh1.size];

		// if (pos[0]=='C'){
		// 	//element has to be centered vertically
		// 	//width of element = size
		// 	//height of element = isLandscape?size
		// }

		// let [w,h]=pos == 'CC'?isLandscape?[SIZE[size],SIZE[size]]
		// let content = sh1.content;
		// let type=sh1.type;
		// let x=type=='html'?createElementFromHtml(t)
		// :type =='text'?
		// switch(sh1.type){
		// 	case 'html':
		// }
		let t = sh1.content;
		x = isString(t) ? t[0] == '<' ? createElementFromHtml(t) : makeText(t, sz, sz / 2) : t;
		mAppend(d, x);
		let pos = sh1.pos;
		if (pos != 'CC') {
			mStyle(x, { w: 80 });
			window['mPos' + sh1.pos](x, 10);
		}

	}

}
function testKarte1() {
	//let x=mDiv(dTable,{bg:'random',w:70,h:110,rounding:20}); return;
	//let c=cBlank(dTable);	console.log('card',c);
	let card = cLandscape(dTable);
	let sz = card.sz; // min of w,h of card
	console.log('sz', sz)

	//place a red triangle in top left corner
	let d = iDiv(card);
	let x = mShape('triangle', d, { bg: 'blue', w: sz / 4, h: sz / 4, position: 'absolute', top: 10, left: 10 });
	x = mShape('test1', d, { bg: 'red', w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	x = mSym('bee', d, { fz: sz / 5, position: 'absolute', bottom: 10, right: 10 });
	x = mDiv(d, { bg: YELLOW, w: sz / 4, h: sz / 4, position: 'absolute', top: 10, right: 10 }, null, null, 'triangle');

	//mStyle(d,{align:'center'});
	let text = 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!';
	let [fz, w, h] = fitFont(text, 20, sz, sz / 2);
	let pos = { left: (card.w - w) / 2, top: (card.h - h) / 2 }
	x = mDiv(d, { align: 'left', fz: fz, fg: 'black', w: w, h: h, top: pos.top, left: pos.left, display: 'inline-block', position: 'absolute' }, null, text);
	console.log('x', x)


	let sh0 = [
		`<div class="triangle"></div>`,
		`<div class="triangle type2" style="--b:linear-gradient(red,blue);"></div>`,
		`<div class="triangle type3" style="--b:conic-gradient(green,pink,green);"></div>`,
		`<div class="triangle hex" style="--b:url(https://picsum.photos/id/1067/200/200) center/cover;"></div>`,
		`<div class="triangle hex" style="--b:url(../assets/images/felix.jpg) center/cover;"></div>`,
	];


	let sh = [
		`<div class="weired"></div>`,
		`<div class="weired" style="--b:linear-gradient(red,blue);"></div>`,
		`<div class="weired" style=
		"--b:conic-gradient(green,pink,green);
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`,

		//`<div class="triangle hex" style="--b:url(https://picsum.photos/id/1067/200/200) center/cover;"></div>`,
		//`<div class="triangle hex" style="--b:url(../assets/images/felix.jpg) center/cover;"></div>`,
	];
	for (const sh1 of sh) {
		x = createElementFromHtml(sh1);
		mStyle(x, { w: 80 });
		mAppend(dTable, x);
	}

	//let x=mShape('triangle',d,{bg:'red',w:sz/4,h:sz/4,position:'absolute',top:10,left:10});
	//let x=mShape('triangle',d,{bg:'red',w:sz/4,h:sz/4,position:'absolute',top:10,left:10});



	return;


	let styles = { margin: 10, bg: 'random' };
	//let d=drawShape('hex', dTable);
	for (let i = 0; i < 3; i++) { let d = mShape('triangle', dTable); console.log('d', d); }

}
function testInno() {

	//inno cards
	//for (const k in Cinno) { if (k == 'Metalworking') { let card = cardInno(k); mAppend(dTable, iDiv(card)); } }
	//for (const k in Cinno) { let card = cardInno(k); mAppend(dTable, iDiv(card)); }
	//for (const k in Cinno) { let card = cardInno(k); if (card.echo) mAppend(dTable, iDiv(card)); }

}
function testFindKeys() {
	//let keys = findKeys('bee'); //ok

}

//#region tests mit svg cards
function testCard52Cards() {

	for (let i = 0; i < 20; i++) {
		let card = Card52.random();
		mAppend(dTable, iDiv(card));
	}

}
function test52CardsOther() {
	keys = ['spades', 'hearts', 'clubs', 'diamonds'];

	for (let i = 0; i < 4; i++) {
		let k = keys[i % keys.length];
		console.log('k', k);
		let card = Karte.random(k, 110);
		mAppend(dTable, iDiv(card));
	}

}
function testBirdCards() {
	let keys = SymKeys.filter(x => Syms[x].family != 'emoNoto');
	console.log('groups', ByGroupSubgroup);
	console.log('keySets', KeySets);
	keys = KeySets['animal-bird'];
	for (let i = 0; i < 40; i++) {
		let k = chooseRandom(keys); //keys[i%keys.length];
		console.log('k', k);
		let card = Karte.get(k, 300);
		mAppend(dTable, iDiv(card));
	}

}
//#endregion
//#endregion

//#region sudoku tests
function suTest00() {
	let [rows, cols] = [4, 4];
	let pattern = getSudokuPattern(rows, cols);
	printMatrix(pattern, 'pattern');
	let colarrs = bGetCols(pattern); printMatrix(colarrs, 'transposed');
	let rowarrs = bGetCols(colarrs); printMatrix(rowarrs, 'normal');
	let cFlat = arrFlatten(rowarrs);
	//console.log(cFlat);
	let aRows = bGetRows(pattern);
	let rFlat = arrFlatten(aRows);
	console.assert(sameList(cFlat, rFlat), 'TRANSPOSE DOES NOT WORK!!!!!!!!!!!!!!!')

	let correct = checkSudokuRule(pattern);

}
//#endregion

//#region iconViewer tests
async function iPrepper() {
	//wie macht man eine pic?
	symbolDict = Syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	initTable();
}
async function iTest00() {
	await iPrepper();
	let keys = SymKeys;
	let k = chooseRandom(keys);
	let item = miPic(k, dTable, { w: 100, h: 100, fz: 80, bg: 'blue' });
}
//#endregion

//#region graph tests

//simple graph
function gTest13() {
	let g = createSampleHex1(3, 2, 100, 100); let ids = g.getNodeIds(); let id = ids[0]; g.showExtent();

	//get the center of first node
	let center = g.getProp(id, 'center');//jetzt geht es weil ich bei hex1Board die center prop in jedem node abspeichere!!!
	console.log('center prop', center);
	center = g.posDict['preset'][id];//ja das geht
	console.log('center', center);

	//get size of first node
	let size = g.getSize(id); // das returned eigentlich die bounding box! hab auch x1,y1,x2,y2
	console.log('size', size);

	//get pt in north:
	let pN = { x: center.x, y: size.y1 }; //falsch!
	let node = g.getNode(id);
	let b = node.renderedBoundingBox();
	pN = { x: b.x1 + b.w / 2, y: b.y1 };


	//create a node there!
	let nNew = g.addNode({ width: 25, height: 25 }, pN);
	console.log('new node', nNew);
	let n1 = g.getNode(nNew);
	n1.css('background-color', 'blue');
	let st = { bg: 'red', shape: 'ellipse', w: 25, h: 25 };
	let st1 = mStyleToCy(st);
	n1.css(st1);



}

function gTest12() {
	let g = createSampleHex1(21, 11); let ids = g.getNodeIds(); let id = ids[0];

	g.showExtent();
}
function createSampleHex1(rows = 5, topcols = 3, w = 50, h = 50) {
	initTable();
	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex', w: w, h: h },
		edge: { bg: 'white' }
	};
	let g = hex1Board(dTable, rows, topcols, styles);
	g.addLayoutControls();
	return g;
}
function gTest11() {
	let g = createSampleHex1();
	let ids = g.getNodeIds();
	let id = ids[0];
	console.log('size', g.getSize(id), g.cy.getElementById(id).bb());
	let n = g.cy.getElementById(id);
	n.css({ width: '40px', height: '40px' });
	g.zoom(false);
	let bb = g.cy.elements().bb();
	console.log('gesamt graph braucht:', bb)
}
function gTest10() {
	initTable();
	let [rows, topcols, w, h] = [7, 10, 50, 50];
	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex', w: w, h: h },
		edge: { bg: 'green' }
	};
	let g = hex1Board(dTable, rows, topcols, styles);
}
function gTest09() {
	initTable();
	let [w, h] = [50, 50];
	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex', w: w, h: h },
		edge: { bg: 'green' }
	};
	let g = new UIGraph(dTable, styles);
	let [rows, topcols] = [5, 3];
	let total = hex1Count(rows, topcols);
	console.log('for rows', rows, 'and cols', topcols, 'need', total, 'nodes')
	let nids = g.addNodes(total);
	g.hex1(rows, topcols, w + 4, h + 4);
	let indices = hex1Indices(rows, topcols);
	console.log('indices', indices);
	//correct, jetzt soll jeder node die bekommen!
	let ids = g.getNodeIds();
	console.log('node ids:', ids);
	//return;
	let di = {};
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		lookupSet(di, [row, col], id);
		g.setProp(id, 'row', row);
		g.setProp(id, 'col', col);
		g.setProp(id, 'label', `${row},${col}`);
		//g.setStyle(id, 'label', 'data(label)');
	}
	let labels = g.getNodes().map(x => x.data().label);
	console.log('labels', labels);
	let label = g.cy.getElementById(ids[1]).data('label');

	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		let nid2 = lookup(di, [row, col + 2]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col - 1]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col + 1]); if (nid2) g.addEdge(id, nid2);
	}

	let deg = g.getDegree(ids[1]); //cy.getElementById(ids[1]).data('label');
	let deg1 = g.getDegree(ids[10]); //cy.getElementById(ids[1]).data('label');
	let deg2 = g.getDegree(ids[18]); //cy.getElementById(ids[1]).data('label');
	console.log('das geht: label', label, deg, deg1, deg2);

}
function gTest08() {
	initTable();
	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex' },
		edge: { bg: 'green' }
	};
	let g = new UIGraph(dTable, styles);
	let nids = g.addNodes(10);
	let eids = g.addEdges(10);
	g.cose();
	g.addLayoutControls();
	let nodes = g.getNodes();
	console.log('nodes', nodes[0]);
	g.mStyle(nodes[0], { shape: 'ellipse', bg: 'black' });
}
function gTest07() {
	initTable();

	//let hexPoints = [{ x: 0, y: -1 }, { x: 1, y: -0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: -1, y: 0.5 }, { x: -1, y: -0.5 }]
	let hexPoints = [0, -1, 1, -0.5, 1, 0.5, 0, 1, -1, 0.5, -1, -0.5];

	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex' },
		edge: { bg: 'blue' }
		// node: { shape: 'polygon', 'shape-polygon-points': hexPoints, w: 90, h: 100, bg: 'black', fg: 'red', fz: 40 },
		//'node.field':  { shape: 'polygon', 'shape-polygon-points': hexPoints, w: 90, h: 100, bg: 'black', fg: 'red', fz: 40 },
		// 'node.city':  { shape: 'circle', w: 25, h: 25, bg: 'violet', fg: 'white', fz: 40 },

	};

	let g = new UIGraph(dTable, styles);
	let cy = g.cy;
	//cy.style({ selector: 'h1', style: { 'background-color': 'grey' } });

	//let nids = g.addNodes(7);nids.map(x=>x.class('field'))
	let nids = g.addNodes(10);
	let eids = g.addEdges(10);

	let node = g.getNodes()[0];
	node.addClass('high');

	g.cose();
	//g.nodeEvent('click', x => { x.addClass('high'); }); //let id = x.id(); console.log('clicked ' + id); g.mStyle(id, { bg: 'yellow', fg: 'blue' }); });

	cy.style().selector('node.field').style('color', 'black');
	cy.style().selector('node.city').style('shape', 'hexagon');



	let node1 = g.getNodes()[1];
	node.addClass('city');
	node1.addClass('field');
}
function gTest06() {
	initTable();

	//let hexPoints = [{ x: 0, y: -1 }, { x: 1, y: -0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: -1, y: 0.5 }, { x: -1, y: -0.5 }]
	let hexPoints = [0, -1, 1, -0.5, 1, 0.5, 0, 1, -1, 0.5, -1, -0.5];

	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink' },
		edge: { bg: 'blue' }
		// node: { shape: 'polygon', 'shape-polygon-points': hexPoints, w: 90, h: 100, bg: 'black', fg: 'red', fz: 40 },
		//'node.field':  { shape: 'polygon', 'shape-polygon-points': hexPoints, w: 90, h: 100, bg: 'black', fg: 'red', fz: 40 },
		// 'node.city':  { shape: 'circle', w: 25, h: 25, bg: 'violet', fg: 'white', fz: 40 },

	};

	let g = new UIGraph(dTable, styles);
	let cy = g.cy;
	//cy.style({ selector: 'h1', style: { 'background-color': 'grey' } });

	//let nids = g.addNodes(7);nids.map(x=>x.class('field'))
	let nids = g.addNodes(10);
	let eids = g.addEdges(10);

	let node = g.getNodes()[0];
	node.addClass('high');

	g.cose();
	//g.nodeEvent('click', x => { x.addClass('high'); }); //let id = x.id(); console.log('clicked ' + id); g.mStyle(id, { bg: 'yellow', fg: 'blue' }); });

	cy.style().selector('node.field').style('color', 'black');
	cy.style().selector('node.city').style('shape', 'hexagon');

	let node1 = g.getNodes()[1];
	node.addClass('city');
	node1.addClass('field');
}
function gTest05() {
	initTable();

	//let hexPoints = [{ x: 0, y: -1 }, { x: 1, y: -0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: -1, y: 0.5 }, { x: -1, y: -0.5 }]
	let hexPoints = [0, -1, 1, -0.5, 1, 0.5, 0, 1, -1, 0.5, -1, -0.5];

	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { shape: 'polygon', 'shape-polygon-points': hexPoints, w: 90, h: 100, bg: 'black', fg: 'red', fz: 40 }
	};

	let g = new UIGraph(dTable, styles);
	let nids = g.addNodes(7);
	//let eids = g.addEdges(15);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
	//g should be of item form! dh hat id und iDiv!
	g.hex1(3, 2, styles.node.w + 2, styles.node.h + 2);
	g.addLayoutControls();
	g.disableDD(); //cool!!!!
	g.nodeEvent('click', x => { let id = x.id(); console.log('clicked ' + id); g.mStyle(id, { bg: 'yellow', fg: 'blue' }); });
}
//#endregion

//#region old code!
function gTest04() {
	initTable();
	let d = mDiv(dTable, { w: 500, h: 360, bg: 'blue', align: 'left' });
	let g = new AbsGraph1(d);
	g.addVisual(d);
	let nids = g.addNodes(10);
	let eids = g.addEdges(15);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
	g.cose();
	g.addLayoutControls(d);
}
function gTest03() {
	initTable();
	let d = mDiv(dTable, { w: 500, h: 360, bg: 'blue', align: 'left' });
	let g = new AbsGraph1(d);
	upgradeToSimpleGraph(g, d); //g.addVisual(d);
	let nids = g.addNodes(10);
	let eids = g.addEdges(15);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
	g.cose();
	g.addLayoutControls();
}
//#region nur fuer gTest02 gebraucht!
function upgradeToSimpleGraph(g, dParent, styles = {}) {
	g.id = nundef(dParent.id) ? getUID() : dParent.id;
	// mIfNotRelative(dParent);

	let styleDict = {
		node: { 'width': 25, 'height': 25, 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
		edge: { 'width': 2, 'line-color': 'silver', 'curve-style': 'haystack', },
		'node.highlight': { 'background-color': 'yellow' },
		'node.trans': { 'opacity': '0.5' },
	}
	for (const ks of ['node', 'edge', 'node.highlight', 'node.trans']) {
		if (isdef(styles[ks])) {
			for (const k in styles[ks]) {
				let [prop, val] = translateToCssStyle(k, styles[ks][k], false);
				styleDict[ks][prop] = val;
			}
		}
	}
	let cyStyle = [];
	for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

	//let d1=
	let size = getSize(dParent);
	let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w - 80, left: 40, top: 0, h: size.h, align: 'left' });
	// console.log('size',size)
	// let dCy = mDiv(dParent, { position: 'absolute', left: 40, top: 0, w: 'calc( 100% - 80px )', h: '100%' });
	// let dCy = mDiv(dParent, {display:'inline-block', position: 'absolute', left: 40, top: 0, w: size.w-80, h: size.h });
	g.cy.mount(d1);
	g.cy.style(cyStyle);
	// console.log('extent',g.cy.extent());
	g.enablePanZoom();
	iAdd(g, { div: dParent, dCy: d1 });
}
class AbsGraph1 {
	constructor() {
		let defOptions = {
			maxZoom: 1,
			minZoom: .001,
			motionBlur: false,
			wheelSensitivity: 0.05,
			zoomingEnabled: false,
			userZoomingEnabled: false,
			panningEnabled: false,
			userPanningEnabled: false,
			boxSelectionEnabled: false,
			layout: { name: 'preset' },
			elements: [],
		};

		this.cy = cytoscape(defOptions);
	}
	clear() { this.cy.destroy(); }
	//#region access and algos
	getComponents() { return this.cy.elements().components(); }
	getComponentIds() { return this.cy.elements().components().map(x => x.id()); }
	getCommonEdgeId(nid1, nid2) { return nid1 + '_' + nid2; }
	getNumComponents() { return this.cy.elements().components().length; }
	getNode(id) { return this.cy.getElementById(id); }
	getNodes() { return this.cy.nodes(); }
	getNodeIds() { return this.cy.nodes().map(x => x.id()); }
	getNodeData() { return this.cy.nodes().map(x => x.data()); }
	getNodePositions() { return this.cy.nodes.map(x => x.position()); }
	getEdges() { return this.cy.edges(); }
	getEdgeIds() { return this.cy.edges().map(x => x.id()); }
	getPosition(id) {
		let node = this.getNode(id);
		let pos = node.renderedPosition();
		//console.log('node', node, pos);
		return pos; //this.cy.getElementById(id).renderedPosition();
	}
	setPosition(id, x, y) { this.cy.getElementById(id).position({ x: x, y: y }); }

	setProp(id, prop, val) { this.cy.getElementById(id).data()[prop] = val; }

	getProp(id, prop) { return this.cy.getElementById(id).data()[prop]; }
	getDegree(id) { return this.cy.nodes('#' + id).degree(); }
	getNodeWithMaxDegree(idlist) {
		if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let imax = arrMinMax(idlist, x => this.getDegree(x)).imax;
		let id = idlist[imax];
		return id;
	}
	getShortestPathsFrom(id) { let res = this.cy.elements().dijkstra('#' + id); return res; }
	getShortestPathFromTo(nid1, nid2) {
		//console.log(nid1, nid2)
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		// let len = funcs.distanceTo('#' + nid2);
		let path = funcs.pathTo('#' + nid2);
		return path;

	}
	getLengthOfShortestPath(nid1, nid2) {
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		let len = funcs.distanceTo('#' + nid2);
		//let path = funcs.pathTo('#' + nid2);
		return len;
	}
	storeCurrentPositions(prop = 'center') {
		for (const n of this.getNodes()) {
			let id = n.id();
			//console.log('id', id);
			let pos = this.getPosition(id);
			//console.log('current pos', id, pos);
			this.setProp(id, prop, pos);
			//console.log('new val', this.getProp(id, prop));
		}
	}
	setPositionData(prop = 'center') {
		let ids = this.getNodeIds();
		for (const id of ids) {
			let pos = this.getProp(id, prop);
			if (isdef(pos)) this.setPosition(id, pos.x, pos.y);
			else return false;
		}
		return true;
	}
	sortNodesByDegree(idlist, descending = true) {
		//console.log('idlist',idlist)
		if (nundef(idlist)) idlist = this.cy.nodes.map(x => x.data().id);
		// if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let nodes = idlist.map(x => this.getNode(x));
		for (const n of nodes) {
			n.degree = this.getDegree(n.id());
			//console.log('id',n.id(),'has degree',n.degree);
		}
		if (descending) sortByDescending(nodes, 'degree'); else sortBy(nodes, 'degree');
		return nodes;
	}
	//#endregion

	//#region modify nodes, edges
	addNode(data, coords) {
		if (nundef(data)) data = {};
		if (nundef(data.id)) data.id = getFruid();
		if (isdef(coords)) {
			coords.x -= this.cy.pan().x;
			coords.y -= this.cy.pan().y;
		} else { coords = { x: 0, y: 0 }; }
		var ele = this.cy.add({
			group: 'nodes',
			data: data,
			position: coords
		});
		return ele.id();
	}
	addNodes(n, datalist, coordlist) {
		let ids = [];
		if (nundef(datalist)) datalist = new Array(n).map(x => ({ id: getFruid() }));
		if (nundef(coordlist)) coordlist = new Array(n).map(x => ({ coords: { x: 0, y: 0 } }));
		for (let i = 0; i < n; i++) {
			let id = this.addNode(datalist[i], coordlist[i]);
			ids.push(id);
		}
		return ids;
	}
	addEdge(nid1, nid2, data) {
		//console.log('addEdge',nid1,nid2,data)
		if (nundef(data)) data = {};
		data.id = this.getCommonEdgeId(nid1, nid2);

		data.source = nid1;
		data.target = nid2;
		var ele = this.cy.add({
			group: 'edges',
			data: data,
		});
		return ele.id();
	}
	addEdges(nOrNodePairList) {
		//nodePairList should be of the form: [[nid1,nid2], ...]
		if (isNumber(nOrNodePairList)) {
			//make n random nodes!
			let nids = this.getNodeIds();
			let prod = arrPairs(nids);
			nOrNodePairList = choose(prod, nOrNodePairList);
		}
		let res = [];
		for (const pair of nOrNodePairList) {
			res.push(this.addEdge(pair[0], pair[1]));
		}
		return res;
	}
	removeNode(node) { this.removeElement(node); return this.getNodeIds(); }
	removeEdge(edge) { this.removeElement(edge); return this.getEdgeIds(); }
	removeElement(ne) { if (!isString(ne)) ne = ne.id(); this.cy.getElementById(ne).remove(); }
	//#endregion

	//#region layouts
	breadthfirst() { this.cy.layout({ name: 'breadthfirst', animate: true }).run(); }
	circle() { this.cy.layout({ name: 'circle', animate: 'end' }).run(); }
	concentric() { this.cy.layout({ name: 'concentric', animate: true }).run(); }
	//cola() { this.cy.layout({ name: 'cola', animate: 'end' }).run(); }
	comcola() {
		let defaults = {
			name: 'cola',
			animate: true, // whether to show the layout as it's running
			refresh: 1, // number of ticks per frame; higher is faster but more jerky
			maxSimulationTime: 4000, // max length in ms to run the layout
			ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
			fit: true, // on every layout reposition of nodes, fit the viewport
			padding: 30, // padding around the simulation
			boundingBox: undefined, //{x1:0,y1:0,x2:200,y2:200,w:200,h:200}, //undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
			nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

			// layout event callbacks
			ready: function () { }, // on layoutready
			stop: function () { }, // on layoutstop

			// positioning options
			randomize: false, // use random node positions at beginning of layout
			avoidOverlap: true, // if true, prevents overlap of node bounding boxes
			handleDisconnected: true, // if true, avoids disconnected components from overlapping
			convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
			nodeSpacing: function (node) { return 10; }, // extra spacing around nodes
			flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
			alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
			gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

			// different methods of specifying edge length
			// each can be a constant numerical value or a function like `function( edge ){ return 2; }`
			edgeLength: undefined, // sets edge length directly in simulation
			edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
			edgeJaccardLength: undefined, // jaccard edge length in simulation

			// iterations of cola algorithm; uses default values on undefined
			unconstrIter: undefined, // unconstrained initial layout iterations
			userConstIter: undefined, // initial layout iterations with user-specified constraints
			allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

			// infinite layout options
			infinite: false // overrides all other options for a forces-all-the-time mode
		};
		let options = {
			name: 'cola',
			convergenceThreshold: 100,
			// padding: 25,
			// nodeSpacing: 5,
			// edgeLengthVal: 2,
			// animate: true,
			// randomize: false,
			// maxSimulationTime: 1500,
			// ready: this.reset.bind(this),
			// flow: null,
			boundingBox: { x1: 20, y1: 20, w: 200, h: 200 },
		};
		copyKeys(options, defaults);
		console.log(defaults.boundingBox)
		this.cy.layout(defaults).run();
	}
	cose() { this.cy.layout({ name: 'cose', animate: 'end' }).run(); }
	// dagre() { this.cy.layout({ name: 'dagre', fit: true, padding: 25, animate: 'end' }).run(); }
	euler() { this.cy.layout({ name: 'euler', fit: true, padding: 25, animate: 'end' }).run(); }
	fcose() {
		var defaultOptions = {

			// 'draft', 'default' or 'proof' 
			// - "draft" only applies spectral layout 
			// - "default" improves the quality with incremental layout (fast cooling rate)
			// - "proof" improves the quality with incremental layout (slow cooling rate) 
			quality: "default",
			// Use random node positions at beginning of layout
			// if this is set to false, then quality option must be "proof"
			randomize: true,
			// Whether or not to animate the layout
			animate: true,
			// Duration of animation in ms, if enabled
			animationDuration: 500,
			// Easing of animation, if enabled
			animationEasing: undefined,
			// Fit the viewport to the repositioned nodes
			fit: true,
			// Padding around layout
			padding: 30,
			// Whether to include labels in node dimensions. Valid in "proof" quality
			nodeDimensionsIncludeLabels: false,
			// Whether or not simple nodes (non-compound nodes) are of uniform dimensions
			uniformNodeDimensions: false,
			// Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
			packComponents: true,
			// Layout step - all, transformed, enforced, cose - for debug purpose only
			step: "all",

			/* spectral layout options */

			// False for random, true for greedy sampling
			samplingType: true,
			// Sample size to construct distance matrix
			sampleSize: 25,
			// Separation amount between nodes
			nodeSeparation: 75,
			// Power iteration tolerance
			piTol: 0.0000001,

			/* incremental layout options */

			// Node repulsion (non overlapping) multiplier
			nodeRepulsion: node => 4500,
			// Ideal edge (non nested) length
			idealEdgeLength: edge => 50,
			// Divisor to compute edge forces
			edgeElasticity: edge => 0.45,
			// Nesting factor (multiplier) to compute ideal edge length for nested edges
			nestingFactor: 0.1,
			// Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
			numIter: 2500,
			// For enabling tiling
			tile: true,
			// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingVertical: 10,
			// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingHorizontal: 10,
			// Gravity force (constant)
			gravity: 0.25,
			// Gravity range (constant) for compounds
			gravityRangeCompound: 1.5,
			// Gravity force (constant) for compounds
			gravityCompound: 1.0,
			// Gravity range (constant)
			gravityRange: 3.8,
			// Initial cooling factor for incremental layout  
			initialEnergyOnIncremental: 0.3,

			/* constraint options */

			// Fix desired nodes to predefined positions
			// [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
			fixedNodeConstraint: undefined,
			// Align desired nodes in vertical/horizontal direction
			// {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
			alignmentConstraint: undefined,
			// Place two nodes relatively in vertical/horizontal direction
			// [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
			relativePlacementConstraint: undefined,

			/* layout event callbacks */
			ready: () => { }, // on layoutready
			stop: () => { }, // on layoutstop
			name: 'fcose',
		};
		this.cy.layout(defaultOptions).run(); //{name: 'fcose'}).run(); 
	}
	gridLayout() { this.cy.layout({ name: 'grid', animate: true }).run(); }
	presetLayout() {
		let hasCenterProp = this.setPositionData();
		if (!hasCenterProp) {
			console.log('no positions are preset: store first!');
		} else {
			let options = {
				name: 'preset',
				positions: undefined, //function (n){return this.getNode(n.id()).data().center;}, //this.posDict, //undefined, // undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
				zoom: undefined, // the zoom level to set (prob want fit = false if set)
				pan: undefined, // the pan level to set (prob want fit = false if set)
				fit: true, // whether to fit to viewport
				padding: 30, // padding on fit
				animate: true, // whether to transition the node positions
				animationDuration: 500, // duration of animation in ms if enabled
				animationEasing: undefined, // easing of animation if enabled
				animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
				ready: undefined, // callback on layoutready
				stop: undefined, // callback on layoutstop
				transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
			};
			this.cy.layout(options);
			this.reset();
		}
	}
	randomLayout() { this.cy.layout({ name: 'random', animate: 'true' }).run(); }
	klay() {
		let klayDefaults = {
			// Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
			addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
			aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
			borderSpacing: 20, // Minimal amount of space to be left to the border
			compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
			crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
			/* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
			INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
			/* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
			INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
			direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
			/* UNDEFINED, RIGHT, LEFT, DOWN, UP */
			edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
			edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
			feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
			fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
			/* NONE Chooses the smallest layout from the four possible candidates.
			LEFTUP Chooses the left-up candidate from the four possible candidates.
			RIGHTUP Chooses the right-up candidate from the four possible candidates.
			LEFTDOWN Chooses the left-down candidate from the four possible candidates.
			RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
			BALANCED Creates a balanced layout from the four possible candidates. */
			inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
			layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
			linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
			mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
			mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
			nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
			/* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
			LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
			INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
			/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
			LINEAR_SEGMENTS Computes a balanced placement.
			INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
			SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
			randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
			routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
			separateConnectedComponents: true, // Whether each connected component should be processed separately
			spacing: 20, // Overall setting for the minimal amount of space to be left between objects
			thoroughness: 7 // How much effort should be spent to produce a nice layout..
		};

		var options = {
			nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
			fit: true, // Whether to fit
			padding: 20, // Padding on fit
			animate: true, // Whether to transition the node positions
			animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
			animationDuration: 500, // Duration of animation in ms if enabled
			animationEasing: undefined, // Easing of animation if enabled
			transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
			ready: this.reset.bind(this), // Callback on layoutready
			stop: undefined, // Callback on layoutstop
			klay: {
				addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
				aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
				borderSpacing: 20, // Minimal amount of space to be left to the border
				compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
				crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
				cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
				direction: 'UNDEFINED', // Overall direction of edges: /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
				edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
				edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
				feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
				fixedAlignment: 'NONE', // node placer alignment: NONE | LEFTUP | RIGHTUP | LEFTDOWN | RIGHTDOWN | BALANCED
				inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
				layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
				linearSegmentsDeflectionDampening: 0.3,// 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
				mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
				mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
				nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering NETWORK_SIMPLEX (expensive!) | LONGEST_PATH | INTERACTIVE comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
				nodePlacement: 'INTERACTIVE', // Strategy for Node Placement BRANDES_KOEPF | LINEAR_SEGMENTS | INTERACTIVE | SIMPLE
				/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
				LINEAR_SEGMENTS Computes a balanced placement.
				INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
				SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
				randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
				routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
				separateConnectedComponents: true, // Whether each connected component should be processed separately
				spacing: 20, // Overall setting for the minimal amount of space to be left between objects
				thoroughness: 3 // How much effort should be spent to produce a nice layout..
			},
			name: 'klay',

			priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
		};
		this.cy.layout(options).run();
	}
	//#endregion

	//#region ui functions
	fit() { this.cy.fit(); }
	center() { this.cy.center(); this.cy.fit(); }
	reset() { this.pan0(); this.zoom1(); this.center(); }
	pan0() { this.cy.pan({ x: 0, y: 0 }); }
	zoom1() { this.cy.zoom(1); }

	isPan() { return this.cy.panningEnabled(); }
	isZoom() { return this.cy.zoomingEnabled(); }
	enablePanZoom() { this.pan(true); this.zoom(true); }
	pan(isOn, reset = true) {
		this.cy.panningEnabled(isOn);
		this.cy.userPanningEnabled(isOn);
		if (!isOn && reset) { this.pan0(); this.center(); }
	}
	zoom(isOn, minZoom = .25, maxZoom = 1, reset = true) {
		this.cy.zoomingEnabled(isOn);
		this.cy.userZoomingEnabled(isOn);
		if (!isOn && reset) { this.zoom1(); this.center(); }
		else if (isOn) { this.cy.minZoom(minZoom); this.cy.maxZoom(maxZoom); }
	}

	closeLayoutControls() { if (isdef(this.sb)) hide(this.sb); }
	addLayoutControls(sb, buttonlist) {
		let buttons = {
			BFS: mButton('BFS', () => this.breadthfirst(), sb, {}, ['tbb']),
			circle: mButton('circle', () => this.circle(), sb, {}, ['tbb']),
			CC: mButton('CC', () => this.concentric(), sb, {}, ['tbb']),
			cola: mButton('cola', () => this.comcola(), sb, {}, ['tbb']),
			cose: mButton('cose', () => this.cose(), sb, {}, ['tbb']),
			// dagre: mButton('dagre', () => this.dagre(), sb, {}, ['tbb']),
			euler: mButton('euler', () => this.euler(), sb, {}, ['tbb']),
			fcose: mButton('fcose', () => this.fcose(), sb, {}, ['tbb']),
			grid: mButton('grid', () => this.gridLayout(), sb, {}, ['tbb']),
			klay: mButton('klay', () => this.klay(), sb, {}, ['tbb']),
			prest: mButton('prest', () => this.presetLayout(), sb, {}, ['tbb']),
			rand: mButton('rand', () => this.randomLayout(), sb, {}, ['tbb']),
			reset: mButton('reset', () => this.reset(), sb, {}, ['tbb']),
			fit: mButton('fit', () => this.fit(), sb, {}, ['tbb']),
			show: mButton('show', () => this.showGraph(), sb, {}, ['tbb']),
			hide: mButton('hide', () => this.hideGraph(), sb, {}, ['tbb']),
			store: mButton('store', () => this.storeCurrentPositions(), sb, {}, ['tbb']),
		};
		for (const b in buttons) {
			if (isdef(buttonlist) && !buttonlist.includes(b)) hide(buttons[b]);
		}
		return buttons;
	}
	addVisual(dParent, styles = {}) {

		if (this.hasVisual) return;
		this.hasVisual = true;
		this.id = nundef(dParent.id) ? getUID() : dParent.id;
		// mIfNotRelative(dParent);

		let styleDict = {
			node: { 'width': 25, 'height': 25, 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
			edge: { 'width': 2, 'line-color': 'silver', 'curve-style': 'haystack', },
			'node.highlight': { 'background-color': 'yellow' },
			'node.trans': { 'opacity': '0.5' },
		}
		for (const ks of ['node', 'edge', 'node.highlight', 'node.trans']) {
			if (isdef(styles[ks])) {
				for (const k in styles[ks]) {
					let [prop, val] = translateToCssStyle(k, styles[ks][k], false);
					styleDict[ks][prop] = val;
				}
			}
		}
		let cyStyle = [];
		for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

		//let d1=
		let size = getSize(dParent);
		let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w, left: 0, top: 0, h: size.h, align: 'left' });
		// let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w - 80, left: 40, top: 0, h: size.h, align: 'left' });

		// // console.log('size',size)
		// // let dCy = mDiv(dParent, { position: 'absolute', left: 40, top: 0, w: 'calc( 100% - 80px )', h: '100%' });
		// // let dCy = mDiv(dParent, {display:'inline-block', position: 'absolute', left: 40, top: 0, w: size.w-80, h: size.h });
		this.cy.mount(d1);
		this.cy.style(cyStyle);
		// console.log('extent',g.cy.extent());
		this.enablePanZoom();
		iAdd(this, { div: dParent, dCy: d1 });
	}

	//#endregion

}

class SimpleGraph extends AbsGraph1 { //das wird jetzt schon ein Item!
	constructor(dParent, styles = {}) {
		super();
		upgradeToSimpleGraph(this, dParent, styles);
	}
}
//#endregion
function gTest02() {
	initTable();
	let d = mDiv(dTable, { w: 500, h: 300, bg: 'blue', align: 'left' });
	let g = new SimpleGraph(d);
	//g.addVisual(d);
	let nids = g.addNodes(10);
	let eids = g.addEdges(15);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
	g.cose();
	g.addLayoutControls();
}
//abstract graph
function gTest01() {
	let g = new AbsGraph1();
	let nids = g.addNodes(10);
	let eids = g.addEdges(15);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
}
function gTest00() {
	let g = new AbsGraph1();
	let nid1 = g.addNode();
	let nid2 = g.addNode();
	let eid1 = g.addEdge(nid1, nid2);
	console.log('g', g.getNodeIds(), g.getEdgeIds());
}


//#endregion

//#region house room tests
function houseTest00() {
	let s = '"a a b c" "d d e c" "f g e h"'; console.log(getRandomLetterMapping(s)); console.log('_____\n', s, '\n', getLetterSwapEncoding(s));

}
//#endregion

//#region test postData
async function serverTest00_postData() {
	console.log('hallo'); //return;
	let o = { liste: [1, 2, 3], hut: 'hutX' };
	let path = './DATA/file.yaml';
	let resp = await postData('http://localhost:3000/db', { obj: o, path: path });
	//return;
	console.log('response', resp); return;

}

//#endregion

//#region test areas
function cardGameTest09() {
	let state = {
		pl1: { hand: [1, 2, 3, 4, 5], trick: [[6], [7, 8, 9]] },
		pl2: { hand: [11, 12, 13, 14, 15], trick: [[16], [17, 18, 19]] },
	};
	let areaItems = makeAreasKrieg(dTable);
	presentState1(state, areaItems);
}
function presentState1(state, areas) {
	let trick1 = arrFlatten(state.pl1.trick)
	let trick2 = arrFlatten(state.pl2.trick);

	let pl1Hand = state.pl1.hand;
	let pl2Hand = state.pl2.hand;
	// let arrs = [[{trick1:trick1}, {trick2:trick2}], [{pl1Hand:pl1Hand}], [{pl2Hand:pl2Hand}]];
	let arrs = [[trick1, trick2], [pl1Hand], [pl2Hand]];
	let hands = [];
	for (let i = 0; i < 3; i++) {
		let area = areas[i];
		let d = diContent(area);
		iMessage(area, '');
		for (let j = 0; j < arrs[i].length; j++) {
			let arr = arrs[i][j]; //arr is an object {key:cardArr} cardArr can be empty!
			//if (isEmpty(arr)) continue;
			//let key =
			let id = 'a' + i + '_h' + j;
			let what = iH00(arr, d, {}, id);
			hands.push(what);
			//console.log('iH00 returns', what)
		}
	}
	//turn around all the cards in tricks except last one!
	for (let i = 0; i < 2; i++) {
		let cards = hands[i].iHand.items;
		if (isEmpty(hands[i].arr)) continue;
		console.log('cards', cards, 'hands[i]', hands[i])
		for (let j = 0; j < cards.length - 1; j++) {
			Card52.turnFaceDown(cards[j]);
		}
	}
}

function cardGameTest08() {
	let state = {
		pl1: { hand: [1, 2, 3, 4, 5], trick: [[6]] },
		pl2: { hand: [11, 12, 13, 14, 15], trick: [[16]] },
	};
	let trick = arrFlatten(state.pl1.trick).concat(arrFlatten(state.pl2.trick));
	let pl1Hand = state.pl1.hand;
	let pl2Hand = state.pl2.hand;
	let arrs = [trick, pl1Hand, pl2Hand];
	let items = makeAreasKrieg(dTable); //cardGameTest07_helper();
	for (let i = 0; i < 3; i++) {
		let arr = arrs[i];
		let item = items[i];
		let d = diContent(item);
		let id = 'h' + i;
		iMessage(item, '');
		// iMakeHand_test(d, arr, id);
		iH00(arr, d, { bg: 'blue' }, id);

	}
}
function cardGameTest07() {
	let items = cardGameTest07_helper();
	// let card = Card52._createUi('Q', 'H', 70, 110);
	// console.log(card);
	// let item = items[0];
	// let dContent = diContent(item);
	// console.log(item, dContent);
	//iAddContent(item,iDiv(card));

	for (let i = 0; i < 3; i++) {
		let arr = [0, 1, 2, 10, 11].map(x => 1 + (x + i * 13) % 52);
		let d = diContent(items[i]);
		let id = 'h' + i;
		// iMakeHand_test(d, arr, id);
		iH00(arr, d, { bg: 'blue' }, id);

	}
}
function cardGameTest07_helper() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '90%', padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	//let layout = ['t', 'H A'];

	//more intricate layout!
	let areaStyles = { bg: 'green', rounding: 6 };//,box:true, padding:10};
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};
	// areas.T.areaStyles.w='100%';

	let x = createGridLayout(dGrid, layout);
	console.log('result', x);

	//createAreas(dGrid, x, 'dGrid');
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });//,padding:10, box:true});
		items.push(item);
	}
	return items;


}
function cardGameTest06_clean_OK() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '90%', hmin: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	//let layout = ['t', 'H A'];

	//more intricate layout!
	let areaStyles = { bg: 'green', rounding: 6 };//,box:true, padding:10};
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};
	areas.T.areaStyles.w = '100%';

	let x = createGridLayout(dGrid, layout);
	console.log('result', x);

	//createAreas(dGrid, x, 'dGrid');
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });//,padding:10, box:true});
		items.push(item);
	}
	return items;


}
function cardGameTest05() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '80%', h: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	// let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '80%', h: 400, padding: 10, display: 'inline-grid' }, 'dGrid');
	//mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	//let dGrid = mDiv100(dTable, { display: 'inline-grid' });//,'dGrid');


	let layout = ['T', 'H A'];

	//more intricate layout!
	let areaStyles = { bg: 'random', rounding: 6 };//,box:true };
	let contentStyles = { bg: 'dimgray', lowerRounding: 6 };
	let messageStyles = { bg: 'dimgray', fg: 'yellow' };
	let titleStyles = { family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};

	let x = createGridLayout(dGrid, layout);
	console.log('result', x);

	//createAreas(dGrid, x, 'dGrid');
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)

		// let dCell = mDiv(dGrid, { h:'100%', w:'100%', bg: 'random', 'grid-area': k, });
		// if (shadeAreaBackgrounds) { dCell.style.backgroundColor = palette[ipal]; ipal = (ipal + 1) % palette.length; }
		// if (a.showTitle) { 
		// 	dCell=mTitledDiv(a.title,dCell,{bg: 'green',},{h:'100%', w:'100%', bg: 'yellow',},a.id)
		// 	// dCell.innerHTML = makeAreaNameDomel(areaName); 
		// }else {dCell.id=a.id;}
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		// item.div = dCell;item.dTitle=dCell.children[0];item.dMessage=dCell.children[1];item.dContent=dCell.children[2];
		items.push(item);
	}
	return items;


}
function cardGameTest04() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { bg: 'red', w: '80%', h: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	//mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	//let dGrid = mDiv100(dTable, { display: 'inline-grid' });//,'dGrid');
	let layout = ['T', 'H A'];
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);

	createAreas(dGrid, x, 'dGrid');


}
function cardGameTest03_OK() {
	setBackgroundColor(null, 'random');
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	let dGrid = mDiv100(dTable, { display: 'inline-grid' });//,'dGrid');
	let layout = ['T', 'H A'];
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);

	createAreas(dGrid, x, 'a');


}
function cardGameTest02() {
	setBackgroundColor(null, 'random');
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });

	let SPEC = { layout: ['T', 'H A'], showAreaNames: true };
	let s = '';
	let m = [];
	for (const line of SPEC.layout) {
		s += '"' + line + '" ';
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) { if (!isEmpty(l)) arr.push(l); }
		m.push(arr);
	}
	console.log('m', m, '\ns', s); return;

}
//#endregion

//#region testing cards
function cTest03_2HandsRandom() {
	let h1 = iMakeHand_test(dTable, [33, 7, 1, 2, 3, 4], 'h1');
	let h2 = iMakeHand_test(dTable, [13, 14, 15, 16, 17], 'h2');
	//console.log('DA', DA)

	setTimeout(cTest03_2Hands_transferStarts, 1000);

}
function cTest03_2Hands_transferStarts() {

	let h1 = DA.h1.iHand;
	let n1 = h1.items.length;
	//console.log('hand h1 has', n1, 'cards');
	let h2 = DA.h2.iHand;
	let n2 = h2.items.length;
	//console.log('hand h2 has', n2, 'cards');
	//console.assert(n2 == DA.h2.deck.count());

	let c = chooseRandom(h2.items);
	DA.item = c;

	let w = c.w;
	let ov = w / 4;
	let xOffset = n1 * ov;
	console.log('w', w, 'ov', ov, 'xOffset', xOffset)

	iMoveFromTo(c, h2.div, h1.div, cTest03_2Hands_transfer, { x: xOffset, y: 0 });
}
function cTest03_2Hands_transfer() {
	//modify the deck object
	let deck1 = DA.h1.deck;
	let deck2 = DA.h2.deck;
	let item = DA.item;

	deck1.addTop(item.val);
	deck2.remove(item.val);

	iPresentHand_test(dTable, DA.h1);
	iPresentHand_test(dTable, DA.h2);
	iSortHand_test(dTable, DA.h1)

}
function cTest10() {
	//let SPEC = { layout: ['T T', 'H A'], showAreaNames: true };
	let layout = ['T', 'H A'];
	let x = createGridLayout(dTable, layout);
	console.log('x', x);
}
function cTest05() {
	setBackgroundColor(null, 'random')
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });

	let SPEC = { layout: ['T T', 'H A'], showAreaNames: true };
	let s = '';
	let m = [];
	for (const line of SPEC.layout) {
		s += '"' + line + '" ';
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) { if (!isEmpty(l)) arr.push(l); }
		m.push(arr);
	}
	console.log('m', m, '\ns', s); return;

	//was ist diese m?
	let rows = SPEC.layout.length;
	let hCard = 110;
	let hTitle = 20;
	let gap = 4;
	let hGrid = rows * (hCard + hTitle) + gap * (rows + 1);
	let wGrid = '80%';

	let dGrid = mDiv(dTable, { h: hGrid, w: wGrid, 'grid-template-areas': s, bg: 'yellow' });




}
function cTest05B() {
	//let dParent = mDiv100(dTable,{bg:'green'});
	let dGridContainer = mDiv100(dTable, { bg: 'yellow' });

	let areas = mAreas(dGridContainer);
	areas.map(x => mCenterCenterFlex(x.div));
	let dGrid = dGridContainer.children[0];
	mStyle(dGrid, { gap: 5, bg: 'blue', box: true, padding: 5 })
	console.log(dTrick, dGridContainer.children[0]);

	//what is the size of the content div in any of the areas?
	areas.map(x => mStyle(x.div, { h: 110 }));
}
function cTest04_2HandsRandom() {
	// let h1 = iMakeHand([33, 7, 1, 2, 3, 4], dTable,{}, 'h1');
	let iarr = [33, 7, 1, 2, 3, 4], dParent = dTable, id = 'h1';
	let data = DA[id] = {};
	let h = data.deck = new Deck();
	h.init(iarr);
	//iPresentHand_test(dParent, data);
	let redo = true;
	h = data;
	if (nundef(h.zone)) {
		let nmax = 10, padding = 10;
		let sz = netHandSize(nmax);
		//h.zone = iHandZone_test(dParent);
		h.zone = mZone(dParent, { w: sz.w, h: sz.h, bg: 'random', padding: padding, rounding: 10 });
	} else {
		clearElement(h.zone);
	}
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	// return h;
	// return data;


	let h2 = iMakeHand([13, 14, 15, 16, 17], dParent, {}, 'h2');
	//console.log('DA', DA)

	setTimeout(cTest03_2Hands_transferStarts, 1000);

}

//#endregion

//#region testing board
function bTest01() {
	let arr = [1, 1, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;// =>1
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, irow = 2;// =>null
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;// =>1
	console.log(bFullCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>1
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, 1, 2, 1, 2, 2], rows = 3, cols = 3;// =>1
	console.log(bFullDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;// =>0
	console.log(bFullDiag2(arr, rows, cols));
	console.log('============================')
}
function bTest02() {
	let arr = [1, null, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;// =>1
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 0, 1, 1, 1, 2], rows = 3, cols = 3, irow = 2;// =>null
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, null, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;// =>1
	console.log(bPartialCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, null, 1, 1, 0, 1], rows = 3, cols = 3;// =>1
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, null, 2, 1, 2, 2], rows = 3, cols = 3;// =>1
	console.log(bPartialDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;// =>0
	console.log(bPartialDiag2(arr, rows, cols));
}
//connect4 tests: stride
function bTest03() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 'O', 'O', 'O', 'O', 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 'O']]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');

}
function bTest04() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 0, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'O', 0, 0],
	['O', 'X', 0, 0, 'X', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 'X', 0, 'X', 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 'X', 0, 0, 'O', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
}
function bTest05() {
	let arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		['O', 0, 0, 0, 0, 0, 0],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 0, stride = 4;// =>1
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 0, 0, 'X'],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 1, icol = 5, stride = 4;// =>1
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 'X', 0, 'X'],
		[0, 'O', 0, 'X', 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 0, icol = 6, stride = 4;// =>1
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 'O', 'X', 0, 'X'],
		[0, 'O', 'O', 'X', 0, 0, 0],
		['O', 'O', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 3, stride = 4;// =>1
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
}
function bTest06() {
	let pos = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0, 0, 0],
		[0, 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0]];

	let arr = arrFlatten(pos);
	let str = bStrideCol(arr, 1, 6, 7, 4);
	console.log('stride', str)
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);

}
function bTest07() {
	let arr = [0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, 0, 0, 0, "X", 0, 0, "X", "X", 0, "O", "X", 0, "X", "O", "O", "O", "X", "O", "X", "O", "O", "O", "X", "O", "O", "X", "O", "O", "O", "X", "O"];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest08() {
	let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, "X", 0, 0, "O", 0, 0, 0, "O", "X", 0, "O", 0, 0, 0, "O", "X", "O", "O", "O", "O", 0];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest09() {
	let pos = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0],
		[0, 'X', 0, 'O', 0],
		['O', 'X', 0, 'O', 0]];

	let arr = arrFlatten(pos);
	let nei = bNei(arr, 6, 5, 5);
	console.log(nei)
	nei = bNei(arr, 0, 5, 5);
	console.log(nei)
	nei = bNei(arr, 24, 5, 5);
	console.log(nei)
}
function bTest10() {
	let pos = [
		[0, 1, 2, 3, 4, 5],
		[6, 7, 8, 9, 10, 11],
		[12, 13, 14, 15, 16, 17],
		[18, 19, 20, 21, 22, 23],
		[24, 25, 26, 27, 28, 29]];

	let arr = arrFlatten(pos);
	printState(arr);
	let nei = bNei(arr, 6, 6, 6);
	console.log(nei);
	nei = bNei(arr, 7, 6, 6);
	console.log(nei);
	nei = bNei(arr, 16, 6, 6);
	console.log(nei);
}

function btest11_fractions() {

	let a = math.fraction(1, 4);
	let b = math.fraction(1, 4);
	let c = math.multiply(a, b);
	console.log(a, b, c);
	let d = math.add(a, b);
	console.log(d)
	let e = math.multiply(2, a);
	console.log(e)
}
//#endregion

//#region test krieg game!
function kriegTest00(game) {
	game.load({ pl1: { hand: ['TH', 'KH'] }, pl2: { hand: ['9C', 'QC'] } }); game.deck.sort(); game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	for (let i = 0; i < 2; i++) { game.make_random_move(); game.make_random_move(); game.print_state(); if (game.is_out_of_cards()) { console.log('game over!'); break; } }

}
function kriegTest01(game) {
	game.load({ pl1: { hand: ['TH', 'QH'] }, pl2: { hand: ['9C', 'KC'] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state();
	for (let i = 0; i < 8; i++) {
		game.make_random_moveX();
		game.print_state();

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over!'); break; }
	}

}

function kriegTest02(game) {
	game.load({ pl1: { hand: ['TH'], trick: [['2H']] }, pl2: { hand: ['9C', 'KC'] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state('start:');
	for (let i = 0; i < 12; i++) {
		game.make_random_move();
		game.print_state('move:');
		game.resolve();
		game.swap_turn();
		if (i % 2 == 0) game.print_state('after resolve:');

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over!'); break; }
	}

}

function kriegTest03(game) {
	game.load({ pl1: { hand: ['TH'], trick: [['2H']] }, pl2: { hand: ['9C'], trick: [['KC']] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state('start:');

	//es sollte resolve passieren! und dann sollte 0 dran sein!
	//return;

	for (let i = 0; i < 10; i++) {
		game.make_random_move();
		game.print_state('move:');
		game.resolve();
		game.swap_turn();
		if (i % 2 == 1) game.print_state('after resolve:');

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over!'); break; }
	}

}

function kriegTest04(game) {
	game.load({ pl1: { name: 'felix', hand: ['TH'], trick: [['2H']] }, pl2: { name: 'max', hand: ['9C'], trick: [['2C']] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state('start:');

	for (let i = 0; i < 2; i++) {
		game.make_random_move();
		game.print_state('move:');

		//only resolve if second player has played!!!!!!!!!
		console.log('turn', game.iturn)
		if (game.iturn == 1) {
			game.resolve();
			game.swap_turn();
			game.print_state('after resolve:');
		} else game.swap_turn();

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over! winner', game.winner().name); break; }
	}

}

function kriegTest05(game) {
	game.load();//{ pl1: { name:'felix',hand: ['TH'], trick: [['2H']] }, pl2: { name:'max',hand: ['9C'], trick: [['2C']] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state('start:');

	for (let i = 0; i < 25; i++) {
		game.make_random_move();
		game.print_state('move:');

		//only resolve if second player has played!!!!!!!!!
		console.log('turn', game.iturn)
		if (game.iturn == 1) {
			game.resolve();
			game.swap_turn();
			game.print_state('after resolve:');
		} else game.swap_turn();

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over! winner', game.winner().index); break; }
	}

}

function kriegTest06(game) {
	game.load();//{ pl1: { name:'felix',hand: ['TH'], trick: [['2H']] }, pl2: { name:'max',hand: ['9C'], trick: [['2C']] } }); game.deck.sort(); //game.print_state();
	// game.load({ pl1: { hand: ['TH', 'QH'], trick: [['QD']] }, pl2: { hand: ['TC', 'QC'], trick: [['KC']] }, deck:['AH','AC'] },);	game.deck.sort();game.print_state();
	game.print_state('start:');
	let front = new GKriegFront(130, dTable);
	front.presentState(game.get_state(), dTable);
	return;

	for (let i = 0; i < 25; i++) {
		game.make_random_move();
		game.print_state('move:');

		//only resolve if second player has played!!!!!!!!!
		console.log('turn', game.iturn)
		if (game.iturn == 1) {
			game.resolve();
			game.swap_turn();
			game.print_state('after resolve:');
		} else game.swap_turn();

		// game.make_random_move();
		if (game.is_out_of_cards()) { console.log('game over! winner', game.winner().index); break; }
	}

}
function kriegTest00UI() {
	setBackgroundColor(null, 'random');
	clearElement(dTable)
	let back = new GKriegBack();
	back.load({ pl1: { name: 'felix', hand: ['TH', 'KH'] }, pl2: { name: 'tom', hand: ['9C', 'QC'] } }); back.deck.sort(); back.print_state();
	let front = new GKriegFront(130, dTable);
	front.presentState(back.get_state(), dTable);

	mLinebreak(dTable, 50);
	mButton('Move!', () => kriegTest00UI_engine(back, front), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);

}
function kriegTest00UI_engine(back, front) {
	if (back.is_out_of_cards()) { console.log('!!!!!!!!!!!!!!!!'); front.presentGameover(back.winner(), kriegTest00UI); return; }

	clearTable(dTable);
	back.make_random_moveX();
	back.make_random_moveX();
	back.print_state();
	front.presentState(back.get_state(), dTable);
	if (back.is_out_of_cards()) { console.log('game over!'); front.presentGameover(back.winner(), kriegTest00UI); return; }

	mLinebreak(dTable, 50);
	mButton('Move!', () => kriegTest00UI_engine(back, front), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);
}

//#endregion

