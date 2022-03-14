function bluff_present(){
	let fen = bluff_setup(['felix','mimi']);
	//was kommt jetzt normalerweise?
	console.log('bluff start:',fen);
	//was sollte kommen?
}

function bluff_setup(player_names) {

	let pre_fen = {};
	let deck = pre_fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2])); // br means blue and read card decks
	shuffle(deck);

	let pls = pre_fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 2),
		};
	}

	pre_fen.plorder = jsCopy(player_names);
	pre_fen.phase = 'bid';
	pre_fen.iturn = 0; // for now mimi starts
	pre_fen.plturn = pre_fen.plorder[pre_fen.iturn];
	pre_fen.round = []; //hold players that had their turn already
	pre_fen.step = 0;

	let fen = pre_fen;
	return fen;
}
