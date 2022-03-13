function ui_game_stats(d, players) {
	//let d = dTitle;
	//clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		//console.log('pl',pl)
		//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null,
			`<img src='${Basepath}assets/images/${plname}.jpg' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
		// `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}


async function startgame(game, players) {
	if (nundef(game)) game = 'dixit';
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => x.name);
	//console.log('players', players);
	let fe = window[`${game}_setup`](players);
	let o = { type: 'startgame', game: game, players: players, fen: fe.fen, expected: fe.expected };
	sendfen(o);
}
function sendmove(plname,fen,action,expected,step) {
	pollStop();
	let o = { type: 'move', uname: plname, game: G.name, fen: fen, action: action, expected: expected, step:step };
	sendfen(o, plname);
}
async function sendfen(o, plname) {
	//console.log('posting', o)
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();

	//console.log('Serverdata.games',Serverdata.games);
	let oldrec = firstCond(Serverdata.games, x => x.name == gamerec.name);
	if (oldrec) arrRemovip(Serverdata.games, oldrec);

	Serverdata.games.unshift(gamerec);
	processServerdata();
	console.log('Serverdata', Serverdata);

	DA.gameItems = show_gametable(mBy('dAllTables'));
	let turn = gamerec.fen.turn;
	//let uname = isdef(plname) ? plname : (isdef(U) && turn.includes(U.name)) ? U.name : turn[0];
	let uname = isdef(plname) ? plname : isdef(U)? U.name : turn[0];
	show_table_for(gamerec, dParent, uname);

	if (Pollmode == 'auto') TO.poll = setTimeout(poll, 5000);
}
function interaction(fen, plname, func) {
	if (!uiActivated) return;
	uiActivate = false;
	pollStop();
	func(fen, plname);

}
function activate_ui() {
	//console.log('activating for', plname)
	uiActivated = true;
}






















