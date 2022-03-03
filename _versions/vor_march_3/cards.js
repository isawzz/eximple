function show_card(dParent){
	console.log('cards',Aristocards)
}

function set_card_constants(w, h, ranks, suits, deckletters, numjokers = 0, ovdeck = .25, ovw = '20%', ovh = '20%') {
	//koennte ich eine card haben die suit=Spade,
	Card.sz = h;
	Card.h = h;
	Card.w = isdef(w) ? w : Card.sz * .7;
	Card.gap = Card.sz * .05;
	Card.ovdeck = ovdeck;
	Card.ovw = isString(ovw) ? Card.w * firstNumber(ovw) / 100 : ovw;
	Card.ovh = isString(ovh) ? Card.h * firstNumber(ovh) / 100 : ovh;
	Card.ranks = ranks; //'A23456789TJQK';
	Card.suits = suits; //'SHDC';
	Card.deckletters = deckletters; //colors of backside rbgyop (red,blue,green,yellow,orange,purple)
	Card.numdecks = deckletters.length; //2;
	Card.numjokers = numjokers;
}
function ari_create_card_assets(scolors) {
	//lets make 2 decks for now
	let sz = 100;
	set_card_constants(sz * .7, sz, 'A23456789TJQK', 'SHDC', scolors);
	let colors = { r: RED, b: BLUE, g: GREEN, p: PURPLE, y: YELLOW, o: ORANGE };
	let ranknames={A:'Ace',K:'King',T:'10',J:'Jack',Q:'Queen'};
	let suitnames={S:'Spades',H:'Hearts',C:'Clubs',D:'Diamonds'};
	let di = {};
	for (const r of Card.ranks) {
		for (const s of SUITS) {
			for (const c of DECKS) {
				let k = r + s + c;

				di[k] = { key: k, val: r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r), rank: r, suit: s, color: colors[c], c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: Card.ovw, friendly:`${isNumber(r)?r:ranknames[r]} of ${suitnames[s]}`, short:`${r}${s}` };
			}
		}
	}
	Aristocards = di;
	return di;
}
function ari_get_cardinfo(ckey) { return Session.cards[ckey]; }
function ari_get_card(ckey, h, w, ov) {
	//console.log('cards', Session.cards);

	let info = ari_get_cardinfo(ckey);
	//console.log('ckey', ckey, info, get_keys(C52));
	let svgCode = C52[info.c52key]; //C52 is cached asset loaded in _start
	// console.log(cardKey, C52[cardKey])
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	[w, h] = [isdef(w) ? w : isdef(info.w) ? info.w : Card.w, isdef(h) ? h : isdef(info.h) ? info.h : Card.sz];
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;

}

function deck_deal(deck, n) { return deck.splice(0, n); }
function deck_add(deck,n,arr){let els=deck_deal(deck,n); els.map(x=>arr.push(x)); return arr;}

function get_card_key52(R1 = '1', SB = 'B') {
	return `card_${Rank1}${SuitB}`;
}
function get_card_div(R1 = '1', SB = 'B') {
	//per default returns a facedown card
	let key52 = get_card_key52(R1, SB);
	let svgCode = C52['card_1B']; //joker:J1,J2, back:1B,2B
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	[w, h] = [isdef(w) ? w : Card.w, isdef(h) ? h : Card.sz];
	mSize(el, w, h);
	return el;
}
function face_down(item) {
	if (!item.faceUp) return;
	let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
	item.div.innerHTML = svgCode;
	if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
	item.faceUp = false;
}
function face_up(item) {
	if (item.faceUp) return;
	item.div.innerHTML = C52[item.c52key];
	item.faceUp = true;
}
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }
function anim_toggle_face(item, callback) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TOAnim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, 300);
}

