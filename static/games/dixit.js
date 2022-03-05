function dixit_setup(players){
	let game = {gamename:'dixit',players:players};
	let fen = game.fen = {};
	let actions = [];

	//make a deck
	let deck = fen.deck = shuffle(range(0,435));
	//console.log('deck',deck);
	
	//jeder spieler bekommt 7 karten
	let pls = fen.players = {};
	for(const uname of players){
		let pl = pls[uname]={};
		pl.hand = deck_deal(deck,7);
	}

	//random player starts, his choices: his hand, phase: create
	let plturn = fen.plturn = rChoose(players);
	let phase = fen.phase = 'create';

	//console.log('fen',fen);
	return game;
}

function ui_generic_deck(dParent,deck){
	//show one card backside and name of deck
	//wie soll ein generic deck ausschauen?
	//einfach eine backflipped card
	//when clicking on that card it represents the topmost card really
	//auf der card ist die anzahl der cards in the deck
	let c = dixit_get_card(0);
	// let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
	// item.div.innerHTML = svgCode;
	let d = iDiv(c);
	d.innerHTML = C52.card_2B;
	mAppend(dParent,d);
	let d1=mDiv(d,{w:'100%',align:'center',weight:'bold',fz:24},null,`deck ${deck.length}`);
	mPlace(d1,'cc');

	return{
		keys: deck,
		div: d,
		faceUp: false,

	}

}
function dixit_present(fen,d_table){
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
		let i=0;let items = pl.hand = fpl.hand.map(x=>{i++;return dixit_get_card(x,i)}); //convert all dixit cards into items		let hand = pl.hand.map(x=>)
		for(const item of items) mAppend(d,iDiv(item));
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
function dixit_get_card(ckey,index, h=200) {
	let filename = `${Basepath}assets/games/dixit/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h+clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h,w:h*141/200, overflow:'hidden' }, null, html, 'card');
	mMagnifyOnHoverControl(d)
	let item = {key:ckey,index:index,div:d,html:html,h:h,faceUp:true};
	d.onclick = ()=>{face_up(item);}; 
	return item; 
}























