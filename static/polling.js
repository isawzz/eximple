var PollManual=true,Polling=false;
function onclick_startpolling() {
	if (Polling) return;
	Polling = true;
	poll();
}
function onclick_stoppolling() {
	pollStop();
	if (!Polling) return;
	Polling = false;
}
async function onclick_poll() {
	if (!PollManual || Polling) return;

}
function pollStop() { clearTimeout(TO.poll); }
function poll(manual=false) {
	if (!manual && PollManual) {console.log('only manual polling!'); return;}
	Counter.poll=isdef(Counter.poll)?Counter.poll+1:1;
	console.log('poll:',Counter.poll)
	let o = { type: 'poll', game: G.name };
	sendfen(o);
}
