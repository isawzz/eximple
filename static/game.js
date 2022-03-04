function startgame(game) {

	//present_table(); return;
	//let players = prompt('enter players, separated by commas');	players = players.split(',').map(x => x.trim());
	let players = ['mimi', 'felix'];
	console.log('players', players);

	let f = window[`${game}_setup`]; // dixit bluff aristo...
	let gamerec = f(players);

	//POST game to /startgame
	let o = { data: gamerec, type: 'startgame' };
	let ostring = JSON.stringify(o);
	mBy('inpost').value = ostring;
	submit_form('fRoute');

}
function presentgame(g, dParent) {
	let game = g.gamename;
	let players = g.players;
	let fen = g.fen;
	console.log('game', game, 'players', players, 'fen', fen);
	console.log(typeof (fen));
	fen = JSON.parse(fen)

	let d_table = mDiv(dTable, { position:'relative', bg: '#ffffff40', padding: 10 }); mCenterFlex(d_table);

	let f = window[`${game}_present`];
	f(fen, d_table); // dixit bluff aristo...

}


























