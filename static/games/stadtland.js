function stadtland_setup(players) {
	let fen = {};
	fen.cats = rChoose(['stadt', 'land', 'tier', 'name', 'plant', 'sport', 'object', 'brand', 'dessert', 'vegetable', 'fruit', 'profession', 'hobby', 'noun', 'emotion', 'landmark'], 4);
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {};
		for (const cat of fen.cats) pl[cat] = '';
	}

	//random player starts, his choices: his hand, phase: create
	fen.plorder = rPlayerOrder(players);
	fen.turn = jsCopy(fen.plorder)
	fen.round = [];
	fen.phase = 'create';
	fen.instruction = 'complete each category, then click DONE!';
	fen.letter = rLetter();

	//console.log('fen',fen);
	return fen;
}

function stadtland_present(fen, dParent, plname) {
	console.log('fen', fen);
	let d1 = mDiv(dParent, {w:400,align:'left'}, null, `<h1>letter: ${fen.letter.toUpperCase()}</h1>`);
	for (const cat of fen.cats) {
		mLinebreak(d1,10);
		let html = `
		<div style="display:inline-block;width:150px">${cat.toUpperCase()}:</div>
		<input class:'input' style="width:150px" type='text' name="${cat}">
		`;
		let d2 = mDiv(d1, {}, null, html);
	}
	let d2  = mDiv(d1,{w:'100%',padding:20})
	mButton('SUBMIT',stadtland_sendmove,d2,{},'button','bSendMove');

}
function stadtland_sendmove(){
	let inputs = dTable.getElementsByTagName('input');
	console.log('inputs',inputs)
}


















