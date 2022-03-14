//#region Markers
const MarkerText = ['✔','✘']; //'&#10004;&#xFE0E;', '✘']; //,'&#10003;', '✘', '✓', '✔', '✔️', '❌'];
const MarkerId = { SUCCESS: 0, FAIL: 1 };
var Markers = [];


function mpOver(d, dParent, fz, color, picStyle) {
	let b = getRect(dParent);
	let cx = b.w / 2 + b.x;
	let cy = b.h / 2 + b.y;
	d.style.top = picStyle == 'segoeBlack' ? ((cy - fz * 2 / 3) + 'px') : ((cy - fz / 2) + 'px');
	d.style.left = picStyle == 'segoeBlack' ? ((cx - fz / 3) + 'px') : ((cx - fz * 1.2 / 2) + 'px');
	d.style.color = color;
	d.style.fontSize = fz + 'px';
	d.style.display = 'block';
	let { isText, isOmoji } = getParamsForMaPicStyle(picStyle);
	d.style.fontFamily = isString(isOmoji) ? isOmoji : isOmoji ? 'emoOpen' : 'emoNoto';
	return d;
}
function getParamsForMaPicStyle(desc = 'segoeBlack') {
	desc = desc.toLowerCase();
	switch (desc) {
		case 'twittertext': return { isText: true, isOmoji: false };
		case 'twitterimage': return { isText: false, isOmoji: false };
		case 'openmojitext': return { isText: true, isOmoji: true };
		case 'openmojiimage': return { isText: false, isOmoji: true };
		case 'openmojiblacktext': return { isText: true, isOmoji: 'openmoBlack' };
		case 'openmojitextblack': return { isText: true, isOmoji: 'openmoBlack' };
		case 'segoe': return { isText: true, isOmoji: 'segoe ui emoji' };
		case 'segoeblack': return { isText: true, isOmoji: 'segoe ui symbol' };
		default: return { isText: true, isOmoji: false };
	}

}

function markerSuccess() { return createMarker(MarkerId.SUCCESS); }
function markerFail() { return createMarker(MarkerId.FAIL); }
function createMarker(markerId) {
	//<div class='feedbackMarker'>✔️</div>
	//console.log('markers', Markers, markerId);
	let divs = document.getElementsByClassName('feedbackMarker');
	//console.log('divs', divs);
	let d;
	// if (isdef(divs[0])) {
	// 	console.log('there is already a feedbackMarker!!!!!!');
	// 	d = divs[0];
	// 	console.log('Markers',Markers)
	// } else {
	d = mCreate('div');
	d.innerHTML = MarkerText[markerId]; //>0? '✔️':'❌';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	// }
	return d;
}
function mRemoveGracefully(elem) {
	mClass(elem, 'aniFastDisappear');
	setTimeout(() => mRemove(elem), 500);
}
function clearMarkers() {
	//console.log('hallo!!!!!!!')
	for (const m of Markers) {
		mRemove(m);
	}
	Markers = [];
}
function removeMarkers() {
	for (const m of Markers) {
		mRemoveGracefully(m);
	}
	Markers = [];
}






function mpOverImage(d, dParent, sz) {
	let b = getRect(dParent);
	let cx = b.w / 2 + b.x;
	let cy = b.h / 2 + b.y;
	sz=Math.max(sz,50);
	d.style.top = (cy - sz / 2) + 'px';
	d.style.left = (cx - sz / 4) + 'px';
	d.style.color = 'green';
	d.style.fontSize = sz + 'px';
	d.style.display = 'block';
	//let { isText, isOmoji } = getParamsForMaPicStyle(picStyle);
	//d.style.fontFamily = isString(isOmoji) ? isOmoji : isOmoji ? 'emoOpen' : 'emoNoto';
	return d;
}
function createSuccessMarker(sz) {
	let d = mCreate('div');
	d.innerHTML = 'J'; // `<img src='../base/assets/images/icons/checkmark.png' height=${sz} />`
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}

function createMarker(markerId) {
	let d = mCreate('div');
	d.innerHTML = MarkerText[markerId]; //>0? '✔️':'❌';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function createMarker_orig(markerId) {
	//<div class='feedbackMarker'>✔️</div>
	//console.log('markers', Markers, markerId);
	let divs = document.getElementsByClassName('feedbackMarker');
	//console.log('divs', divs);
	let d;
	// if (isdef(divs[0])) {
	// 	console.log('there is already a feedbackMarker!!!!!!');
	// 	d = divs[0];
	// 	console.log('Markers',Markers)
	// } else {
	d = mCreate('div');
	d.innerHTML = MarkerText[markerId]; //>0? '✔️':'❌';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	// }
	return d;
}


//#region geht nicht!
function show_checkmark(dParent,styles={fg:'limegreen'}){
	//styles.family=''
	let b = getRect(dParent);
	let fz = b.h;
	if (nundef(styles.fz)) styles.fz = fz;
	//styles['line-height']=`${fz}px`;
	let d1=mDiv(document.body,{position:'fixed',w:b.w,h:b.h,top:b.t,left:b.l,align:'center',overflow:'visible'});
	let d2=mDiv(d1);//,{},null,'A');  //&#10003;');//'H');
	mClass(d1,'no_events');
	d2.innerHTML = 'A';
	d2.style.fontSize = ''+Math.round(b.h)+'px'; // Math.max(40,Math.round(b.h));'40px';
	//d2.style.lineHeight='100%';
	//d2.style.fontWeight = 'bold';
	d2.style.color = 'green';
	//d1.style.pointerEvents='none';
	Markers.push(d1);

	// let cx = b.w / 2 + b.x;
	// let cy = b.h / 2 + b.y;
	// let fz=[Math.max(40,b.h)];
	// let styles1={fz:fz,position:'absolute',top:cy-fz/2,left:b.x,align:'center',w:b.w,fg:'limegreen'};

	// let styles1={fz:b.h,position:'absolute',top:b.y,left:b.x,align:'center',h:b.h,w:b.w,fg:'limegreen'};
	// copyKeys(styles,styles1);
	// let d=mDiv(document.body,styles1,null,'hallo'); //'&#10003;');
	// Markers.push(d);

}

function create_marker(text) {
	let d = mCreate('div');
	d.innerHTML = text; // MarkerText[markerId]; //>0? '✔️':'❌';
	mStyle(d,{position:'fixed',fz:50});
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function mp_over(d, dParent, fz, color, picStyle) {
	let b = getRect(dParent);
	let cx = b.w / 2 + b.x;
	let cy = b.h / 2 + b.y;
	d.style.top = picStyle == 'segoeBlack' ? ((cy - fz * 2 / 3) + 'px') : ((cy - fz / 2) + 'px');
	d.style.left = picStyle == 'segoeBlack' ? ((cx - fz / 3) + 'px') : ((cx - fz * 1.2 / 2) + 'px');
	d.style.color = color;
	d.style.fontSize = fz + 'px';
	d.style.display = 'block';
	return d;
}
//#endregion