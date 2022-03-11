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
	let fen = window[`${game}_setup`](players);
	let o = { type: 'startgame', game: game, players: players, fen: fen, turn: fen.turn };
	sendfen(o);
}
function sendmove(fen, plname){
	let o = { type: 'move', uname: plname, game: G.name, fen: fen };
	sendfen(o);
}
async function sendfen(o){
	//console.log('posting', o)
	clearTimeout(TO.poll);

	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();

	//console.log('Serverdata.games',Serverdata.games);
	let oldrec = firstCond(Serverdata.games, x=>x.name == gamerec.name);
	if (oldrec) arrRemovip(Serverdata.games, oldrec);

	Serverdata.games.unshift(gamerec);
	processServerdata();
	console.log('Serverdata', Serverdata);

	DA.gameItems = show_gametable(mBy('dAllTables'));
	let turn = gamerec.ofen.turn;
	let uname =  (isdef(U) && turn.includes(U.name))?U.name:turn[0]; 
	show_table_for(gamerec, dParent,uname);

	//TO.poll = setTimeout(poll,2000);
}
function poll(){
	let o = { type: 'poll', game:G.name };
	sendfen(o);
}
function interaction(fen,plname,func){
	if (!uiActivated) return;
	uiActivate = false;
	clearTimeout(TO.poll);
	func(fen,plname);

}
function activate_ui() {
	//console.log('activating for', plname)
	uiActivated = true;
}






















