function spotit_setup(players) {
	Card.sz = 200;
	let fen = { cards: ['ASr', 'QHb'], players: {}, step: 0, plorder: jsCopy(players), turn: jsCopy(players) };
	let expected = {};
	for (const uname of players) {
		fen.players[uname] = { score: 0 };
		expected[uname] = { step: 0, type: 'move' }
	}
	return {fen:fen,expected:expected};
}
function spotit_move(g,uname,success){
	console.log('g',g)
	if (success){
		g.ofen.players[uname].score +=1
		g.action = {type:'move',step:g.step};
		for(const x in g.expected){x.step+=1}
		g.fen.step+=1;
		sendmove(uname,g.fen,g.action,g.expected,g.step)
	}
}
function spotit_test0() { startgame('spotit',['amanda','felix']);}
function spotit_test1(g,dParent,uname){
	console.log('from server:',g,dParent,uname);
	spotit_present(g,dParent,uname)
}

function spotit_present(g,dParent, uname) {
	U = firstCond(Serverdata.users, x => x.name == uname);
	show_user();
	show_title('Spotit');

	//gibt es schon ein dTable?
	let fen = g.fen;
	clearElement(dParent);
	show_card(dParent,'objects','spotit');
	spotit_move(g,'amanda',true)
}



















