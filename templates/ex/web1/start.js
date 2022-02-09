onload = start;

function start() {
	// using only basemin library (see https://github.com/isawzz/aroot/tree/master/base/code/basemin.js)
	for (const i of range(1, 10)) {
		let p = i * 50;
		let d = mDiv(document.body, { align: 'center', w: 200, h: 100, bg: 'random', fg: 'contrast', padding: 10 }, 'd', `<h1>TITLE ${i}</h1>`);
		mPos(d, p, p * 1.5);
		console.log('d', d, p);
	}

}



















