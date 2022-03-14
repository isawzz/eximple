//#region audio
var _audioSources = {
	incorrect1: '../base/assets/sounds/incorrect1.wav',
	incorrect3: '../base/assets/sounds/incorrect3.mp3',
	goodBye: "../base/assets/sounds/level1.wav",
	down: "../base/assets/sounds/down.mp3",
	levelComplete: "../base/assets/sounds/sound1.wav",
	rubberBand: "../base/assets/sounds/sound2.wav",
	hit: "../base/assets/sounds/hit.wav",
	mozart: "../base/assets/music/mozart_s39_4.mp3",
};
// var _SND = null;
var TOSound, _sndPlayer, _loaded = false, _qSound, _idleSound = true, _sndCounter = 0;
var _AUDIOCONTEXT;// browsers limit the number of concurrent audio contexts, so you better re-use'em

function beep(vol, freq, duration) {
	console.log('sollte beepen!!!'); //return;
	if (nundef(_AUDIOCONTEXT)) _AUDIOCONTEXT = new AudioContext();
	let a = _AUDIOCONTEXT;
	v = a.createOscillator()
	u = a.createGain()
	v.connect(u)
	v.frequency.value = freq
	v.type = "square";
	u.connect(a.destination)
	u.gain.value = vol * 0.01
	v.start(a.currentTime)
	v.stop(a.currentTime + duration * 0.001);
}
function playsound() { playSound(...arguments); }
function playSound(key, wait = true) {
	//console.log(getFunctionsNameThatCalledThisFunction(),'=> playSound');
	//console.log('_______playSound', 'key', key, '_sndPlayer', _sndPlayer, '\nIdle', _idleSound, 'loaded', _loaded, 'count:' + _sndCounter);
	if (!wait) _qSound = [];
	_enqSound(key);
	if (_idleSound) { _idleSound = false; _deqSound(); }
}
function pauseSound() {
	_qSound = [];
	if (_loaded && isdef(_sndPlayer)) {
		clearTimeout(TOSound);
		_sndPlayer.onended = null;
		_sndPlayer.onpause = whenSoundPaused;
		_sndPlayer.pause();
	}
}
function whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	//console.log('ENDED!!! Idle=true loaded=false');
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function _enqSound(key) { if (nundef(_qSound)) _qSound = []; _qSound.push(key); }
function _deqSound() {
	let key = _qSound.shift();
	let url = _audioSources[key];
	_sndPlayer = new Audio(url);
	_sndPlayer.onended = whenSoundPaused;
	_sndPlayer.onloadeddata = () => { _loaded = true; _sndPlayer.play(); };
	_sndPlayer.load();
}
function isPlaying() { return DA.isSound; }
function toggleSound(key) {
	if (DA.isSound == true) { pauseSound(); DA.isSound = false; return; }

	playSound(key);
	DA.isSound = true;

}
//#endregion audio
