function aristocracy_setup(player_names) {

	let fen = {};

	let deck = fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2])); //blue and red deck
	shuffle(deck);

	fen.market = [];
	fen.deck_discard = [];
	fen.open_discard = [];

	//console.log('pre_fen.deck',pre_fen.deck);

	let pls = fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 7),
			buildings: { farms: [], estates: [], chateaus: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
		};
	}

	fen.plorder = rPlayerOrder(player_names);
	fen.iturn = 0;
	fen.plturn = fen.plorder[0];
	fen.turn = [fen.plturn];
	fen.round = [];

	fen.herald = fen.plturn;
	fen.phase = 'king';
	fen.stage = 3;
	fen.step = 0;

	
	return fen;
}
function aristocracy_present(fen, dParent, plname) {
	console.log('fen',fen);
}


