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
function dixit_present(fen,d_table){
	//convert all dixit cards into items
	//console.log('list',fen.deck);
	let i=0;let items = fen.deck.map(x=>{i++;return dixit_get_card(x,i)});
	//console.log('items',items);

	//let d1=mDiv(dTable);mCenterFlex(d1);
	for(const item of items.slice(0,10)){
		let d=iDiv(item);
		mAppend(d_table,d);
		setRect(d);
		//mStyle(d,{position:'absolute',left:item.index/2,top:item.index/2,w:getRect(d).w});
		face_down(item);
		//mMagnifyOnHoverControlRemove(d);
		// mClassRemove(d,'magnify_on_hover');
		//mDover(d,{bg:'skyblue',border:'gray',rounding:6})
		//item.turn_face_down();
		//break;
	}
	//let deck = ui_deck(items, d_table);
}
function mMagnifyOnHoverControl(elem){
	elem.onmouseenter = ev=>{if (ev.ctrlKey) mClass(elem,'magnify_on_hover');}
	elem.onmouseleave = ev=>mClassRemove(elem,'magnify_on_hover');
}
function mMagnifyOnHoverControlRemove(elem){
	elem.onmouseenter = elem.onmouseleave = null;
	mClassRemove(elem,'magnify_on_hover');
}
function dixit_get_card(ckey,index, h=200) {
	let filename = `${Basepath}assets/games/dixit/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h+clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	// let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h, overflow:'hidden' }, null, html, 'magnify_on_hover');
	let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h,w:h*141/200, overflow:'hidden' }, null, html);
	mMagnifyOnHoverControl(d)
	// let html = `<img src='${filename}' class='magnify_on_hover' height='${h+clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	//let d = mDiv(null, { rounding:8,bg:'blue',margin: 10, h:h, overflow:'hidden' }, null, html); //, 'magnify_on_hover');
	let item = {key:ckey,index:index,div:d,html:html,h:h,faceUp:true};
	//d.onclick = ()=>{face_up(item);mClass(iDiv(item),'magnify_on_hover');};
	d.onclick = ()=>{face_up(item);}; //mClass(iDiv(item),'magnify_on_hover');};
	//item.turn_face_down=()=>{d.innerHTML='';mClassRemove(d,'magnify_on_hover')};
	//item.turn_face_up=()=>{d.innerHTML=html;mClass(d,'magnify_on_hover')};
	return item; // {key:ckey,div:d,html:html,h:h,turn_face_down:item=>iDiv(item).innerHTML='',turn_face_up:item=>iDiv(item).innerHTML = item.html};
}
function turnfacedown(c){
	let d=iDiv(c);
	mDiv100(d,{bg:'orange'});
}























