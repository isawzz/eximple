function set_state_numbers(otree) {
	let [step, stage, iturn, round, phase] = [valf(otree.step, 0), valf(otree.stage, 0), valf(otree.iturn, 0), valf(otree.round, []), valf(otree.phase, 'king')];
	otree.step = step;
	otree.stage = stage;
	otree.iturn = iturn; //index of player on turn in otree.plorder
	otree.round = round; //which players have already had their turn!
	otree.phase = phase;
	let plturn = otree.plturn = otree.plorder[iturn];
	return [step, stage, iturn, round, phase, plturn];
}
function remove_hover_ui(b) { b.onmouseenter = null; b.onmouseleave = null; }
function set_hover_ui(b, item) {
	//if (isCard) set_hover_card(b,d,'silver'); else set_hover_div(b,d,'silver');
	let isCard = isdef(item.c52key);
	let d = iDiv(item);

	b.onmouseenter = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			let fill = b.fill = r.getAttribute('fill');
			r.setAttribute('fill', 'silver');
		} else {
			let bg = d.bg = mGetStyle(d, 'bg');
			//console.log('style bg is',bg);
			mStyle(d, { bg: 'silver' });

		}
	}
	b.onmouseleave = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			r.setAttribute('fill', b.fill);
		} else {
			mStyle(d, { bg: d.bg });
		}
	}
}
function set_hover_div(b, d, val, prop) {
	b.onmouseenter = () => {
		d[prop] = mGetStyle(d, prop);
		let style = {}; style[prop] = val; mStyle(d, style);
	}
	b.onmouseleave = () => {
		let style = {}; style[prop] = d.bg; mStyle(d, style);
	}
}
function set_hover_card(b, d, val = 'silver', prop = 'fill') {
	b.onmouseenter = () => {
		let rs = Array.from(d.getElementsByTagName('rect'));
		let r = arrLast(rs);
		b[prop] = r.getAttribute(prop);
		r.setAttribute(prop, val);
	}
	b.onmouseleave = () => {
		let rs = Array.from(d.getElementsByTagName('rect'));
		let r = arrLast(rs);
		r.setAttribute(prop, b[prop]);
	}
}
function ui_type_deck(list, dParent) {
	let n = list.length;
	let cont = ui_make_deck_container(n, dParent, { maleft: 25, padding: 14 });

	let items = list.map(x => ari_get_card(x));

	let topmost = ui_add_cards_to_deck_container(cont, items, list);
	return {
		type: 'deck',
		list: list,
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_type_market(list, dParent) {
	let n = list.length;
	let cont = ui_make_card_container(n, dParent, { padding: 4, display: 'flex' });

	//let list = n>0?choose(get_keys(Aristocards), n):[];
	let items = list.map(x => ari_get_card(x));
	if (n > 0) ui_add_cards_to_card_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_type_hand(list, dParent) {
	let n = list.length;
	let cont = ui_make_hand_container(n, dParent, { padding: 4 });

	let items = list.map(x => ari_get_card(x));

	ui_add_cards_to_hand_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_type_building(b, dParent) {
	let list = b.list;
	let n = list.length;
	let cont = ui_make_hand_container(n, dParent, { maleft: 12, padding: 4 });

	let items = list.map(x => ari_get_card(x));
	let schwein = null;
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (b.schwein != item.key) face_down(item); else schwein = item;
	}

	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}

	ui_add_cards_to_hand_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
		schwein: schwein,
		harvest: d_harvest,
		keycard: items[0],

	};
}

function qanim() {
	if (!isEmpty(DA.qanim)) {
		let [f, params] = DA.qanim.shift();
		f(...params);
	} //else console.log('...anim q done!')
}
function mFlexColumnWrap(d) { mStyle(d, { display: 'flex', 'flex-flow': 'column wrap' }); }

function ui_from_deck_to_hand(el, deck, hand) {
	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	face_up(topmost);
	let dtop = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	dtop.remove();
	dtop.style.position = 'static';

	hand.items.push(topmost);
	hand.list = hand.items.map(x => x.key);
	mAppend(hand.container, dtop);
	mContainerSplay(hand.container, 2, Card.w, Card.h, hand.list.length, Card.ovw);
	mItemSplay(topmost, hand.list, 2, Card.ovw);

}
function anim_from_deck_to_hand(el, deck, hand) {

	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	face_up(topmost);
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];

	let dto = iDiv(arrLast(hand.items));

	//berechne distance vector dfrom to dto
	//eigentlich brauch ich nur dfrom rect und dto rect relative to dTable
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	//anim translate dfrom by rto.left-rfrom.left, rto.top-rfrom.top
	//when done, execute rest
	dfrom.style.xIndex = 100;
	let [offx, offy] = [Card.ovw, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		//after animation:
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, Card.w, Card.h, hand.list.length, Card.ovw);
		mItemSplay(topmost, hand.list, 2, Card.ovw);
	};

}
function anim_from_deck_to_marketX(deck, market) {

	anim_turn_top_cardX(deck, () => anim_move_top_card_marketX(deck, market));
}
function anim_turn_top_cardX(deck, callback) { anim_toggle_face(deck.topmost, callback); }
function anim_move_top_card_marketX(deck, market) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];

	let dto = isEmpty(market.items) ? market.container : iDiv(arrLast(market.items));

	//berechne distance vector dfrom to dto
	//eigentlich brauch ich nur dfrom rect und dto rect relative to dTable
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	//anim translate dfrom by rto.left-rfrom.left, rto.top-rfrom.top
	//when done, execute rest
	dfrom.style.xIndex = 100;
	let [offx, offy] = isEmpty(market.items) ? [4, 4] : [topmost.w, 0];
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		//after animation:
		dfrom.remove();
		dfrom.style.position = 'static';
		dfrom.style.zIndex = 0;
		market.items.push(topmost);
		market.list = market.items.map(x => x.key);

		mAppend(market.container, dfrom);
		//mContainerSplay(market.container, 2, Card.w, Card.h, market.list.length, Card.ovw);
		//mItemSplay(topmost, market.list, 2, Card.ovw);
		qanim();
	};

}
function anim_move_top_card_market(deck, market) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];

	let dto = isEmpty(market.items) ? market.container : iDiv(arrLast(market.items));

	//berechne distance vector dfrom to dto
	//eigentlich brauch ich nur dfrom rect und dto rect relative to dTable
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	//anim translate dfrom by rto.left-rfrom.left, rto.top-rfrom.top
	//when done, execute rest
	dfrom.style.xIndex = 100;
	let [offx, offy] = isEmpty(market.items) ? [4, 4] : [topmost.w, 0];
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		//after animation:
		dfrom.remove();
		dfrom.style.position = 'static';
		dfrom.style.zIndex = 0;
		market.items.push(topmost);
		market.list = market.items.map(x => x.key);
		mAppend(market.container, dfrom);
		//mContainerSplay(market.container, 2, Card.w, Card.h, market.list.length, Card.ovw);
		//mItemSplay(topmost, market.list, 2, Card.ovw);
		qanim();
	};

}
function anim_move_top_cardX(deck, hand) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];

	let dto = iDiv(arrLast(hand.items));

	//berechne distance vector dfrom to dto
	//eigentlich brauch ich nur dfrom rect und dto rect relative to dTable
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	//anim translate dfrom by rto.left-rfrom.left, rto.top-rfrom.top
	//when done, execute rest
	dfrom.style.xIndex = 100;
	let [offx, offy] = [Card.ovw, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		//after animation:
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, Card.w, Card.h, hand.list.length, Card.ovw);
		mItemSplay(topmost, hand.list, 2, Card.ovw);
		qanim();
	};

}
function anim_from_deck_to_marketX_orig(el, deck, market) {

	anim_turn_top_card(el, () => anim_move_top_card_market(el, deck, market));
}
function anim_from_deck_to_handX(el, deck, hand) {

	anim_turn_top_card(el, () => anim_move_top_card(el, deck, hand));
}
function anim_turn_top_card(el, callback) {
	anim_toggle_face(el, callback);
}
function anim_move_top_card(el, deck, hand) {
	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];

	let dto = iDiv(arrLast(hand.items));

	//berechne distance vector dfrom to dto
	//eigentlich brauch ich nur dfrom rect und dto rect relative to dTable
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	//anim translate dfrom by rto.left-rfrom.left, rto.top-rfrom.top
	//when done, execute rest
	dfrom.style.xIndex = 100;
	let [offx, offy] = [Card.ovw, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		//after animation:
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, Card.w, Card.h, hand.list.length, Card.ovw);
		mItemSplay(topmost, hand.list, 2, Card.ovw);
		qanim();
	};

}
function ui_make_random_deck(n = 10) {
	let list = choose(get_keys(Aristocards), n);
	let cont = ui_make_deck_container(n, dTable, { bg: 'random', padding: 4 });

	let items = list.map(x => ari_get_card(x));

	let topmost = ui_add_cards_to_deck_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_make_random_hand(n = 1) {
	let list = choose(get_keys(Aristocards), n);
	let cont = ui_make_hand_container(n, dTable, { bg: 'random', padding: 4 });

	let items = list.map(x => ari_get_card(x));

	ui_add_cards_to_hand_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_make_random_market(n = 1) {
	let cont = ui_make_card_container(n, dTable, { bg: 'random', padding: 4, display: 'flex' });

	let list = choose(get_keys(Aristocards), n);
	//let list = n>0?choose(get_keys(Aristocards), n):[];
	let items = list.map(x => ari_get_card(x));
	if (n > 0) ui_add_cards_to_card_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_make_card_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	// mContainerSplay(d, 0, Card.w, Card.h, n, Card.ovw);
	return d;
}
function ui_make_hand_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	mContainerSplay(d, 2, Card.w, Card.h, n, Card.ovw);
	return d;
}
function ui_make_deck_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	mContainerSplay(d, 4, Card.w, Card.h, n, Card.ovdeck);

	return d;
}
function ui_add_cards_to_deck_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}


	// wie kann ich verify that top most deck card is items[0]?
	//let x = items[0];	face_up(x);

	return items[0];

}
function ui_add_cards_to_hand_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_add_cards_to_card_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		// mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_make_table() {
	let d = mBy('inner_left_panel'); clearElement(d);
	let dou = mDiv100(d, { display: 'flex' }); //VERTICAL SIDEBAR!!!
	dTable = mDiv(dou, { flex: 5, display: 'flex' });
	return dTable;
}
function ui_make_player(otree, uname, dParent) {
	let id = getUID('u');
	let bg = otree[uname].color;
	let styles = { bg: bg, fg: 'contrast', w: '100%' };
	d = mDiv(dParent, styles, id, uname);
	return d;

}
function ari_show_deck(list, dParent) {
	let id = getUID('u');
	let d = mDiv(dParent, { bg: 'random', padding: 10 }, id);

	//make 1 card
	console.log('list', list);
	let items = list.map(x => ari_get_card(x));


	let [w, h] = [items[0].w, items[0].h];

	console.log('cards', w, h, items);

	items.map(x => mAppend(d, iDiv(x)));

	mContainerSplay(d, splay, w, h, items.length, 20);
	items.map(x => mItemSplay(x, list, splay));

	return d;
}
function ari_make_cardlist(list, splay, dParent) {
	let id = getUID('u');
	let d = mDiv(dParent, { bg: 'random', padding: 10 }, id);

	//make 1 card
	//console.log('list', list);
	let items = list.map(x => ari_get_card(x));

	let [w, h] = [items[0].w, items[0].h];

	//console.log('cards', w, h, items);

	items.map(x => mAppend(d, iDiv(x)));

	mContainerSplay(d, splay, w, h, items.length, 20);
	items.map(x => mItemSplay(x, list, splay));

	return d;
}
function ari_ui_player(otree, uname, dParent) {
	let dPlayer = ui_make_player(otree, uname, dParent);
	let dHand = ari_make_cardlist(otree[uname].hand, 2, dPlayer);

}























