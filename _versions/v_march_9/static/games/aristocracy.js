function aristocracy_setup(player_names) {

	let pre_fen = {};

	let deck = pre_fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2]));
	shuffle(deck);

	pre_fen.market = [];
	pre_fen.deck_discard = [];
	pre_fen.open_discard = [];

	//console.log('pre_fen.deck',pre_fen.deck);

	let pls = pre_fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 7),
			buildings: { farms: [], estates: [], chateaus: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
		};
	}

	pre_fen.plorder = jsCopy(player_names);
	pre_fen.herald = player_names[0];
	pre_fen.phase = 'king';
	pre_fen.stage = 3;
	pre_fen.iturn = 0;
	pre_fen.plturn = pre_fen.plorder[pre_fen.iturn];
	pre_fen.turn = [pre_fen.plturn];
	pre_fen.round = [];
	pre_fen.step = 0;

	let fen = pre_fen;
	return fen;
}
function aristocracy_present(fen,d_table){
	G={};
	G.deck = ui_generic_deck(d_table,fen.deck);

	let pls = G.players = {};
	for(const uname in fen.players){
		let pl = pls[uname] = {};
		let fpl = fen.players[uname];

		let user = firstCond(Users,x=>x.name == uname);
		//copyKeys(fpl,pl);
		copyKeys(user,pl)
		console.log('pl',uname,pl)

		let d = mDiv(d_table,{bg:user.color},null,uname); mFlexWrap(d)
		pl.div = d;
		let i=0;let items = pl.hand = fpl.hand.map(x=>{i++;return aristocracy_get_card(x,i)}); //convert all aristocracy cards into items		let hand = pl.hand.map(x=>)
		for(const item of items) mAppend(d,iDiv(item));
	}
	//let i=0;let items = fen.deck.map(x=>{i++;return aristocracy_get_card(x,i)}); //convert all aristocracy cards into items
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
function aristocracy_get_card(ckey,index, h=200) {
	let filename = `${Basepath}assets/games/aristocracy/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h+clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h,w:h*141/200, overflow:'hidden' }, null, html, 'card');
	mMagnifyOnHoverControl(d)
	let item = {key:ckey,index:index,div:d,html:html,h:h,faceUp:true};
	d.onclick = ()=>{face_up(item);}; 
	return item; 
}

