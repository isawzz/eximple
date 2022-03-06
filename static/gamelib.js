function ui_input(dParent,instruction,funcname){
	let html = `
	<div id="dRoute">
		<h2>${instruction}</h2>
		<form id="fTemp" action="javascript:void(0);" onsubmit="${funcname}()" method="POST">
			<input id="inptemp" type="text" name="text" value="1" placeholder="" />
			<input type="submit" />
		</form>
	</div>
	`;
	let d=mDiv(dParent,{},null,html);

	return {div:d};
}

function ui_message(dParent,msg){
	let d=mDiv(dParent,{},null,msg);
	return {div:d,content:msg};
}
function ui_deck(items, dParent) {
	let n = items.length;
	console.log('n',n)
	console.log('parent',dParent)
	let cont = mDiv(dParent,{ bg:'red',w:200,h:300,maleft: 25, padding: 14 }); // ui_make_deck(n, dParent, { bg:'red',w:200,h:300,maleft: 25, padding: 14 });
	let topmost = ui_add_cards_to_deck(cont, items);
	return {
		type: 'deck',
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_add_cards_to_deck(cont, items) {
	for (const item of items) {
		console.log(iDiv(item));
		mAppend(cont, iDiv(item));
		mItemSplay(item, items, 4, Card.ovdeck);
		item.turn_face_down();
		break;
	}
	return items[0];

}
function ui_make_deck(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	//mContainerSplay(d, 4, Card.w, Card.h, n, Card.ovdeck);

	return d;
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






















