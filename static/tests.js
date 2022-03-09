

async function test6() {
	let game = 'dixit';
	let players = rChoose(Serverdata.users,2).map(x=>x.name);
	console.log('players',players);
	let fen = dixit_setup(players);
	let o = { type: 'startgame', game: game, players: players, fen: fen, turn: fen.turn };
	let gamerec = await post_test2(o, '/post'); //post_test1(o); post_test0();
	add_game_to_table(gamerec);
}
async function test5() {
	//post some json data
	let o = { k1: 'hallo', k2: 25 }; // dixit_setup(['felix','amanda']);
	post_test2(o, '/simple'); //post_test1(o); post_test0();
}
function test4() {
	let o = DA.fen = dixit_setup(['mimi', 'felix']);
	mBy('inpost').value = o; // JSON.stringify(o);
	mBy('inturn').value = JSON.stringify(o.turn);
	mBy('inplayers').value = JSON.stringify(get_keys(o.players));

	let d = mBy('inpre')
	d.innerHTML = '';
	mStyle(d, { margin: 12 });
	mNode(o, mBy('inpre'));

	//mBy('inpre').innerHTML = JSON.stringify(o, null, 2);; 
}
async function test3() {
	//send whatever is in textarea to flask
	let res = await route_post_callback('/simple', DA.fen);
	//let res = await route_post_form_callback('/simple', 'fRoute');
	console.log('response:', res)
}

function test2() { mBy('inpost').value = JSON.stringify({ type: 'move', data: { a: 'hallo', b: [1, 2, 3] }, user: 'mimi', game: 'paris' }); }

function test1() { mBy('inpost').value = 'HALLO DAS IST EIN NEUER TEXT'; }

async function testsendupdate() {
	//in das inpost was reinschreiben
	let data = {
		user: isdef(User) ? User.name : 'felix',
		game: 'paris',
		fen: dixit_setup(['mimi', 'felix']),
		turn: ['felix'],
		step: 1,
	}
	let o = { type: 'updategame', data: data };
	let ostring = JSON.stringify(o);
	mBy('inpost').value = ostring;

	let res = await route_post_form_callback_js('/singlepost', 'fRoute', data => console.log('got from serverr', data))
	//submit_form('fRoute'); //das reloaded age
}
function test_mNode0() {
	console.log('liste', [1, 2, 3].toString());
	let o = dixit_setup(['felix', 'amanda', 'mimi']);
	console.log('o', o);
	recConvertLists(o);
	console.log('converted', o);
	mNode(o, mBy('inpre'), 'setup');
	inpost.innerHTML = jsonToYaml(o)
}













