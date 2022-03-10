function onclick_cancelmenu() { hide('dMenu'); }
function onclick_player_in_gametable(uname, tablename) {
	show_table_for(firstCond(Serverdata.games, x => x.name == tablename), dTable, uname);
}
function onclick_startgame() {
	show('dMenu');
	let form = mBy('fMenuInput');
	let d = mBy('dMenuInput'); clearElement(d);
	mCenterFlex(d);
	let fsPlayers = mRadioGroup(d, {}, null, 'players');
	let i = 0;
	for (const user of Serverdata.users) {
		mRadio(user.name, user.name, 'uname', fsPlayers, {}, 'toggle', null, i < 3);
		i++;
	}
	let fsGames = mRadioGroup(d, {}, null, 'games');
	for (const game of ['dixit', 'aristocracy', 'bluff', 'stadtland']) {
		mRadio(game, game, 'game', fsGames, {}, null, 'gamename', true);
	}
	form.onsubmit = () => {
		let players = get_checked_radios(fsPlayers);	//console.log('players',players);
		let game = get_checked_radios(fsGames)[0];	//console.log('game',game); 
		startgame(game, players);
		hide('dMenu');
	};
}














