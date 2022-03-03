function startgame(game) {

	//present_table(); return;
	//let players = prompt('enter players, separated by commas');	players = players.split(',').map(x => x.trim());
	let players = ['mimi', 'felix'];
	console.log('players', players);

	let f = window[`${game}_setup`];
	let gamerec = f(players);

	//POST game to /startgame
	let ostring = JSON.stringify(gamerec);
	mBy('inpost').value = ostring;
	submit_form('fRoute');


}


























