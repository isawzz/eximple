//var PollManual=true,Polling=false;
function onclick_startpolling() {
	pollStop();
	Pollmode = 'auto';
	poll();
}
function onclick_stoppolling() {
	pollStop();
	Pollmode = 'manual';
}
async function onclick_poll() {
	//if (!PollManual || Polling) return;
	if (Pollmode == 'manual') poll(true);
	else {
		console.log('STOP autopoll first!!!')
	}

}
function pollStop() { clearTimeout(TO.poll); }
function poll() {
	if (nundef(U) || nundef(G)) return;
	Counter.poll=isdef(Counter.poll)?Counter.poll+1:1;
	console.log('poll:',Counter.poll)
	let o = { type: 'poll', game: G.name };
	sendfen(o);
}
