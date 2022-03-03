

function onclick_user(name) {
	User = firstCond(Users, x => x.name == name);
	show_user();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
}
function onclick_game(name) {
	Table = firstCond(Tables, x => x.name == name);
	show_title();
	//should I filter tables for this user only? at least actions table?
	//should I sort tables by this user name?
}
function onclick_action(user, game, action) {
	//update Actions
	let a = firstCond(Actions, x => x.user == user && x.game == game);
	console.log('action record is:', a);
	a.choice = action;

	//feststallen ob das die letzte action war
	let allcomplete = true;
	let gameActions = Actions.filter(x => x.game == game);
	for (const a1 of gameActions) {
		if (isEmpty(a1.choice)) allcomplete = false;
		//console.log('choices player',a1.user,a1.choices,typeof a1.choices); //choices is ein string!
	}

	//wenn alles fertig mach das game irgendwie anders: step erhoehen, fen veraendern!
	if (allcomplete) {
		//game step and state update
		let g = firstCond(Tables, x => x.name == game);
		g.step += 1;
		g.fen = "state for step " + g.step;

		//next action set machen!
		for (const a1 of gameActions) {
			a1.choice = '';
			a1.choices = rLetters(5).join(' ');
			//console.log('a1.choices',a1.choices)
		}

		//package post object
		// game object, action object + strings: user game action
		let o = { gamerec: g, gameactions: gameActions, user: user, game: game, action: action };
		console.log('COMPLETE!!!===>das wird gepostet:', o)
		let ostring = JSON.stringify(o);
		mBy('inpost').value = ostring;
		//console.log('das wird gepostet:',o)
		// POST UPDATE GAME ROUTE: for 

		submit_form('fRoute');
	} else {
		console.log('user', user, 'has picked action', action, 'in game', game)
		if (Socket) Socket.emit('action', { user: user, game: game, action: action });
		else {
			//nur diesen einen choice setzen
			let o = { user: user, game: game, action: action };
			console.log('das wird gepostet:', o)
			let ostring = JSON.stringify(o);
			mBy('inpost').value = ostring;
			submit_form('fRoute');

		}
	}


}
