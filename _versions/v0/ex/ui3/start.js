onload = start;

function start() {
	let dLeft = mBy('dLeft');
	dLeft.style.flex = 0;
	dLeft.onclick = () => dLeft.style.flex = 0;

	let dHeader = mBy('dHeader');
	dHeader.onclick = () => dLeft.style.flex = 1;

}














