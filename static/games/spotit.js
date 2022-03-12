function spotit_setup(players) {
	let fen = { cards: ['ASr', 'QHb'], players: {}, step: 0, plorder: jsCopy(players), turn: jsCopy(players), expected: {} };
	for (const uname of players) {
		fen.players[uname] = { score: 0 };
		fen.expected[uname] = { step: 0, type: 'click' }
	}
	return fen;
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
}



















