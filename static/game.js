function startgame(game, players) {

	//if (nundef(players)) players = prompt('enter players, separated by commas');	players = players.split(',').map(x => x.trim());
	if (nundef(players)) players = ['mimi', 'felix'];
	//console.log('players', players);

	let f = window[`${game}_setup`]; // dixit dixit_setup bluff aristo...
	let gamerec = { gamename: game, players: players, fen: f(players) };

	//POST game to /startgame
	let o = { data: gamerec, type: 'startgame' };
	let ostring = JSON.stringify(o);
	mBy('inpost').value = ostring;
	submit_form('fRoute');

}
function selectgame(game, uname) {
	//if uname is not the host, nothing should happen if there is no fen!
	let g = firstCond(Tables, x => x.name == game);
	if (!g.fen) {
		if (uname == g.players[0]) {
			let fen = window[`${g.gamename}_setup`](g.players);
			let gamerec = { name: game, user:uname, fen: fen, step: 0 };
			//POST game to /initgame
			let o = { data: gamerec, type: 'initgame' };
			let ostring = JSON.stringify(o);
			mBy('inpost').value = ostring;
			submit_form('fRoute');

		} else {
			console.log('please wait for host to initialize this game!')
		}
	} else {
		//POST game to /selectgame 
		console.log('game', game, 'user', uname); //return;
		let o = { data: { game: game, user: uname }, type: 'selectgame' };
		let ostring = JSON.stringify(o);
		mBy('inpost').value = ostring;
		submit_form('fRoute');
	}


}
function presentgame(g, dParent) {
	console.log('g', g)
	if (!g.fen) g.fen =
		fen = JSON.parse(g.fen)

	let d_table = mDiv(dTable, { position: 'relative', bg: '#ffffff40', padding: 10 }); mCenterFlex(d_table);

	let f = window[`${g.gamename}_present`]; //dixit_present
	f(fen, d_table); // dixit bluff aristo...

}


























