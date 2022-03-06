function testsendupdate() {
	//was muss ich da jetzt machen?
	//in das inpost was reinschreiben
	let data = {
		user: isdef(User)?User.name:'felix',
		game: 'paris',
		fen: dixit_setup(['mimi', 'felix']),
		turn: ['felix'],
		step: 1,
	}
	let o = { type: 'updategame', data: data };
	let ostring = JSON.stringify(o);
	mBy('inpost').value = ostring;
	submit_form('fRoute');
}


















