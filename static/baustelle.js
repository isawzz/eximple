async function startgame(game, players) {
	if (nundef(game)) game = 'dixit';
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => x.name);
	//console.log('players', players);
	let fen = window[`${game}_setup`](players);
	let o = { type: 'startgame', game: game, players: players, fen: fen, turn: fen.turn };
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();
	
	Serverdata.games.push(gamerec);
	console.log('Serverdata',Serverdata);
	DA.gameItems = show_gametable(dTable);
	//add_game_to_table(gamerec);

	//console.log('gamerec', gamerec);
	//console.log('fen', gamerec.fen)

	show_table_for(gamerec, dTable)
}























