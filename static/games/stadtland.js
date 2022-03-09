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
	if (fen.phase == 'create') {
		let d1 = mDiv(dParent, { w: 400, align: 'left' }, null, `<h1>letter: ${fen.letter.toUpperCase()}</h1>`);
		for (const cat of fen.cats) {
			mLinebreak(d1, 10);
			let html = `
			<div style="display:inline-block;width:150px">${cat.toUpperCase()}:</div>
			<input class:'input' style="width:150px" type='text' name="${cat}">
			`;
			let d2 = mDiv(d1, {}, null, html);
		}
		let d2 = mDiv(d1, { w: '100%', padding: 20 })
		mButton('SUBMIT', stadtland_sendmove, d2, {}, 'button', 'bSendMove');
	}else if (fen.phase == 'accept'){
		//
		let d1 = mDiv(dParent, { w: 400, align: 'left' }, null, `<h1>${fen.message}</h1>`);
		let d2 = mDiv(d1, { w: '100%', padding: 20 })
		mButton('YES', stadtland_accept, d2, {}, 'button');
		mButton('NO', stadtland_reject, d2, {}, 'button');
	}

}
function stadtland_accept(){
	let fen = DA.fen;
	//the move from someone has been accepted
}
function stadtland_reject(){
	let fen = DA.fen;

}
function stadtland_sendmove() {
	let inputs = dTable.getElementsByTagName('input');
	let fen = DA.fen;
	console.log('sending move for', User, Table);
	let move = { uname: User.name, table: Table.name, data: {} };
	// console.log('inputs',inputs);
	for (const inp of inputs) {
		//console.log('inp name',inp,inp.name);
		if (fen.cats.includes(inp.name)) {
			console.log('inp', inp.name, inp.value);
			move.data[inp.name] = inp.value;

		}
	}
	let islegal = stadtland_evalmove(move);
	if (islegal) {
		//was soll jetzt passieren?
		//ich koennte fen.turn aendern?
		//hiermit ist eigentlich der turn complete
		//soll man es so machen dass die anderen accepten muessen?
		//ich denke ja
		//
		let message = `${move.uname} has answered first: `;
		for (const k in move.data) {
			message += ` ${k}:${move.data[k]}`
		}
		fen.message = message;
		fen.phase = 'accept';
		//fen.turn

	}
}

function stadtland_evalmove(move) {
	let fen = DA.fen;
	for (const cat in fen.cats) {
		if (nundef(move.data[cat])) return false;
	}
	return true;

}
















