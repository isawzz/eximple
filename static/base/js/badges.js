//#region Badges
var Badges = [];
function clearBadges() {
	removeBadges(null, 0);
	Badges = [];
	//hide(dLeiste);
}
function removeBadges(dParent, level) {
	while (Badges.length > level) {
		let badge = Badges.pop();
		//console.log(badge)
		mRemove(iDiv(badge));
	}
}
function addBadge(dParent, level, clickHandler, animateRubberband = false) {
	let fg = '#00000080';
	let textColor = 'white';
	//let stylesForLabelButton = { rounding: 8, margin: 4 };
	//const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let isText = true; let isOmoji = false;
	let i = level - 1;
	let key = levelKeys[i];
	let k = replaceAll(key, ' ', '-');

	let item = getItem(k);
	let label = item.label = "level " + i;
	let h = window.innerHeight;
	let sz = h / 14;
	let options = _simpleOptions({ w: sz, h: sz, fz: sz / 4, fzPic: sz / 2, bg: levelColors[i], fg: textColor });
	//console.log('options.....',options);
	options.handler = clickHandler;
	let d = makeItemDiv(item, options);
	//console.log(d)
	mAppend(dParent, d);

	item.index = i;
	Badges.push(item);
	return arrLast(Badges);
	// let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	// d1.id = 'dBadge_' + i;

	// let info = Syms[k];
	// let label = "level " + i;
	// let h = window.innerHeight; let hBadge = h / 14;
	// let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	// d1.id = 'dBadge_' + i;
	// if (animateRubberband) mClass(d1, 'aniRubberBand');
	// if (isdef(clickHandler)) d1.onclick = clickHandler;
	// Badges.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
	// return arrLast(Badges);
}
function _simpleOptions(options = {}, defsOuter = {}) {
	//_simpleOptions({w:sz,h:sz,fz:sz/4,fzPic:sz/2,bg:levelColors[i], fg: textColor});	
	options.showPic = valf(options.showPic, isdef(options.fzPic));
	options.showLabels = isdef(options.fz);
	options.szPic = { w: options.w, h: options.h };
	//options.ifs = { bg: options.bg, fg: options.fg };
	options.fzText = options.fz;

	if (nundef(options.rounding)) options.rounding = 4;
	if (nundef(options.margin)) options.margin = 4;
	if (nundef(options.padding)) options.padding = 0;

	if (nundef(options.labelStyles)) options.labelStyles = {};

	if (options.showLabels) { if (nundef(options.labelPos)) options.labelBottom = true; options.labelStyles.fz = options.fzText; }

	options.picStyles = { fz: options.fzPic };

	let [w, h] = [options.szPic.w, options.szPic.h];
	options.outerStyles = {
		w: w, h: h, bg: options.bg, fg: options.fg,
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		padding: 0, box: true, margin: options.margin, rounding: options.rounding,
	};
	if (isdef(defsOuter)) addKeys(defsOuter, options.outerStyles);

	return options;
}

function showBadges(dParent, level, clickHandler, maxlevel) {
	clearElement(dParent);
	Badges = [];
	//console.log('maxlevel', maxlevel, 'level', level)
	for (let i = 1; i <= maxlevel + 1; i++) {
		if (i > level) {
			let b = addBadge(dParent, i, clickHandler, false);
			//console.log('badge', i, 'is', b)
			b.live.div.style.opacity = .25;
			b.achieved = false;
		} else {
			let b = addBadge(dParent, i, clickHandler, true);
			b.achieved = true;
		}
	}
	//console.log(Badges)
}
function onClickBadgeX(ev, uname, gname) {
	//console.log('NEW! haaaaaaaaaaaaaaaalo', ev)
	stop_game(); //enterInterruptState();
	let item = evToItem(ev);
	setBadgeLevel(item.index);
	set_startlevel(uname, gname, item.index);
	auxOpen = false;
	TOMain = setTimeout(open_prompt, 100);
}
function setBadgeLevel(i, uname, gname, maxlevel) {
	level = i;

	if (isEmpty(Badges)) showBadges(dLeiste, level, ev => onClickBadgeX(ev, uname, gname), maxlevel);

	//console.log('Badges',Badges);
	for (let iBadge = 0; iBadge < level; iBadge++) {
		let d1 = iDiv(Badges[iBadge]);
		d1.style.opacity = .75;
		d1.style.border = 'transparent';
		// d1.children[1].innerHTML = '* ' + iBadge + ' *'; //style.color = 'white';
		d1.children[1].innerHTML = '* ' + (iBadge + 1) + ' *'; //style.color = 'white';
		d1.children[0].style.color = 'white';
	}
	let d = iDiv(Badges[level]);
	d.style.border = '1px solid #00000080';
	d.style.opacity = 1;
	// d.children[1].innerHTML = 'Level ' + level; //style.color = 'white';
	d.children[1].innerHTML = 'Level ' + (level + 1); //style.color = 'white';
	d.children[0].style.color = 'white';
	for (let iBadge = level + 1; iBadge < Badges.length; iBadge++) {
		let d1 = iDiv(Badges[iBadge]);
		d1.style.border = 'transparent';
		d1.style.opacity = .25;
		// d1.children[1].innerHTML = 'Level ' + iBadge; //style.color = 'white';
		d1.children[1].innerHTML = 'Level ' + (iBadge + 1); //style.color = 'white';
		d1.children[0].style.color = 'black';
	}
	return level;
}
