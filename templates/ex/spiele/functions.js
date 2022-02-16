function present_table() {

	console.assert(isdef(Table) && isdef(User), 'table or user missing! cannot present table!');

	//just present a bunch of dixit cards
	//img0.jpg ... img435.jpg
	dTable = mBy('dTable')
	mCenterFlex(dTable, true, true);
	let sample = rChoose(range(0, 435), 10);
	console.log('sample', sample);
	for (const i of sample) {
		let filename = `${basepath}assets/games/dixit/img${i}.jpg`;
		let clip = 50;
		let html = `<img src='${filename}' height='250' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
		let d = mDiv(dTable, { margin: 10, mabottom: -clip }, null, html, 'magnify_on_hover');
	}


}

//wie geht das mit der game logic?
//jeder muss irgendwas aussuchen
//aber alle suchen ja zugleich aus!
//also wenn einer aussucht und abschickt und fen updated wird, dann
//wie mach ich es wenn wieder ein anderer aussucht?
//action per player kann man ja machen










