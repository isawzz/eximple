async function startgame(game, players) {
	if (nundef(game)) game = 'dixit';
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => x.name);
	//console.log('players', players);
	let fen = window[`${game}_setup`](players);
	let o = { type: 'startgame', game: game, players: players, fen: fen, turn: fen.turn };
	sendfen(o);
}
function sendmove(fen, plname){
	let o = { type: 'move', uname: plname, game: G.name, fen: fen };
	sendfen(o)
}
async function sendfen(o){
	//console.log('posting', o)
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();

	//console.log('Serverdata.games',Serverdata.games);
	let oldrec = firstCond(Serverdata.games, x=>x.name == gamerec.name);
	if (oldrec) arrRemovip(Serverdata.games, oldrec);

	Serverdata.games.unshift(gamerec);
	processServerdata();
	console.log('Serverdata', Serverdata);

	DA.gameItems = show_gametable(mBy('dAllTables'));
	show_table_for(gamerec, dTable);
}






















