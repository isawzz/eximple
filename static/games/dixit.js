function dixit_setup(players){
	let game = {gamename:'dixit',players:players};
	let fen = game.fen = {};
	let actions = [];

	//make a deck
	let deck = fen.deck = shuffle(range(0,435));
	console.log('deck',deck);
	
	//jeder spieler bekommt 7 karten
	let pls = fen.players = {};
	for(const uname of players){
		let pl = pls[uname]={};
		pl.hand = deck_deal(deck,7);
	}

	//random player starts, his choices: his hand, phase: create
	let plturn = fen.plturn = rChoose(players);
	let phase = fen.phase = 'create';

	console.log('fen',fen);
	return game;
}























