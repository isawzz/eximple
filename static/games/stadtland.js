function stadtland_setup(players) {
	let fen = {};
	fen.cats = rChoose(['stadt', 'land', 'tier', 'name', 'plant', 'sport', 'object', 'brand', 'dessert', 'vegetable', 'fruit', 'profession', 'hobby', 'noun', 'emotion', 'landmark'], 4);
	fen.players = {};
	fen.plorder = rPlayerOrder(players);
	fen.letters = ['q','x','y'];
	for (const uname of players) {
		let pl = fen.players[uname] = {answer:{},score:0};
	}
	stadtland_newround(fen,false);
	return fen;
}
function stadtland_present(fen, dParent, plname) {
	//console.log('fen', fen);
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
		let d2 = mDiv(d1, { w: '100%', padding: 20 });
		// mButton('SUBMIT', () => stadtland_answer(fen, plname), d2, {}, 'button', 'bSendMove');
		mButton('SUBMIT', () => interaction(fen, plname, stadtland_answer), d2, {}, 'button', 'bSendMove');
	} else if (fen.phase == 'accept') {
		let d1 = mDiv(dParent, { w: 400, align: 'left' }, null, `<h1>${fen.content}</h1>`);
		let d2 = mDiv(d1, { w: '100%', padding: 20 });

		if (!fen.turn.includes(plname)) return;
		// mButton('ACCEPT', () => stadtland_accept(fen, plname), d2, {hmargin:20}, 'button');
		// mButton('REJECT', () => stadtland_reject(fen, plname), d2, {}, 'button');
		mButton('ACCEPT', () => interaction(fen,plname,stadtland_accept), d2, {hmargin:20}, 'button');
		mButton('REJECT', () => interaction(fen,plname,stadtland_reject), d2, {}, 'button');
	}

}
function stadtland_newround(fen,score){
	fen.phase = "create";
	fen.turn = jsCopy(fen.plorder);
	fen.round = [];
	fen.letter = rLetter(fen.letters);
	lookupAddToList(fen,['letters'],fen.letter);
	fen.instruction = 'complete each category, then click DONE!';
	if (score && isdef(fen.first)) fen.players[fen.first].score += 1;
	for(const uname of fen.plorder){
		for (const cat of fen.cats) fen.players[uname].answer[cat] = '';		
	}
	delete fen.first;
	delete fen.move;
	delete fen.message;
}
function stadtland_createmove(fen,plname){
	let inputs = dParent.getElementsByTagName('input');
	let move = { uname: U.name, table: G.name, data: {} };
	for (const inp of inputs) {
		if (fen.cats.includes(inp.name)) {
			move.data[inp.name] = inp.value;
		}
	}
	return move;
}
function stadtland_answer(fen, plname) {
	let move = stadtland_createmove(fen,plname);
	let islegal = stadtland_evalmove(fen, plname, move);
	//console.log('__________fen.move',fen.move,'move',move)
	if (islegal) {
		fen.move = move;
		let message = `${move.uname} has answered first: `;
		for (const k in move.data) {
			message += `<div>${k}: ${move.data[k]}</div>`;
			fen.players[plname].answer[k] = move.data[k];
		}
		fen.first = plname;
		//console.log('message',message)
		fen.content = message;
		fen.phase = 'accept';
		arrRemovip(fen.turn,plname);
		sendmove(plname,fen,true);
	}else{
		show_instruction('your move is not complete!')
	}
}
function stadtland_accept(fen, plname) {
	let message = `${plname} has accepted`;
	arrRemovip(fen.turn, plname);
	fen.players[plname].hasAccepted = true;
	if (isEmpty(fen.turn)) { stadtland_newround(fen,true);	}
	//console.log('===>fen.turn',fen.turn)
	sendmove(plname,fen);
}
function stadtland_reject(fen, plname) {
	//if one player rejects, nobody gets a point!
	let winner = fen.first;
	stadtland_newround(fen,false);
	fen.status = `last solution from ${winner} was rejected by ${plname}`;
	sendmove(fen,plname);

}
function stadtland_evalmove(fen, plname, move) {
	for (const cat of fen.cats) {
		// if (nundef(move.data[cat])) return false;
		//console.log('...move.data[cat]',move.data[cat]);
		if (isEmpty(move.data[cat])) move.data[cat] = 'hallo';//return false;
	}

	return true;

}
















