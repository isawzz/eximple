function bluff_setup(players) {
	let fen = {};

	let deck = fen.deck = get_keys(Aristocards).filter(x => 'r'.includes(x[2])); //red deck
	shuffle(deck);

	//jeder spieler bekommt 2 karten
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {};
		pl.hand = deck_deal(deck, 2);
	}

	//random player starts, his choices: his hand, phase: create
	fen.plorder = rPlayerOrder(players);
	fen.turn = [fen.plorder[0]];
	fen.iturn = 0;
	fen.round = [];
	fen.phase = 'create';
	fen.instruction = 'bid!';

	//console.log('fen',fen);
	return fen;
}

function bluff_present(fen, dParent, plname) {
	console.log('fen',fen);
}

