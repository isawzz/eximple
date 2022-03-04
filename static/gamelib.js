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






















