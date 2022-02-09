onload = start;

function start() {

	mStyle(document.body, { h: '100vh', bg: 'green', box: true });
	let dParent = mBy('dMain');
	mDiv(dParent, { align: 'center', fg: 'white', padding: 10 }, 'dTop', `<p>I am ${serverData.age} years old.</p>`);
	let dTable = mDiv(dParent, { bg: 'green', position: 'relative' }, 'dTable');

	for (const i of range(0, 5)) {
		let p = i * 50;
		let d = mDiv(dTable, { family: 'opensans', align: 'center', w: 200, h: 100, bg: 'random', fg: 'contrast', padding: 10 }, 'd', `<p>TITLE ${i}</p>`);
		mPos(d, p, p * 1.5);
	}
}
















