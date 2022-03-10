function dixit_setup(players) {

	let fen = {};

	//make a deck
	let deck = fen.deck = shuffle(range(0, 435));
	//console.log('deck',deck);

	//jeder spieler bekommt 7 karten
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {};
		pl.hand = deck_deal(deck, 7);
	}

	//random player starts, his choices: his hand, phase: create
	fen.plorder = rPlayerOrder(players);
	fen.turn = [fen.plorder[0]];
	fen.round = [];
	fen.iturn = 0;
	fen.phase = 'create';
	fen.instruction = 'write your story';

	//console.log('fen',fen);
	return fen;
}
function dixit_submit_story(x,ev){
	console.log('x',x,'ev',ev)
}
function dixit_present(fen, dParent, plname) {
	F = {};

	if (isdef(fen.story)) {
		F.story = ui_message(dParent, fen.story);
	}
	if (isdef(fen.instruction) && isdef(plname) && fen.plturn == plname) {
		let dTemp = mBy('dTemp');
		dTemp.style.display = 'block';
		mAppend(dParent,dTemp);
		dTempTitle.innerHTML = 'Write a story';
		dTempForm.onsubmit = ev=>dixit_submit_story(mBy('dTempInput').value,ev); //()=>console.log('haaaaaaaaaaaaaaaaaaaaaaaaaa');
	}
	if (isdef(fen.tablecards)) {
		let d = mDiv(dParent, { fg: 'white', bg: user.color, w: '100%' }, null, 'table'); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)
		let i = 0; let items = F.tablecards = fen.tablecards.map(x => { i++; return dixit_get_card(x, i) }); //convert all dixit cards into items		let hand = pl.hand.map(x=>)
		for (const item of items) mAppend(d, iDiv(item));
	}

	let pls = F.players = {};
	for (const uname in fen.players) {
		let pl = pls[uname] = {};
		let fpl = fen.players[uname];

		console.log('dixit_present',user);
		let user = firstCond(Users, x => x.name == uname);
		//copyKeys(fpl,pl);
		copyKeys(user, pl)
		console.log('pl', uname, pl);

		if (isdef(plname) && uname != plname) continue;

		let d = mDiv(dParent, { fg: 'white', bg: user.color, w: '100%' }, null, uname); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)

		let i = 0; let items = pl.hand = fpl.hand.map(x => { i++; return dixit_get_card(x, i) }); //convert all dixit cards into items		let hand = pl.hand.map(x=>)
		for (const item of items) mAppend(d, iDiv(item));

	}
	//let i=0;let items = fen.deck.map(x=>{i++;return dixit_get_card(x,i)}); //convert all dixit cards into items
	//console.log('items',items);
	// for(const item of items){ //.slice(0,10)){
	// 	let d=iDiv(item);
	// 	mAppend(d_table,d);
	// 	setRect(d);
	// 	//mStyle(d,{position:'absolute',left:item.index/2,top:item.index/2});
	// 	//face_down(item);
	// }
	//let deck = ui_deck(items, d_table);
}
function dixit_get_card(ckey, index, h = 200) {
	let filename = `${Basepath}assets/games/dixit/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h + clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	let d = mDiv(null, { rounding: 8, bg: 'blue', margin: 10, h: h, w: h * 141 / 200, overflow: 'hidden' }, null, html, 'card');
	mMagnifyOnHoverControl(d)
	let item = { key: ckey, index: index, div: d, html: html, h: h, faceUp: true };
	d.onclick = () => { face_up(item); };
	return item;
}
function dixit_activate(fen,plname){
	console.log('activating for',plname)
}






















