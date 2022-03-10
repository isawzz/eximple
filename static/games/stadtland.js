function stadtland_setup(players) {
	let fen = {};
	fen.cats = rChoose(['stadt', 'land', 'tier', 'name', 'plant', 'sport', 'object', 'brand', 'dessert', 'vegetable', 'fruit', 'profession', 'hobby', 'noun', 'emotion', 'landmark'], 4);
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {answer:{},score:0};
		for (const cat of fen.cats) pl.answer[cat] = '';
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
		mButton('SUBMIT', () => stadtland_sendmove(fen, plname), d2, {}, 'button', 'bSendMove');
	} else if (fen.phase == 'accept') {
		let d1 = mDiv(dParent, { w: 400, align: 'left' }, null, `<h1>${fen.message}</h1>`);
		let d2 = mDiv(d1, { w: '100%', padding: 20 })
		mButton('ACCEPT', () => stadtland_accept(fen, plname), d2, {hmargin:20}, 'button');
		mButton('REJECT', () => stadtland_reject(fen, plname), d2, {}, 'button');
	}

}
function stadtland_newround(fen,score){
	fen.phase = "create";
	fen.turn = jsCopy(fen.plorder);
	fen.round = [];
	fen.letter = rLetter();
	fen.instruction = 'complete each category, then click DONE!';
	let winner = fen.first;
	if (score) fen.players[winner].score += 1;
	for(const uname of fen.plorder){
		fen.players[uname].answer = {};
	}
	delete fen.move;
	delete fen.message;
}
async function sendfen(fen,plname){
	let o = { type: 'move', uname: plname, game: Table.name, fen: fen };
	console.log('posting', o)
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();

	let oldrec = firstCond(Serverdata.games,x=>x.name == Table.name);
	if (oldrec) arrRemovip(Serverdata.games,oldrec);
	Serverdata.games.push(gamerec);
	console.log('Serverdata', Serverdata);
	DA.gameItems = show_gametable(dTable);
	show_table_for(gamerec, dTable)
}
function stadtland_accept(fen, plname) {
	let message = `${plname} has accepted`;
	arrRemovip(fen.turn, plname);
	fen.players[plname].hasAccepted = true;
	if (isEmpty(fen.turn)) { stadtland_newround(fen,true);	}
	console.log('===>fen.turn',fen.turn)
	sendfen(fen,plname);
}
function stadtland_reject(fen, plname) {
	//if one player rejects, nobody gets a point!
	let winner = fen.first;
	stadtland_newround(fen,false);
	fen.status = `last solution from ${winner} was rejected by ${plname}`;
	sendfen(fen,plname);

}
async function stadtland_sendmove(fen, plname) {
	let inputs = dTable.getElementsByTagName('input');
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
	let islegal = stadtland_evalmove(fen, plname, move);
	//console.log('__________fen.move',fen.move,'move',move)
	if (islegal) {
		//was soll jetzt passieren?
		//ich koennte fen.turn aendern?
		//hiermit ist eigentlich der turn complete
		//soll man es so machen dass die anderen accepten muessen?
		//ich denke ja
		fen.move = move;
		let message = `${move.uname} has answered first: `;
		for (const k in move.data) {
			message += `<div>${k}: ${move.data[k]}</div>`;
			fen.players[plname].answer[k] = move.data[k];
		}
		fen.first = plname;
		
		//console.log('message',message)
		fen.message = message;
		fen.phase = 'accept';
		arrRemovip(fen.turn,plname);
		console.log('===>fen.turn',fen.turn)
		//fen.turn did not change
		//wie send ich die neue fen?
		sendfen(fen,plname);
		// let o = { type: 'move', uname: plname, game: Table.name, fen: fen };
		// console.log('posting', o)
		// let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();

		// Serverdata.games.push(gamerec);
		// console.log('Serverdata', Serverdata);
		// DA.gameItems = show_gametable(dTable);
		// show_table_for(gamerec, dTable)

	}
}

function stadtland_evalmove(fen, plname, move) {
	for (const cat of fen.cats) {
		// if (nundef(move.data[cat])) return false;
		console.log('...move.data[cat]',move.data[cat]);
		if (isEmpty(move.data[cat])) move.data[cat] = 'hallo';//return false;
	}

	return true;

}

function stadtland_activate(fen, plname) {
	console.log('activating for', plname)
}















