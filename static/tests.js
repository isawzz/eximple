onload = test0;
async function test0() {
	let d = mBy(dMain);

}

function test4() { 
	let o=dixit_setup(['mimi','felix']);
	mBy('inpost').value = JSON.stringify(o); 
	mBy('inpre').innerHTML = o; 
}

async function test3() { 
	//send whatever is in textarea to flask
	let res = await route_post_form_callback('/simple','fRoute');
	console.log('response:',res)
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


















