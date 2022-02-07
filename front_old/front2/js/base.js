//#region m
function miAddLabel(item, styles) {
	let d = iDiv(item);
	//console.log('firstChild',d.firstChild, getTypeOf(d.firstChild));
	if (getTypeOf(d.firstChild) == 'Text') {
		let handler = d.onmousedown;
		d.onmousedown = null;
		let dPic = d;
		let dParent = d.parentNode;
		let outerStyles = jsCopy(styles);
		addKeys({
			display: 'inline-flex', 'flex-direction': 'column',
			'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		}, outerStyles);
		//console.log('outerStyles',outerStyles)
		d = mDiv(dParent, outerStyles);
		mAppend(d, dPic);
		d.onmousedown = handler;
		let dLabel = mText(item.label, d, { fz: valf(styles.fz, 20) });
		iAdd(item, { div: d, dPic: dPic, dLabel: dLabel, options: outerStyles });
	} else if (nundef(iLabel(item))) {
		let dLabel = mText(item.label, d, { fz: valf(styles.fz, 20) });
		iAdd(item, { dLabel: dLabel });
		//console.log('this is not a pure pic, it HAS an OUTERDIV!!! (not impl)')
	}
	return d;
}
function translateToCssStyle(prop, val) { return mStyleTranslate(prop, val); }
function translateStylesToCy(styles, group) {
	//group can be 'node','edge','outer','inner',...
	//returns a dictionary
	let di = {};
	for (const k in styles) {
		let v = styles[k];
		let [prop, val] = translateToCssStyle(k, v, true);
		//console.log('prop',prop)
		if (group == 'edge' && k == 'bg') di['line-color'] = val;
		else if (prop == 'shape' && val == 'hex') {
			//console.log('hallo!!!')
			di.shape = 'polygon';
			di['shape-polygon-points'] = [0, -1, 1, -0.5, 1, 0.5, 0, 1, -1, 0.5, -1, -0.5];
		}
		else di[prop] = val;
	}
	return di;

}
function getBorderPropertyForDirection(dir) { return { 0: 'border-top', 1: 'border-right', 2: 'border-bottom', 3: 'border-left' }[dir]; }

function mAddContentAndMeasureW(d, content, styles, opt) { return mAddContentAndMeasure(d, content, styles, opt, true, false); }
function mAddContentAndMeasureH(d, content, styles, opt) { return mAddContentAndMeasure(d, content, styles, opt, false, true); }
function mAddContent(d, content, styles, opt) { return mAddContentAndMeasure(d, content, styles, opt, false, false); }
function mAddContentAndMeasure(d, content, styles, opts = {}, wNeeded = true, hNeeded = true) {
	let keepInLine = valf(opts.keepInLine, false);
	let replace = valf(opts.replace, false);
	let newline = valf(opts.newline, false);

	let d1 = content;
	if (isDOM(content)) mAppend(d, content);
	else if (isDict(content)) {
		// console.log('content',content);
		d1 = iDiv(content);
		//console.log('d1', d1, 'isDOM?', isDOM(d1));
		if (isDOM(d1)) {
			//console.log('d', d, 'd1', d1)
			mAppend(d, d1);
		} else if (nundef(d1)) {
			d1 = mDiv(d, { bg: 'random' });
			mNode(content, d1);
		} else {
			//d1 is not a dom, so content is an object that does not have a div
			doms = recFindDOMs(content);
			d1 = mDiv(d, { bg: 'random' });
			for (const dom of doms) { mAppend(d1, dom); }
		}
	} else if (isList(content)) {
		d1 = mDiv(d, { bg: 'random' });
		content = content.join(',');
		d1.innerHTML = content;
	} else if (isString(content) && content[0] === '<') {
		d1 = createElementFromHtml(cont);
		mAppend(d, d1);
	} else {
		d1 = mText(content, d);
	}
	if (replace) clearElement(d);
	if (keepInLine) styles['white-space'] = 'nowrap';
	if (newline) styles.display = 'block';
	if (isdef(styles)) mStyleX(d1, styles);

	if (wNeeded && hNeeded) setSizeNeeded(d);
	else if (wNeeded) setWNeeded(d);
	else if (hNeeded) setHNeeded(d);
	return d1;
}
function mAppend(d, child) { d.appendChild(child); return child; }
function mAttrs(elem, attrs) { for (const k in attrs) { elem.setAttribute(k, attrs[k]); } }
function mBackground(bg, fg) { mStyleX(document.body, { bg: bg, fg: fg }); }
function mBoxFromMargins(dParent, t, r, b, l, styles, id, inner, classes) {
	let d = mDiv(dParent, { position: 'absolute', top: t, right: r, bottom: b, left: l }, id, inner, classes);
	let pos = dParent.style.position;
	if (pos != 'absolute') dParent.style.position = 'relative';
	if (isdef(styles)) mStyleX(d, styles);
	return d;
}
function mButton(caption, handler, dParent, styles, classes, id) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) mStyleX(x, styles);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(id)) x.id = id;
	return x;
}
function mBy(id) { return document.getElementById(id); }
function mCellContent(dCell, styles, html) {
	clearElement(dCell);
	let d = mDiv(dCell, { w: '100%', h: '100%' });
	mCenterCenterFlex(d);
	let d1 = mDiv(d, styles, null, html);
	mCenterCenterFlex(d1);
	return d1;
}
function mCenterAt(d, x, y) {
	let rect = getRect(d);
	mPos(d, x - rect.w / 2, y - rect.h / 2);
	//mPos(d, `calc( ${x}px - 50% )`, `calc( ${y}px - 50% )`); ne, das ist rel to 50% container!!!
}
function mCenterCenterFlex(d) { mCenterFlex(d, true, true, true); }
function mCenterFlexNowrap(d) { mCenterFlex(d, true, true, false); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	mStyleX(d, styles);
	//console.log('d', d)
}
function mCheckit(elem, sz = 50) {
	if (nundef(sz)) sz = getRect(elem).h;
	let d = markerSuccess();
	mpOver(d, elem, sz * (4 / 5), 'limegreen', 'segoeBlack');
	mMoveBy(d, 0, -4);
	return d;
}function mCircle(dParent, x, y, rad, color) {
	let d = mDiv(dParent, { w: 2 * rad, h: 2 * rad, bg: color, rounding: '50%' });
	mCenterAt(d, x, y);
	return d;
}
function mClass0(d) { d.className = ''; }
function mClassReplace(d) { mClass0(d); mClass(...arguments); }
function mClass(d) {
	if (arguments.length == 2 && isList(arguments[1])) for (let i = 0; i < arguments[1].length; i++) d.classList.add(arguments[1][i]);
	else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClassRemove(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mHasClass(elem, classname) { return elem.classList.contains(className); }
function mCheckbox(label, val, dParent, handler, styles) {
	styles.align = 'left';
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '40%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label); //createElementFromHTML(`<label>${label}</label>`);
	let d2 = mDiv(d, { display: 'inline', w: '50%', hpadding: hpad });
	let inp = createElementFromHTML(
		`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` >`);
	mAppend(d2, inp);

	inp.onchange = (ev) => { handler(inp.checked, ev); };
	// inp.onchange = handler;
	return inp;
}
function mColorPickerBehavior(value, targetImage, elem, handler) {
	let hues = arrTake(getHueWheel(value), 10);
	let colorPalette = hues.map(x => anyColorToStandardString(colorHSLBuild(x)));
	let palette = isdef(targetImage) ? getPaletteFromImage(targetImage) : colorPalette;
	mStyleX(elem, { bg: value });
	let inp = new JSColor(elem, { alpha: 'ff', closeButton: true, value: value, palette: palette, });
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mColorPickerControl(label, value, targetImage, dParent, handler, styles) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 6);
	let dLabel = mDiv(d, { 'vertical-align': 'top', w: '35%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);

	let hues = arrTake(getHueWheel(value), 10);
	let colorPalette = hues.map(x => anyColorToStandardString(colorHSLBuild(x)));
	// console.log('targetImage',targetImage, 'value',value, getHueWheel(value),colorPalette);
	// let palette = isdef(targetImage)? getPaletteFromImage(targetImage):getHueWheel(value);
	//console.log('targetImage',targetImage)
	let palette = isdef(targetImage) ? getPaletteFromImage(targetImage) : colorPalette;
	// console.log('palette',palette);

	// let inp = mColorPicker3(d, palette, handler, value);
	// //let elem = mDiv(dParent,{w:50,h:50,display:'inline-block'});
	let elem = mDiv(d, { w: '55%', hpadding: hpad, h: 24, rounding: hpad, display: 'inline-block' });
	let inp = new JSColor(elem, {
		alpha: 'ff',
		closeButton: true,
		value: value,
		palette: palette,
	});
	//inp.onChange = ()=>{let c = inp.toHEXAString(); onColor(c);}
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyleX(d, styles); return d; }
function mDestroy(elem) { if (isString(elem)) elem = mById(elem); purge(elem); } // elem.parentNode.removeChild(elem); }
function mDiv(dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('div');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }

	return d;
}
function mDivItem(dParent,styles,id,content) {
	if (nundef(id)) id=getUID();
	let d=mDiv(dParent,styles,id,content);
	return mItem(id,{div:d});
}
function mDiv100(dParent, styles, id, sizing = true) { let d = mDiv(dParent, styles, id); mSize(d, 100, 100, '%', sizing); return d; }
function mDivRestOfPage(dParent, dAbove, styles, id, inner, classes, sizing) {

	let d = mDiv(dParent, styles, id, inner, classes, sizing);
	let fSize = () => {
		let top = getRect(dAbove).h;
		console.log('top', top, '?');
		let h = window.innerHeight - (isNumber(top) ? top : 31);
		mSize(d, '100%', h);
		setRect(d);
		console.log('d', d);
	};

	new ResizeObserver(() => {
		let r = getRect(dAbove);
		console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaar', r);
		fSize();
		//mSize(d, window.innerWidth, window.innerHeight - r.height);
	}).observe(dAbove);
	window.onresize = fSize;

	return d;
}
function mDover(dParent, styles = {}, sizing = true) {
	// let d = mDiv(dParent, styles); 
	// mIfNotRelative(dParent); 
	// mStyleX(d, { position: 'absolute', w: '100%', h: '100%' }); 
	// setRect(d, sizing); 

	let d = mDiv(dParent, styles);
	mIfNotRelative(dParent);
	//let s = dMain.style.position.toString(); console.log('isdef', isdef(dMain.style.position), s, s == '')
	mStyleX(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	setRect(d, sizing);


	return d;
}
function mDropImage(e, img) {
	var dt = e.dataTransfer;
	console.log('dropped', dt)
	var files = dt.files;
	if (files.length) {
		let imgFile = files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			img.src = e.target.result;
			imgFile.data = e.target.result; //img.toDataURL("image/png");
		}
		reader.readAsDataURL(imgFile);
	} else {
		console.log('dropped on', e.target, 'img', img);
		clearElement(img);
		var html = dt.getData('text/html');
		console.log('__________dataTransfer', html);
		let match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html);
		let url = match && match[1];
		if (url) {
			console.log('JA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
			//previewImageFromUrl(url, img);
			img.onerror = function () {
				alert("Error in uploading");
			}
			img.crossOrigin = ""; // if from different origin, same as "anonymous"
			img.src = url;
		}
	}
}
//#region CLEANUP! edit inputs
function unfocusOnEnter(ev) { if (ev.key === 'Enter') { ev.preventDefault(); mBy('dummy').focus(); } }
function selectText(el) {
	var sel, range;
	if (window.getSelection && document.createRange) { //Browser compatibility
		sel = window.getSelection();
		if (sel.toString() == '') { //no text selection
			window.setTimeout(function () {
				range = document.createRange(); //range object
				range.selectNodeContents(el); //sets Range
				sel.removeAllRanges(); //remove all ranges from selection
				sel.addRange(range);//add Range to a Selection.
			}, 1);
		}
	} else if (document.selection) { //older ie
		sel = document.selection.createRange();
		if (sel.text == '') { //no text selection
			range = document.body.createTextRange();//Creates TextRange object
			range.moveToElementText(el);//sets Range
			range.select(); //make selection.
		}
	}
}
function incInput(inp, n = 1) {
	let val = Number(inp.innerHTML);
	val += n;
	inp.innerHTML = val;
}
function mEditRange(label, value, min, max, step, dParent, handler, styles, classes, id, triggerOnChange = true) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '30%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label); //createElementFromHTML(`<label>${label}</label>`);
	let inpText = createElementFromHTML(`<input type='number'  step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	let inp = createElementFromHTML(`<input type="range" step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	// let inp = createElementFromHTML(`<div contenteditable="true" spellcheck="false">${value}</div>	`)
	mAppend(d, inpText);
	mAppend(d, inp);
	// let button = mButton('+', triggerOnChange ? ev => { incInput(inp); handler(inp.innerHTML, ev); } : ev => { incInput(inp); }, d);
	mStyleX(inpText, { display: 'inline', w: '20%', align: 'left', hpadding: hpad });
	mStyleX(inp, { display: 'inline', w: '40%', hpadding: hpad });

	inpText.onchange = (ev) => { inp.value = inpText.value; handler(inpText.value, ev); };
	// inpText.addEventListener('keydown', unfocusOnEnter);
	// inpText.addEventListener('focusout', ev => { inp.value = inpText.value;handler(inp.innerHTML, ev); });
	inpText.onclick = ev => selectText(ev.target);
	inp.onchange = (ev) => { inpText.value = inp.value; handler(inpText.value, ev); };
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inpText;
}
function mEditNumber(label, value, dParent, handler, styles, classes, id, triggerOnChange = true) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label); //createElementFromHTML(`<label>${label}</label>`);

	let inp = createElementFromHTML(`<div contenteditable="true" spellcheck="false">${value}</div>	`)
	mAppend(d, inp);
	let button = mButton('+', triggerOnChange ? ev => { incInput(inp); handler(inp.innerHTML, ev); }
		: ev => { incInput(inp); }, d);
	mStyleX(inp, { display: 'inline-block', w: '40%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);

	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEdit(label, value, dParent, handler, styles, classes, id) {

	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label); //createElementFromHTML(`<label>${label}</label>`);

	let inp = createElementFromHTML(`<div contenteditable="true" spellcheck="false">${value}</div>	`)
	mAppend(d, inp);
	mStyleX(inp, { display: 'inline-block', w: '50%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);

	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEditX(label, val, dParent, styles, classes, handler, id, opt = {}) {
	let defOptions = {
		alignLabel: 'right',
		fgLabel: 'silver',
		wminLabel: 120,
		alignInput: 'left',
		fgInput: 'white',
		wminInput: 50,
		wminRight: 120,
		align: 'center',

	}
	addKeys(defOptions, opt);
	let wminTotal = wminLabel + wminRight;
	if (nundef(styles)) styles = {};
	if (nundef(styles.wmin)) styles.wmin = 0;
	styles.wmin = Math.max(styles.wmin, wminTotal);
	styles.align = opt.align;
	let dOuter = mDiv(dParent, styles, id, null, classes);
	let dLabel = mDiv(dOuter, { fg: opt.fgLabel, wmin: opt.wminLabel, align: opt.alignLabel }, null, label);
	let dInput = mDiv(dOuter, { contenteditable: true, spellcheck: false, fg: opt.fgInput, wmin: opt.wminInput, align: opt.alignInput }, null, val);
	dInput.onfocusout = ev => handler(dInput.innerHTML, ev);
	dInput.onkeydown = (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	}
	return dInput;
}
function mEditableOnEdited(id, dParent, label, initialVal, onEdited, onOpening, styles, classes) {
	let inp = mEditableInput(dParent, label, initialVal, styles, classes);
	inp.id = id;
	if (isdef(onOpening)) { inp.addEventListener('focus', ev => onOpening(ev)); }
	inp.addEventListener('focusout', ev => {
		window.getSelection().removeAllRanges();
		if (isdef(onEdited)) onEdited(inp.innerHTML, ev);
	});
	return inp;
}
function mEditableInput(dParent, label, val, styles, classes, id) {
	let labelElem = createElementFromHTML(`<span>${label}</span>	`)
	let elem = createElementFromHTML(`<span contenteditable="true" spellcheck="false">${val}</span>	`)
	elem.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
			//if (isdef(handler)) handler(elem.innerHTML, ev); //das ist schon bei mEditableInputOnEdited!!!
		}
	});
	let dui = mDiv(dParent, { margin: 2 });
	mAppend(dui, labelElem);
	mAppend(dui, elem);
	if (isdef(styles)) {
		if (isdef(styles.wInput)) mStyleX(elem, { wmin: styles.wInput });
		mStyleX(elem, styles);
	}
	if (isdef(classes)) mStyleX(elem, classes);
	if (isdef(id)) elem.id = id;

	return elem;
}
//#endregion
function mFlexWrap(d) { mFlex(d, 'w'); }
function mFlex(d, or = 'h') {
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
	// d.style.alignItems = 'stretch';
	// d.style.alignContent = 'stretch';
	// d.style.justiifyItems = 'stretch';
	// d.style.justifyContent = 'stretch';
}
function mgSvg(dParent, attrs) { return mgTag('svg', dParent, attrs); }
function mgText(text, dParent, attrs, styles) { return mgTag('text', dParent, attrs, styles, text); }
function mgTag(tag, dParent, attrs, styles = {}, innerHTML) {
	let elem = gCreate(tag);
	mStyleX(elem, styles);
	mAttrs(elem, attrs);
	if (isdef(innerHTML)) elem.innerHTML = innerHTML;
	if (isdef(dParent)) mAppend(dParent, elem);
	return elem;
}

function mGap(d, gap = 4) { mText('_', d, { fg: 'transparent', fz: gap, h: gap, w: '100%' }); }
function mGrid(rows, cols, dParent, styles = {}) {
	//styles.gap=valf(styles.gap,4);
	let d = mDiv(dParent, styles);
	d.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
	d.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
	d.style.display = 'inline-grid';
	d.style.padding = valf(styles.padding, styles.gap) + 'px';
	return d;
}
function mHasClass(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}
function mIfNotRelative(d) { if (isEmpty(d.style.position)) d.style.position = 'relative'; }
function mImage() { return mImg(...arguments); }
function mImg(path, dParent, styles, classes, callback) {
	//console.log('_______________',path)
	let d = mCreate('img');
	if (isdef(callback)) d.onload = callback;
	d.src = path;
	mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);

	if (isdef(styles.w)) d.setAttribute('width', styles.w + 'px');
	if (isdef(styles.h)) d.setAttribute('height', styles.h + 'px');


	return d;
	//<img src="kiwi.svg" alt="Kiwi standing on oval"></img>
}
function mInner(html, dParent, styles) { dParent.innerHTML = html; if (isdef(styles)) mStyleX(dParent, styles); }
function mInput(label, value, dParent, styles, classes, id) {
	let inp = createElementFromHTML(`<input type="text" value="${value}" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(dParent, labelui);
	mAppend(labelui, inp);
	if (isdef(styles)) mStyleX(labelui, styles);
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mInsertAt(dParent, el, index = 0) { mInsert(dParent, el, index); }
function mInsertFirst(dParent, el) { mInsert(dParent, el, 0); }
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); }
function mInsertAfter(dParent, el, index = 0) { dParent.insertAfter(el, dParent.childNodes[index]); }
function mItem(id, diDOM, di = {}, addSizing = false) {
	let item = di;
	id = isdef(id) ? id : isdef(diDOM) && isdef(diDOM.div) && !isEmpty(diDOM.div.id) ? diDOM.div.id : getUID();
	item.id = iRegister(item, id);
	if (isdef(diDOM) && isdef(diDOM.div)) { diDOM.div.id = id; iAdd(item, diDOM); }
	if (addSizing) {
		if (nundef(item.sizing)) item.sizing = 'sizeToContent';
		if (nundef(item.positioning)) { item.positioning = 'absolute'; }
		if (nundef(item.posType)) { item.posType = 'center'; }
		if (isdef(diDOM) && item.sizing == 'sizeToContent') iMeasure(item, item.sizingOptions);
	}
	return item;
}
function mLabel(text, dParent, styles = {}, forId, classes) {
	let l = mCreate('label');
	l.innerHTML = text;
	mAppend(dParent, l);
	mStyleX(l, styles);
	if (isdef(classes)) mClass(l, classes);
	if (isdef(forId)) { console.log('JA'); l.setAttribute('for', forId); }
	return l;
}
function mLinebreakNew(d, gap) { mGap(d, gap); }
function mLinebreak(dParent, gap) {
	if (isString(dParent)) dParent = mBy(dParent);
	let d = mDiv(dParent);
	if (dParent.style.display == 'flex' || mHasClass(dParent, 'flexWrap')) mClass(d, 'linebreak');
	else d.innerHTML = '<br>';
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }//return mLinebreak(dParent);}
	return d;
}
function mLine3(dParent, index, ids, styles) {
	let html = `<div class="lineOuter">
		<div>
			<div id="${ids[0]}" class="lineLeft"> </div>
			<div id="${ids[1]}" class="lineMiddle"> </div>
			<div id="${ids[2]}" class="lineRight"> </div>
		</div>
	</div>
	`;
	let x = createElementFromHTML(html);

	mInsert(dParent, x, index);
	return [mBy(ids[0]), mBy(ids[1]), mBy(ids[2])];
}
function mMeasure(d) { let r = getRect(d); mStyleX(d, { w: r.w, h: r.h }); return r; }
function mMoveBy(elem, dx, dy) { let rect = getRect(elem); mPos(elem, rect.x + dx, rect.y + dy); }
function mNode(o, dParent, title, isSized = false) {
	let d = mCreate('div');
	mYaml(d, o);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	if (isDict(o)) d.style.textAlign = 'left';
	if (isSized) addClass(d, 'centered');

	return d;
}
function mNodeChangeContent(ui, content) {
	let domel = ui.getElementsByTagName('pre')[0];
	domel.innerHTML = jsonToYaml(content);

}
function mNull(d, attr) { d.removeAttribute(attr); }
function mPanel(dParent) {
	//returns a standard panel div mit centercenterflex and position relative
	let d = mDiv(dParent, { position: 'relative' });
	// console.log('d.minWidth', d.style.minWidth)
	mCenterCenterFlex(d);
	// console.log('d.minWidth', d.style.minWidth)
	return d;
}
function mParent(elem) { return elem.parentNode; }
function mPic(kItem, dParent, styles, classes) {
	let item;
	if (isString(kItem)) { item = { id: getUID(), key: kItem, info: Syms[kItem] }; }
	else if (nundef(kItem.info)) { item = { id: getUID(), key: kItem.key, info: kItem }; }
	else item = kItem;

	let info = item.info;
	let dOuter = mDiv(dParent);
	mCenterCenterFlex(dOuter);
	let d = mDiv(dOuter);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let picStyles = { family: info.family, fz: valf(styles.fz, valf(styles.h / 2, 25)), display: 'inline-block' };
	mStyleX(dOuter, styles);
	mStyleX(d, picStyles);
	if (isdef(classes)) mClass(dOuter, classes);

	iAdd(item, { div: dOuter, dPic: d });
	return item;
}
function miPic(item, dParent, styles, classes) {
	let info = isString(item) ? Syms[item] : isdef(item.info) ? item.info : item;
	let d = mDiv(dParent);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	addKeys({ family: info.family, fz: 50, display: 'inline-block' }, styles);
	mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	mCenterCenterFlex(d);
	return d;
}
function mPlace(elem, pos, mavert = 4, mahor) {
	// pos is: tl, tb, bl, br or cl, cr, tc, bc, cc

	pos = pos.toLowerCase();
	let dCard = elem.parentNode; if (dCard.style.position != 'absolute') dCard.style.position = 'relative';
	let vert = mavert; // valf(margin, Math.max(wSym,hSym) / 10); //0;
	let hor = isdef(mahor) ? mahor : mavert;

	//console.log('v',v)

	if (pos[0] == 'c' || pos[1] == 'c') {
		let rCard = getRect(dCard);
		let [wCard, hCard] = [rCard.w, rCard.h];
		let rSym = getRect(elem);
		let [wSym, hSym] = [rSym.w, rSym.h];
		//console.log('_____________\nelem',elem,'\nrect',rSym,'v',v)
		switch (pos) {
			case 'cc': mStyleX(elem, { position: 'absolute', left: (wCard - wSym) / 2, top: (hCard - hSym) / 2 }); break;
			case 'tc': mStyleX(elem, { position: 'absolute', left: (wCard - wSym) / 2, top: vert }); break;
			case 'bc': mStyleX(elem, { position: 'absolute', left: (wCard - wSym) / 2, bottom: vert }); break;
			case 'cl': mStyleX(elem, { position: 'absolute', left: hor, top: (hCard - hSym) / 2 }); break;
			case 'cr': mStyleX(elem, { position: 'absolute', right: hor, top: (hCard - hSym) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	elem.style.position = 'absolute';
	elem.style[di[pos[0]]] = hor + 'px'; elem.style[di[pos[1]]] = vert + 'px';

}
function mPos(d, x, y, unit = 'px') { mStyleX(d, { left: x, top: y, position: 'absolute' }, unit); }
function mPosTL(d, x, y, unit = 'px') { y = valf(y, x); mStyleX(d, { left: x, top: y, position: 'absolute' }, unit); }
function mPosTR(d, x, y, unit = 'px') { y = valf(y, x); mStyleX(d, { right: x, top: y, position: 'absolute' }, unit); }
function mPosBL(d, x, y, unit = 'px') { y = valf(y, x); mStyleX(d, { left: x, bottom: y, position: 'absolute' }, unit); }
function mPosBR(d, x, y, unit = 'px') { y = valf(y, x); mStyleX(d, { right: x, bottom: y, position: 'absolute' }, unit); }
function mPosBottom(d, x, y, unit = 'px') { mStyleX(d, { left: x, bottom: y, position: 'absolute' }, unit); }
function mPosBottomRight(d, x, y, unit = 'px') { mStyleX(d, { right: x, bottom: y, position: 'absolute' }, unit); }
function mPosRight(d, x, y, unit = 'px') { mStyleX(d, { right: x, top: y, position: 'absolute' }, unit); }
function mRadio(label, val, dParent, styles = {}, handler, group_id) {
	//console.log('label',label,'val',val);
	let cursor = styles.cursor; delete styles.cursor; //styles.cursor = 'pointer';

	let d = mDiv(dParent, styles, group_id + '_' + val);
	let inp = createElementFromHTML(`<input class='radio' id='i_${group_id}_${val}' type="radio" name="${group_id}" value="${val}" >`);
	let text = createElementFromHTML(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) d.onclick = () => handler(val);

	return d;
}
function mRadioGroup(dParent, styles, id, legend) {
	let f = mCreate('fieldset');
	f.id = id;
	if (isdef(styles)) mStyleX(f, styles);
	let l = mCreate('legend');
	l.innerHTML = legend;
	mAppend(f, l);
	mAppend(dParent, f);
	return f;
}
function mRemove(elem) { mDestroy(elem); }
function mRemoveChildrenFromIndex(dParent, i) { while (dParent.children[i]) { mRemove(dParent.children[i]); } }
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mRemoveStyle(d, styles) { for (const k of styles) d.style[k] = null; }
function mReveal(d) { d.style.opacity = 1; }
function mScreen(dParent, styles) { let d = mDover(dParent); if (isdef(styles)) mStyleX(d, styles); return d; }
function mSelect(dParent, optionList, friendlyList, initval, onselect, label, styles, classes) {

	//console.log('vals:',optionList,'\nfriendly',friendlyList,'\ninitval',initval,'\nonselect',onselect,'\nlabel',label)
	let d = mDiv(dParent);
	val = valf(initval, optionList[0]);

	let inp = mCreate('select');
	inp.onchange = onselect;

	for (let i = 0; i < optionList.length; i++) {

		let opt = optionList[i];
		let friendly = friendlyList[opt];

		let el = mCreate('option');
		el.setAttribute('value', opt);
		el.innerHTML = friendly;
		mAppend(inp, el);
		if (opt == val) el.selected = true;
	}

	mAppend(d, inp);

	if (isdef(styles)) mStyleX(inp, styles);
	if (isdef(classes)) mClass(inp, classes);
	return d;
}
function mSidebar(title, dParent, styles, id, inner) {

	let elem = createElementFromHtml(`
	<div id="${id}" class="w3sidebar">
		<h1>${title}</h1>
	  <a href="javascript:void(0)" class="closebtn">×</a>
	</div>	
	`);
	function openNav() {
		elem.style.width = "250px";
		dParent.style.marginLeft = "250px";
	}

	function closeNav() {
		elem.style.width = "0";
		dParent.style.marginLeft = "0";
	}

	elem.children[1].onclick = closeNav;
	mClass(dParent, 'w3sidebarParent');
	let dContent = mDiv(elem);
	mInsert(dParent.parentNode, elem);
	return { div: elem, dContent: dContent, fOpen: openNav, fClose: closeNav };
}
function mSize(d, w, h, unit = 'px', sizing) { if (nundef(h)) h = w; mStyleX(d, { width: w, height: h }, unit); if (isdef(sizing)) setRect(d, sizing); }
function mSpan(dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('span');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }

	return d;
}
function mShape(shape, dParent, styles, pos, classes) {
	styles = valf(styles, { bg: 'random' });
	styles.display = 'inline-block';
	let x;
	if (isdef(PolyClips[shape])) {
		let d = mDiv(dParent, styles, null, null, classes);
		styles['clip-path'] = PolyClips[shape];
		mStyleX(d, styles);
		x = d;
		// return drawShape(shape,dParent,styles,classes);
	} else {
		styles.rounding = shape == 'circle' || shape == 'ellipse' ? '50%' : styles.rounding;
		x = mDiv(dParent, styles, null, null, classes);
	}
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mShapeR(shape = 'hex', dParent = null, styles = {}, pos, classes) {
	let x;
	let bg = isdef(styles.bg) ? computeColorX(styles.bg) : 'conic-gradient(green,pink,green)';
	let sz = isdef(styles.sz) ? styles.sz : isdef(styles.w) ? styles.w : isdef(styles.h) ? styles.h : null;
	if (isdef(PolyClips[shape])) {
		sz = valf(sz, 80);
		let html = `<div style=
		"--b:${bg};
		--clip:${PolyClips[shape]};
		--patop:100%;
		--w:${sz}px;
		"></div>`;
		x = createElementFromHtml(html);
	} else {
		x = mShape(shape, dParent, styles, pos, classes);
		return x;
	}
	if (sz) {
		bvar = sz > 120 ? 8 : sz > 80 ? 5 : sz > 50 ? 3 : 1;
		mClass(x, "weired" + bvar);
		mStyleX(x, { w: sz });
	}
	if (isdef(dParent)) mAppend(dParent, x);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;

}
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	styles.family = info.family;
	//console.log('vorher: styles',jsCopy(styles))
	let sizes;
	//find best fitting of this sym:
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, CSZ / 8); }

	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	//console.log('sizes',sizes)
	//console.log('styles',styles)
	// let sz = isdef(styles.sz) ? styles.sz : isdef(styles.w) ? styles.w : isdef(styles.h) ? styles.h : null;
	// //for (const k of ['sz', 'w', 'h']) delete styles[k];
	// styles.fz = sz * .75; //MAGIC NUMBER!	// styles.w = styles.fz * 1.25;	// //styles.h = styles.fz;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }

	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mSuit(key, d, styles, pos, classes) {
	let svg = gCreate('svg');
	//svg.setAttribute('height', 25); //geht!!!
	let el = gCreate('use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
	mAppend(svg, el);
	if (isdef(d)) mAppend(d, svg);
	styles = valf(styles, { bg: 'random' });
	let sz = isdef(styles.h) ? styles.h : isdef(styles.sz) ? styles.sz : styles.w;
	if (isdef(sz)) { el.setAttribute('height', sz); svg.setAttribute('sz', sz); }
	mStyleX(el, styles);

	if (isdef(classes)) mClass(svg, classes);
	if (isdef(d)) { mAppend(d, svg); gSizeToContent(svg); }

	//geht nur fuer eck positions!
	if (isdef(pos)) { mSuitPos(svg, pos); }
	// 	pos = pos.toLowerCase();
	// 	let di={t:'top',b:'bottom',r:'right',l:'left'};
	// 	svg.style.position = 'absolute';
	// 	svg.style[di[pos[0]]] = svg.style[di[pos[1]]] = 0;
	// }
	return svg;
}
function mSuitPos(svg, pos) {
	// pos is: tl, tb, bl, br or cl, cr, tc, bc, cc
	pos = pos.toLowerCase();

	if (pos[0] == 'c' || pos[1] == 'c') {
		let dCard = svg.parentNode;
		let r = getRect(dCard);
		let [wCard, hCard] = [r.w, r.h];
		let [wSym, hSym] = [svg.getAttribute('width'), svg.getAttribute('height')];

		switch (pos) {
			case 'cc': mStyleX(svg, { position: 'absolute', left: (wCard - wSym) / 2, top: (hCard - hSym) / 2 }); break;
			case 'tc': mStyleX(svg, { position: 'absolute', left: (wCard - wSym) / 2, top: 0 }); break;
			case 'bc': mStyleX(svg, { position: 'absolute', left: (wCard - wSym) / 2, bottom: 0 }); break;
			case 'cl': mStyleX(svg, { position: 'absolute', left: 0, top: (hCard - hSym) / 2 }); break;
			case 'cr': mStyleX(svg, { position: 'absolute', right: 0, top: (hCard - hSym) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	svg.style.position = 'absolute';
	svg.style[di[pos[0]]] = svg.style[di[pos[1]]] = 0;
}
function mSuitSize(suit, sz) { suit.setAttribute('sz', sz); suit.firstChild.setAttribute('height', sz); gSizeToContent(suit); }

function mStyleTranslate(prop, val, convertNumbers = true) {
	const paramDict = {
		align: 'text-align',
		bg: 'background-color',
		fg: 'color',
		hgap: 'column-gap',
		vgap: 'row-gap',
		matop: 'margin-top',
		maleft: 'margin-left',
		mabottom: 'margin-bottom',
		maright: 'margin-right',
		patop: 'padding-top',
		paleft: 'padding-left',
		pabottom: 'padding-bottom',
		paright: 'padding-right',
		rounding: 'border-radius',
		w: 'width',
		h: 'height',
		wmin: 'min-width',
		hmin: 'min-height',
		wmax: 'max-width',
		hmax: 'max-height',
		fontSize: 'font-size',
		fz: 'font-size',
		family: 'font-family',
		weight: 'font-weight',
		z: 'z-index'
	};
	let valDict = {
		random: randomColor(),

	};
	let propName = isdef(paramDict[prop]) ? paramDict[prop] : prop;
	let newVal = isdef(valDict[val]) ? valdict[val] : val;
	if (convertNumbers && isNumber(newVal)) newVal = '' + newVal + 'px';
	return [propName, newVal];

}
function mStyleToCy(di, group) { return translateStylesToCy(di, group); }
const STYLE_PARAMS = {
	align: 'text-align',
	bg: 'background-color',
	fg: 'color',
	hgap: 'column-gap',
	vgap: 'row-gap',
	matop: 'margin-top',
	maleft: 'margin-left',
	mabottom: 'margin-bottom',
	maright: 'margin-right',
	patop: 'padding-top',
	paleft: 'padding-left',
	pabottom: 'padding-bottom',
	paright: 'padding-right',
	rounding: 'border-radius',
	w: 'width',
	h: 'height',
	wmin: 'min-width',
	hmin: 'min-height',
	wmax: 'max-width',
	hmax: 'max-height',
	fontSize: 'font-size',
	fz: 'font-size',
	family: 'font-family',
	weight: 'font-weight',
	z: 'z-index'
};
function mStyleX(elem, styles, unit = 'px') {

	if (isdef(styles.vmargin)) { styles.mabottom = styles.matop = styles.vmargin; }
	if (isdef(styles.hmargin)) { styles.maleft = styles.maright = styles.hmargin; }

	const paramDict = {
		align: 'text-align',
		bg: 'background-color',
		fg: 'color',
		hgap: 'column-gap',
		vgap: 'row-gap',
		matop: 'margin-top',
		maleft: 'margin-left',
		mabottom: 'margin-bottom',
		maright: 'margin-right',
		patop: 'padding-top',
		paleft: 'padding-left',
		pabottom: 'padding-bottom',
		paright: 'padding-right',
		rounding: 'border-radius',
		w: 'width',
		h: 'height',
		wmin: 'min-width',
		hmin: 'min-height',
		wmax: 'max-width',
		hmax: 'max-height',
		fontSize: 'font-size',
		fz: 'font-size',
		family: 'font-family',
		weight: 'font-weight',
		z: 'z-index'
	};

	//console.log(':::::::::styles',styles)
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = getExtendedColors(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {

		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
		//console.log('::::::::::::::', styles.vpadding, styles.hpadding)
	}
	if (isdef(styles.upperRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	} else if (isdef(styles.lowerRounding)) {
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		let rtop = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}

	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	//console.log(styles.bg,styles.fg);

	for (const k in styles) {
		//if (k=='textShadowColor' || k=='contrast') continue; //meaningless styles => TBD
		let val = styles[k];
		let key = k;
		if (isdef(paramDict[k])) key = paramDict[k];
		else if (k == 'font' && !isString(val)) {
			//font would be specified as an object w/ size,family,variant,bold,italic
			// NOTE: size and family MUST be present!!!!!!! in order to use font param!!!!
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'classname') {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			//console.log('________________________YES!')
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				//console.log('sssssssssssssssssssssssssssssssssssssssssssss')
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];

				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				//layout:'g_15_240' 15 columns, each col 240 pixels wide
				//console.log('sssssssssssssssssssssssssssssssssssssssssssss')
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}


		//console.log(key,val,isNaN(val));if (isNaN(val) && key!='font-size') continue;

		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') elem.style.flexWrap = 'wrap';
		else if (startsWith(key, 'dir')) {
			isCol = val[0] == 'c';
			elem.style.flexDirection = isCol ? 'column' : 'row';
			//in order for this to work, HAVE TO set wmax or hmax!!!!!!!!!!!!!
			if (isCol && nundef(styles.hmax)) {
				let rect = getRect(elem.parentNode); //console.log('rect', rect);
				elem.style.maxHeight = rect.h * .9;
				elem.style.alignContent = 'start';
			} else if (nundef(styles.wmax)) elem.style.maxWidth = '90%';
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			//console.log('set property',key,makeUnitString(val,unit),val,isNaN(val));
			//if ()
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}
function mGetStyleX(elem, prop) {
	let val;
	if (isdef(STYLE_PARAMS[prop])) { val = elem.style[STYLE_PARAMS[prop]]; }
	else {
		switch (prop) {
			case 'vmargin': val = stringBefore(elem.style.margin, ' '); break;
			case 'hmargin': val = stringAfter(elem.style.margin, ' '); break;
			case 'vpadding': val = stringBefore(elem.style.padding, ' '); break;
			case 'hpadding': val = stringAfter(elem.style.padding, ' '); break;
			case 'box': val = elem.style.boxSizing; break;
			case 'dir': val = elem.style.flexDirection; break;
		}
	}
	if (nundef(val)) val = elem.style[prop];
	if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mSwap(obj1, obj2) {
	// save the location of obj2
	var parent2 = obj2.parentNode;
	var next2 = obj2.nextSibling;
	// special case for obj1 is the next sibling of obj2
	if (next2 === obj1) {
		// just put obj1 before obj2
		parent2.insertBefore(obj1, obj2);
	} else {
		// insert obj2 right before obj1
		obj1.parentNode.insertBefore(obj2, obj1);

		// now insert obj1 where obj2 was
		if (next2) {
			// if there was an element after obj2, then insert obj1 right before that
			parent2.insertBefore(obj1, next2);
		} else {
			// otherwise, just append as last child
			parent2.appendChild(obj1);
		}
	}
}
function mText(text, dParent, styles, classes) {
	if (!isString(text)) text = text.toString();
	let d = mDiv(dParent);
	if (!isEmpty(text)) { d.innerHTML = text; }
	//console.log('text',text,typeof(text),isString(text),isEmpty(text),d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTextArea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}" rows="${rows}" cols="${cols}" wrap="hard"></textarea>`;
	let t = createElementFromHTML(html);
	mAppend(dParent, t);
	mStyleX(t, styles);
	return t;
}
function mTextFit(text, { wmax, hmax }, dParent, styles, classes) {
	//mTextFit(label,maxchars,maxlines, d, textStyles, ['truncate']);
	let d = mDiv(dParent);
	if (!isEmpty(text)) d.innerHTML = text;

	//console.log('_______',wmax,hmax)
	if (nundef(styles) && (isdef(wmax) || isdef(hmax))) {
		styles = {};
	}
	if (isdef(wmax)) styles.width = wmax;
	if (isdef(hmax)) styles.height = hmax;

	//console.log('_',text,styles)

	if (isdef(styles)) mStyleX(d, styles);

	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTitledDiv(title, dParent, outerStyles = {}, innerStyles = {}, id) {
	let d = mDiv(dParent, outerStyles);
	let dTitle = mDiv(d);
	dTitle.innerHTML = title;
	innerStyles.w = '100%';
	innerStyles.h = outerStyles.h - getRect(dTitle).h;
	let dContent = mDiv(d, innerStyles, id);
	return dContent;
}
function mTitledMessageDiv(title, dParent, id, outerStyles = {}, contentStyles = {}, titleStyles = {}, messageStyles = {}, titleOnTop = true) {
	let d = mDiv(dParent, outerStyles, id);
	//console.log('outerStyles',outerStyles);
	let dTitle = mDiv(d, titleStyles, id + '.title'); dTitle.innerHTML = title;
	let dMessage = mDiv(d, messageStyles, id + '.message'); dMessage.innerHTML = 'hallo!';
	contentStyles.w = '100%';
	let hTitle = getRect(dTitle).h, hMessage = getRect(dMessage).h, hArea = getRect(d).h;
	let hContent = hArea - hTitle - hMessage - 4;
	mStyleX(dMessage, { h: hMessage + 2 });
	mStyleX(dTitle, { h: hTitle + 2 });
	contentStyles.hmin = hContent;
	let dContent = mDiv(d, contentStyles, id + '.content');
	if (!titleOnTop) { mAppend(d, dTitle); }
	return d;
}
function mToggle(label, val, dParent, styles = {}, is_on = true) {
	//console.log('label',label,'val',val);

	let cursor = styles.cursor; delete styles.cursor; //styles.cursor = 'pointer';
	//console.log('cursor is',cursor);

	let d = mDiv(dParent, styles);
	let id = getUID();
	let inp = createElementFromHTML(`<input class='radio' id='${id}' type="checkbox" checked="${is_on}" value="${val}" >`);
	let text = createElementFromHTML(`<label for='${id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }

	mAppend(d, inp);
	mAppend(d, text);
	//if (isdef(handler)) inp.onclick = ev => {ev.cancelBubble=true;handler(val);}
	return d;
}
function mToggle_orig_BROKEN(label, val, dParent, styles = {}, handler = null, is_on = true) {
	//console.log('label',label,'val',val);

	let cursor = styles.cursor; delete styles.cursor; //styles.cursor = 'pointer';
	//console.log('cursor is',cursor);

	let d = mDiv(dParent, styles);
	let id = getUID();
	let inp = createElementFromHTML(`<input class='radio' id='${id}' type="checkbox" checked="${is_on}" value="${val}" >`);
	let text = createElementFromHTML(`<label for='${id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }

	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) inp.onclick = ev => { ev.cancelBubble = true; handler(val); }
	return d;
}
function mToggleStyle(d, prop, val1, val2) {
	let val = d.style[prop]; //$(d).style(prop);
	if (val === null && val1 == 0) val = val1;
	else if (isNumber(val1)) val = firstNumber(val);
	//console.log('=>mToggleStyle:val', val, 'val1', val1, 'set', prop, '=', val == val1 ? val2 : val1)
	if (val == val1) d.style[prop] = makeUnitString(val2); else d.style[prop] = makeUnitString(val1);

}
function mXit(elem, sz = 50) {
	//console.log('hallo mXit!!!')

	if (nundef(sz)) sz = getRect(elem).h;
	let d = markerFail();
	mpOver(d, elem, sz / 2, 'red', 'openMojiTextBlack');
	mMoveBy(d, 0, -4);
	return d;
}
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
	// d.innerHTML = '<pre class="info">' + jsonToYaml(js) + '</pre>'; 
}
function mZone(dParent, styles, pos) {
	//console.log('mZone',dParent,styles,pos)
	let d = mDiv(dParent);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(pos)) {
		mIfNotRelative(dParent);
		mPos(d, pos.x, pos.y);
	}
	return d;
}


//#endregion

//#region i
var ZMax = 0;
function diMessage(item) { return isdef(item.live) ? item.live.dMessage : null; }
function diTitle(item) { return isdef(item.live) ? item.live.dTitle : null; }
function diContent(item) { return isdef(item.live) ? item.live.dContent : null; }
function infoToItem(x) { let item = { info: x, key: x.key }; item.id = iRegister(item); return item; }
function isItem(i) { return isdef(i.live) || isdef(i.div); }

function iAdd(item, props) {
	let id, l;
	if (isString(item)) { id = item; item = Items[id]; }
	else if (nundef(item.id)) { id = item.id = iRegister(item); }
	else { id = item.id; if (nundef(Items[id])) Items[id] = item; }
	if (nundef(item.live)) item.live = {};
	l = item.live;
	for (const k in props) {
		let val = props[k];
		if (nundef(val)) {
			//console.log('k', k, 'item', item, 'props', props);
			continue;
		}
		l[k] = val;
		if (k == 'div') val.id = id;
		if (isdef(val.id) && val.id != id) {
			//console.log('adding', val.id, 'as member of', id)
			lookupAddIfToList(val, ['memberOf'], id);
		}
	}
}
function iContainer(dParent, styles, classes, id, inner) {
	let item = { id: isdef(id) ? id : getUID(), type: 'plain' };
	let dOuter = mDiv(dParent);
	let dInner = mDiv100(dOuter);
	mCenterCenterFlex(dInner);
	//let d = mDiv(dInner);
	if (isdef(inner)) d.innerHTML = inner;
	if (nundef(styles)) styles = {};
	styles.display = 'inline-block';
	//let picStyles = { fz: valf(styles.fz, valf(styles.h / 2, 20)), display: 'inline-block' };
	mStyleX(dOuter, styles);
	//mStyleX(d, picStyles);
	if (isdef(classes)) mClass(dOuter, classes);
	iAdd(item, { div: dOuter, dInner: dInner });
	item.add = elem => mAppend(dInner, elem);
	return item;
}
function iDelete(item) {
	//deletes item from Items and all items referred to in its live component
	//console.log('deleting', item.id)
	let id = isString(item) ? item : item.id;
	item = Items[id];
	for (const k in item.live) {
		let el = item.live[k];
		if (isdef(el.memberOf)) { el.memberOf.map(x => iRemoveFromLive(x, el.id)); }
		if (isItem(el)) iDelete(item); else el.remove();
	}
	if (isdef(item.memberOf)) { item.memberOf.map(x => iRemoveFromLive(x, item.id)); }
	delete Items[id];
}
function iRemoveFromLive(pid, id) {
	if (pid == id) { console.log('!!!!!!!!!!!!!!!!!!!!', id, 'member of itself!!!'); return; }
	//console.log('removing', id, 'from', pid)
	let comp = Items[pid];
	let l = comp.live;
	let tbr = null;
	for (const k in l) {
		let el = l[k];
		if (el.id == id) { tbr = k; break; }
	}
	if (tbr) delete l[tbr];
}
function iAddContent(item, d) { let dm = diContent(item); if (isdef(dm)) mAppend(dm, d); }
function iAppend(dParent, i) { mAppend(iDiv(dParent), iDiv(i)); }
function iBounds(i, irel) { return getRect(iDiv(i), isdef(irel) ? iDiv(irel) : null); }
function iCenter(item, offsetX, offsetY) { let d = iDiv(item); mCenterAbs(d, offsetX, offsetY); }

function iDetect(itemInfoKey) {
	let item, info, key;
	if (isString(itemInfoKey)) { key = itemInfoKey; info = Syms[key]; item = infoToItem(info); }
	else if (isDict(itemInfoKey)) {
		if (isdef(itemInfoKey.info)) { item = itemInfoKey; info = item.info; key = item.info.key; }
		else { info = itemInfoKey; key = info.key; item = infoToItem(info); }
	}
	return [item, info, key];
}
function iDiv(i) { return isdef(i.live) ? i.live.div : isdef(i.div) ? i.div : i; }
function iSvg(i) { return isdef(i.live) ? i.live.svg : isdef(i.svg) ? i.svg : i; }
function iG(i) { return isdef(i.live) ? i.live.g : isdef(i.g) ? i.g : i; }
function iDivs(ilist) { return isEmpty(ilist) ? [] : isItem(ilist[0]) ? ilist.map(x => iDiv(x)) : ilist; }
function iDov(item) { return isdef(item.live) ? item.live.overlay : null; }
function iGetl(item, key) { return item.live[key]; }
function iGet(item, key) { return item[key]; }
function iGrid(rows, cols, dParent, styles) {
	styles.display = 'inline-block';
	let items = [];
	let index = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let d = mDiv(dParent, styles);
			let item = { row: i, col: j, index: index };
			index += 1;
			iAdd(item, { div: d });
			items.push(item);
		}
		mLinebreak(dParent);
	}
	return items;
}
function iHighlight(item) { let d = iDov(item); mClass(d, 'overlaySelected'); }
function iLabel(i) { return isdef(i.live) ? i.live.dLabel : isdef(i.dLabel) ? i.dLabel : null; }
function iMeasure(item, sizingOptions) {
	if (nundef(iDiv(item))) return;
	setRect(iDiv(item), valf(sizingOptions, { hgrow: true, wgrow: true }));
}
function iMoveFromToPure(item, d1, d2, callback, offset) {
	let bi = iBounds(item);
	let b1 = iBounds(d1);
	let b2 = iBounds(d2);
	//console.log('item', bi);
	//console.log('d1', b1);
	//console.log('d2', b2);

	//animate item to go translateY by d2.y-d1.y
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };

	item.div.style.zIndex = 100;
	let a = aTranslateBy(item.div, dist.x, dist.y, 500);
	a.onfinish = () => { if (isdef(callback)) callback(); };
}
function iMoveFromTo(item, d1, d2, callback, offset) {

	//console.log('__ iMove __item',item,'\nd1',d1,'\nd2',d2,'\noffset',offset)	
	let bi = iBounds(item);
	let b1 = iBounds(d1);
	let b2 = iBounds(d2);
	//console.log('item', bi);
	//console.log('d1', b1);
	//console.log('d2', b2);

	//animate item to go translateY by d2.y-d1.y
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };

	item.div.style.zIndex = 100;
	let a = aTranslateBy(item.div, dist.x, dist.y, 500);
	a.onfinish = () => { mAppend(d2, item.div); item.div.style.zIndex = item.z = iZMax(); if (isdef(callback)) callback(); };
}
function iMessage(item, msg) { let dm = diMessage(item); if (isdef(dm)) dm.innerHTML = msg; }
function iParentBounds(i) { return getRect(iDiv(i)); }
function iPic(i) { return isdef(i.live) ? i.live.dPic : isdef(i.dPic) ? i.dPic : null; }
function iPanel(dParent, styles, classes, id, inner) {
	// ???
	let item = { id: isdef(id) ? id : getUID(), type: 'plain' };
	let dOuter = mDiv(dParent);
	mCenterCenterFlex(dOuter);
	let d = mDiv(dOuter);
	if (isdef(inner)) d.innerHTML = inner;
	if (nundef(styles)) styles = {};
	let picStyles = { fz: valf(styles.fz, valf(styles.h / 2, 25)), display: 'inline-block' };
	mStyleX(dOuter, styles);
	mStyleX(d, picStyles);
	if (isdef(classes)) mClass(dOuter, classes);
	iAdd(item, { div: dOuter, dPic: d });
	return item;
}
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
function iRegisterX(item, keyProp, id) {
	let uid = isdef(id) ? id : getUID(); Items[uid] = item;
	if (isdef(item[keyProp])) ItemsByKey[item[keyProp]] = uid; return uid;
}
function iResize(i, w, h) { return isList(i) ? i.map(x => iSize(x, w, h)) : iSize(i, w, h); }
function iSidebar(d1, d2, dToggle = null, w = 100, startOpen = true, id) {
	mStyleX(d1, { h: '100%', w: startOpen == true ? w : 0, position: 'absolute', z: 1, top: 0, left: 0, 'overflow': 'hidden' }); //, transition: secs });
	mStyleX(d2, { h: '100%', maleft: startOpen == true ? w : '0px', box: true }, null, null); //, transition: secs

	d1.isOpen = startOpen;
	d1.wNeeded = w;
	let tell = () => console.log('sidebar is', d1.isOpen ? 'OPEN' : 'CLOSED');

	let fToggle = (ev, animate = true) => {
		d1.isOpen = !d1.isOpen;
		let val = d1.isOpen ? d1.wNeeded : 0;
		if (animate) multiStyleAnimation([[d1, { w: val }], [d2, { maleft: val }]], 500, tell);
		else { mStyleX(d1, { w: val }); mStyleX(d2, { maleft: val }); tell(); }
	}

	let fOpen = (ev, animate = true) => {
		if (d1.isOpen) return;
		fToggle(ev, animate);
	}

	let fClose = (ev, animate = true) => {
		if (!d1.isOpen) return;
		fToggle(ev, animate);
	}

	let fAddContent = (cont, styles) => {
		mAddContent(d1, cont, styles, { keepInLine: true, replace: false });
		let sz = getSizeNeeded(d1);
		//console.log('size needed is', sz);
		d1.wNeeded = sz.w;
		if (d1.isOpen) { mStyleX(d1, { w: d1.wNeeded }); mStyleX(d2, { maleft: d1.wNeeded }); }
	};

	let fReplaceContent = (cont, styles) => { clearElement(d1); fAddContent(cont, styles); };

	id = isdef(id) ? id : !isEmpty(d1.id) ? d1.id : getUID('sb');

	let item = mItem(id, { div: d1 }, { type: 'sidebar', w: w, toggle: fToggle, open: fOpen, close: fClose, addContent: fAddContent, replaceContent: fReplaceContent },true);
	if (!isEmpty(d2.id)) item.idContent = d2.id;
	if (isdef(dToggle)) { iAdd(item, { dToggle: dToggle }); dToggle.onclick = fToggle; }
	return item;
}
function iSize(i, w, h) { i.w = w; i.h = h; mSize(iDiv(i), w, h); }
function iSplay(items, iContainer, containerStyles, splay = 'right', ov = 20, ovUnit = '%', createHand = true, rememberFunc = true) {

	if (!isList(items)) items = [items];
	if (isEmpty(items)) return { w: 0, h: 0 };

	let [w, h] = [items[0].w, items[0].h];

	let isHorizontal = splay == 'right' || splay == 'left';
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		item.col = isHorizontal ? i : 0;
		item.row = isHorizontal ? 0 : i;
		item.index = item.z = i;
	}

	//phase 3: prep container for items
	if (nundef(containerStyles)) containerStyles = {};
	let dContainer = iDiv(iContainer);
	let dParent, iParent;

	if (createHand) {
		dParent = mDiv(dContainer);
		iParent = { div: dParent };
	} else if (isItem(iContainer)) {
		dParent = iContainer.div;
		iParent = iContainer;

	} else dParent = iContainer;

	containerStyles.hmin = items[0].h;
	//console.log('contStyles',containerStyles,items[0])
	mStyleX(dParent, containerStyles);

	//phase 4: add items to container
	let gap = isdef(containerStyles.padding) ? containerStyles.padding : 0;
	let overlap = ov;
	if (ovUnit == '%') overlap = ov == 0 ? .5 : (isHorizontal ? w : h) * ov / 100;
	let x = y = gap;

	// call splayout primitive!!!
	let sz = splayout(items.map(x => iDiv(x)), dParent, w, h, x, y, overlap, splay);

	dParent.style.width = '' + sz.w + 'px';
	dParent.style.height = '' + sz.h + 'px';
	if (isdef(iParent)) { iParent.w = sz.w; iParent.h = sz.h; iParent.items = items; }
	return isdef(iParent) ? iParent : dParent;

}
function iStyle(i, styles) { mStyleX(iDiv(i), styles); }
function iSym(kItem, dParent, styles, classes) {
	let item;
	if (isString(kItem)) { item = { id: getUID(), key: kItem, info: Syms[kItem] }; }
	else if (nundef(kItem.info)) { item = { id: getUID(), key: kItem.key, info: kItem }; }
	else item = kItem;

	let info = item.info;
	let dOuter = mDiv(dParent);
	mCenterCenterFlex(dOuter);
	let d = mDiv(dOuter);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let picStyles = { family: info.family, fz: valf(styles.fz, valf(styles.h / 2, 25)), display: 'inline-block' };
	mStyleX(dOuter, styles);
	mStyleX(d, picStyles);
	if (isdef(classes)) mClass(dOuter, classes);

	iAdd(item, { div: dOuter, dPic: d });
	return item;
}
function iTitle(item, msg) { let dm = diTitle(item); if (isdef(dm)) dm.innerHTML = msg; }
function iToggleSingleSelection(item, items) {
	let ui = iDiv(item);
	let selItem = null;
	item.isSelected = !item.isSelected;
	if (item.isSelected) { mClass(ui, 'framedPicture'); selItem = item; }
	else { mRemoveClass(ui, 'framedPicture'); selItem = null; }

	//if piclist is given, add or remove pic according to selection state
	if (isdef(items) && selItem) {
		for (const i1 of items) {
			if (i1.isSelected && i1 != item) {
				i1.isSelected = false;
				mRemoveClass(iDiv(i1), 'framedPicture');
				break;
			}
		}
	}
	return selItem;
}
function iToggleMultipleSelection(item, items) {
	let ui = iDiv(item);
	item.isSelected = !item.isSelected;
	if (item.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');
	if (isdef(items)) {
		for (const i1 of items) {
			if (i1.isSelected) {
				console.assert(!items.includes(i1), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
				items.push(i1);
			} else {
				console.assert(items.includes(i1), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
				removeInPlace(items, i1);
			}
		}
	}
}
function iZMax(n) { if (isdef(n)) ZMax = n; ZMax += 1; return ZMax; }
//#endregion

//#region ani
var MyEasing = 'cubic-bezier(1,-0.03,.86,.68)';
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
	let kflist = [];
	for (const v of [start, middle, end]) {
		let o = {};
		o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration };
	if (isdef(forwards)) opts.fill = forwards;
	elem.animate(kflist, opts); // {duration:msDuration}); //,fill:'forwards'});
}
function animatePropertyX(elem, prop, start_middle_end, msDuration, forwards, easing, delay) {
	let kflist = [];
	for (const perc in start_middle_end) {
		let o = {};
		let val = start_middle_end[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: valf(forwards, 'none'), easing: valf(easing, 'ease-it-out'), delay: valf(delay, 0) };
	elem.animate(kflist, opts); // {duration:msDuration}); //,fill:'forwards'});
}
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	// var MyEasing = 'cubic-bezier(1,-0.03,.86,.68)';
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	// let a = aTranslateFadeBy(d.div, dist.x, dist.y, 500);
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }// {easing:'cubic-bezier(1,-0.03,.27,1)',duration:ms}); }
function aTranslateByEase(d, x, y, ms, easing='cubic-bezier(1,-0.03,.27,1)') { return d.animate({ transform: `translate(${x}px,${y}px)` }, {easing:easing,duration:ms}); }
function aRotate(d, ms) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
//#endregion

//#region _SVG/g shapes
var SHAPEFUNCS = {
	'circle': agCircle,
	'hex': agHex,
	'rect': agRect,
}
function drawShape(key, dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
	//if (nundef(classes)) classes = ['superhover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	// mStyleX(d, { 'clip-path': PolyClips[key] });
	if (key == 'circle' || key == 'ellipse') mStyleX(d,{rounding:'50%'});
	else mStyleX(d, { 'clip-path': PolyClips[key] });
	return d;
}
function drawPlainCircle(c) {
	let item = mPic('heart', dMain, { fz: 8, bg: 'red', rounding: '50%', padding: 1 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawText(text, c) {
	let item = mText(text, dMain, { fz: 16, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawSym(sym, c) {
	let item = mPic(sym, dMain, { fz: 25, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawTriangle(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyleX(d, { 'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)' });
	return d;
}
function drawFlatHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyleX(d, { 'clip-path': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' });
	return d;
}
function drawHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyleX(d, { 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' });
	return d;
}
function gSizeToContent(svg) {
	//muss NACH append gemacht werden damit es klappt
	var bbox = svg.getBBox();
	//console.log('bbox', bbox);
	// Update the width and height using the size of the contents
	svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
	svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
}

function agColoredShape(g, shape, w, h, color) {
	//console.log(shape)
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function agShape(g, shape, w, h, color, rounding) {
	let sh = gShape(shape, w, h, color, rounding);
	g.appendChild(sh);
	return sh;
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
	//console.log(shape)
	let el = gG();
	if (nundef(shape)) shape = 'rect';
	if (shape != 'line') agColoredShape(el, shape, w, h, color);
	else gStroke(el, color, w); //agColoredLine(el, w, color);

	if (isdef(rounding) && shape == 'rect') {
		let r = el.children[0];
		gRounding(r, rounding);
		//console.log(rounding,r);
		// r.setAttribute('rx', rounding); // rounding kann ruhig in % sein!
		// r.setAttribute('ry', rounding);
	}

	return el;
}

function gCreate(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }
function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }
function gSize(g, w, h, shape = null, iChild = 0) {
	//console.log(getTypeOf(g))
	let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
	let t = getTypeOf(el);
	//console.log('g', g, '\ntype of g child', el, 'is', t);
	switch (t) {
		case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
		case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
		default:
			if (shape) {
				switch (shape) {
					case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
				}
			}
	}
	return el;
}
function gBg(g, color) { g.setAttribute('fill', color); }
function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gRounding(r, rounding) {
	//let r = el.children[0];
	//console.log(rounding,r);
	r.setAttribute('rx', rounding); // rounding kann ruhig in % sein!
	r.setAttribute('ry', rounding);

}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); } //document.createElementNS('http://www.w3.org/2000/svg', 'svg'); }
function gG() { return gCreate('g'); }// document.createElementNS('http://www.w3.org/2000/svg', 'g'); }
function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }

function gCanvas(area, w, h, color, originInCenter = true) {
	let dParent = mBy(area);
	let div = stage3_prepContainer(dParent);
	div.style.width = w + 'px';
	div.style.height = h + 'px';

	let svg = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
	svg.setAttribute('style', style);
	mColor(svg, color);
	div.appendChild(svg);

	let g = gG();
	if (originInCenter) g.style.transform = "translate(50%, 50%)";
	svg.appendChild(g);

	return g;

}

function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
//function agSvgg(d) { let svg = gSvg(); agG(svg); d.appendChild(svg); return g; }
function aSvg(dParent) {
	if (!dParent.style.position) dParent.style.position = 'relative';

	let svg1 = gSvg();
	//console.log(svg1)
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	return svg1;
}
function aSvgg(dParent, originInCenter = true) {
	if (!dParent.style.position) dParent.style.position = 'relative';

	let svg1 = gSvg();
	//console.log(svg1)
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

	return g1;

}
//endregion

//#region color
var colorDict = null; //for color names, initialized when calling anyColorToStandardStyle first time
function anyColorToStandardString(cAny, a, allowHsl = false) {
	//if allowHsl is false: only return rgb,rgba,or hex7,hex9 string! >pBSC algo!!!
	//if a is undefined, leaves a as it is in cAny, otherwise modifies to a
	if (Array.isArray(cAny)) {
		// cAny is rgb array
		if (cAny.length < 3) {
			return randomHexColor();
		} else if (cAny.length == 3) {
			//assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		}
	} else if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			//this is rbg or rgba string
			if (cAny[3] == 'a') {
				//rgba string!
				//console.log('its an rgba string!!!!!');
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				// simple rgb string
				if (a < 1) {
					//console.log(cAny.length)
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			//hsl or hsla string
			//if hsla and hsla allowed do same as for rgba
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					//simple hsl string
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				//convert hsl(a) into rgb(a)
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return anyColorToStandardString(cAny, a, allowHsl);
			}
		} else {
			//cAny is color name
			let newcAny = colorNameToHex(cAny);
			//console.log(cAny,newcAny);
			return anyColorToStandardString(newcAny, a, allowHsl);
		}
	} else if (typeof cAny == 'object') {
		//console.log('anyColorToStandardString: cAny is object!!!', cAny);
		//koennte {h: ,s: , l:} oder {r: ,g: ,b:} sein
		if ('h' in cAny) {
			//hsl object
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return anyColorToStandardString(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			//rgb object
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
} //ok
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.substr(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	//console.log('alpha from', zero1, 'to', hex);
	return hex;
} //ok
function bestContrastingColor(color, colorlist) {
	//console.log('dddddddddddddddd')
	let contrast = 0;
	let result = null;
	let rgb = colorRGB(color, true);
	rgb = [rgb.r, rgb.g, rgb.b];
	for (c1 of colorlist) {
		let x = colorRGB(c1, true)
		x = [x.r, x.g, x.b];
		let c = getContrast(rgb, x);
		//console.log(rgb,x,c);
		if (c > contrast) { contrast = c; result = c1; }
	}
	//console.log(contrast,result)
	return result;
}
function helleFarbe(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let wheel = getHueWheel(contrastTo, minDiff, mod, start);
	//console.log('wheel',wheel)
	let hue = chooseRandom(wheel);
	let hsl = colorHSLBuild(hue, 100, 50);
	return hsl;
}
function getColorWheel(contrastTo, n) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	let start = hc;
	let inc = Math.round(360 / (n + 1));
	start += inc;
	for (let i = 0; i < n; i++) {
		wheel.push(start % 360);
		start += inc;
	}
	return wheel.map(x => colorHSLBuild(x));
}
function getHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function getPalette(color, type = 'shade') {
	color = anyColorToStandardString(color);
	return colorPalShade(color);
}
function getPaletteFromImage(img) {
	let palette0 = ColorThiefObject.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = anyColorToStandardString(pal);
		palette.push(color);
	}
	//console.log(palette)
	//console.log('palette', palette)
	return palette;
}
function getTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function getTransPalette9(color = '#000000') {
	let res = [];
	for (const alpha of [.1, .2, .3, .4, .5, .6, .7, .8, .9]) res.push(colorTrans(color, alpha));
	return res;
}
function colorHue(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.h;
} //ok
function colorHSL(cAny, asObject = false) {
	//returns { h:[0,360], s:[0,1], l:[0,1]}
	let res = anyColorToStandardString(cAny, undefined, true);
	//console.log(res)
	let shsl = res;
	if (res[0] == '#') {
		//res is a hex string
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	//console.log(shsl);
	let n = allNumbers(shsl);
	//console.log(n);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
} //ok
function colorHSLBuild(hue, sat = 100, lum = 50) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function colorBlend(zero1, c0, c1, log = true) {
	c0 = anyColorToStandardString(c0);
	c1 = anyColorToStandardString(c1);
	return pSBC(zero1, c0, c1, log);
} //ok
function colorLighter(c, zero1 = .2, log = true) {
	c = anyColorToStandardString(c);
	return pSBC(zero1, c, undefined, !log);
} //ok
function colorDarker(c, zero1 = .8, log = true) {
	//1 is darkest,0 is orig color
	c = anyColorToStandardString(c);
	return pSBC(-zero1, c, undefined, !log);
} //ok
function colorPalShadeX(color, n) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	let step = 1.6 / (n - 1);
	for (let frac = -0.8; frac <= 0.8; frac += step) { //0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function colorShade(plusMinus1, color, log = true) {
	let c = anyColorToStandardString(color);
	return pSBC(plusMinus1, c, undefined, !log);
} //ok
function colorTrans(cAny, alpha = 0.5) {
	return anyColorToStandardString(cAny, alpha);
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	//jetzt ist bg rgb object
	const nThreshold = 105; //40; //105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
	// return 'white';
}
function colorHex(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		//it is now an rgba string and has alpha
		let res = pSBC(0, c, 'c');
		//console.log('in colorHex!!!!', c, res);
		return res;
	}
} //ok
function colorRGB(cAny, asObject = false) {
	//returns { r:[0,255], g:[0,255], b:[0,255]}
	let res = anyColorToStandardString(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	//console.log(shsl);
	let n = allNumbers(srgb);
	//console.log(n);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
} //ok
function ensureColorNames() {
	if (isdef(ColorNames)) return;
	ColorNames = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorNames[names[i].toLowerCase()] = '#' + hexes[i];
	}
}
function colorNameToHex(cName) { let key = cName.toLowerCase(); ensureColorNames(); return key in ColorNames ? ColorNames[key] : randomHexColor(); } //ok
function colorPalShade(color) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function getColorDictColor(c) { return isdef(ColorDict[c]) ? ColorDict[c].c : c; }
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
} //ok
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
} //ok
function getBrightness(c) {
	function luminance(r, g, b) {
		var a = [r, g, b].map(function (v) {
			v /= 255;
			return v <= 0.03928
				? v / 12.92
				: Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
	let x = colorRGB(c, true);
	return luminance(x.r, x.g, x.b);
}
function getContrast(rgb1, rgb2) {
	// usage:
	// contrast([255, 255, 255], [255, 255, 0]); // 1.074 for yellow
	// contrast([255, 255, 255], [0, 0, 255]); // 8.592 for blue
	// minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05)
		/ (darkest + 0.05);
}
function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function computeColor(c) { return (c == 'random') ? randomColor() : c; }
function computeColorX(c) {

	let res = c;
	if (isList(c)) return chooseRandom(c);
	else if (isString(c) && startsWith(c, 'rand')) {
		res = randomColor();
		let spec = c.substring(4);
		//console.log('______________________', spec);
		if (isdef(window['color' + spec])) {
			//console.log('YES!');
			res = window['color' + spec](res);
		}

	}
	return res;
}
function getExtendedColors(bg, fg, alpha) {
	//#region doc 
	/* handles values random, inherit, contrast	*/
	//#endregion 
	//if (fg == 'contrast') console.log('bg',bg,'fg',fg);
	bg = computeColorX(bg);
	fg = computeColorX(fg);
	if (bg == 'inherit' && (nundef(fg) || fg == 'contrast')) {
		fg = 'inherit'; //contrast to parent bg!

	} else if (fg == 'contrast' && isdef(bg) && bg != 'inherit') fg = colorIdealText(bg);
	else if (bg == 'contrast' && isdef(fg) && fg != 'inherit') { bg = colorIdealText(fg); }
	if (isdef(alpha)) bg = colorTrans(bg, alpha);
	return [bg, fg];
}
function pSBC(p, c0, c1, l) {
	//usage:
	// (blacken) -1.0 <= p <= 1.0 (whiten), or (c0) 0 <= p <= 1.0 (c1) when blending (ie., c1 given)
	// c0: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... from color
	// c1: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... to color (blending)
	// 		or 'c' for conversion between hex string and rgb string
	// l true:log blending, [false:linear blending]=default!
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
} //ok SUPER COOL!!!!
//color converters good!
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		// convert hex to RGB first
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		// then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		// 4 digits
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
			// 8 digits
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}

		// normal conversion to HSLA
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		a = (a / 255).toFixed(3);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLToRGB(hsl, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		// keep hue fraction of 360 if ending up over
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}

		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
} //ok
function rgbToHex(rgbStr) { return rgbStr && '#' + rgbStr.slice(4, -1).split(',').map(x => (+x).toString(16).padStart(2, '0')).join(''); }
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba); //allNumbers does not catch .5 as float!
	//console.log('all numbers:', n);
	if (n.length < 3) {
		//console.log('RGBAToHex ERROR!', rgba);
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	//console.log('sa:', sa);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
} //ok
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);

		// convert %s to 0–255
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}

		// make r, g, and b fractions of 1
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);

		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;

				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}

		// make r, g, and b fractions of 1
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLToRGB(hsl, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		// keep hue fraction of 360 if ending up over
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}

		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok

//#endregion

//#region ajax
function ajaxSimple(method, url, callback) {
	var ajax = new XMLHttpRequest();
	ajax.onload = () => {
		if (ajax.status == 200 || ajax.readyState == 4) {
			//console.log(ajax);
			if (isdef(callback)) callback(ajax);
		}
	}
	ajax.open(method, url, true); // true means data should be read asynchronously!
	ajax.send();
}

//#endregion

//#region control flow keyhandlers
function realTimeIfTrue(f, cnt) {
	console.log('counter', cnt)
	if (f()) setTimeout(() => realtimeIfTrue(f, cnt + 1), 10);

}
function safeLoop(func, params) {
	let max = 100, i = 0;

	while (i < max) {
		i += 1;
		let res = func(...params);
		if (isdef(res)) return res;
	}
	console.log('safeLoop: max reached!!!!!!!!!');
	return null;
}
function sleepX(msecs) {
	//#region doc 
	/*	
example: 
	flag = false;
	functionWithSetTimeouts (after last timeout flag should be set)
	while (!flag) { await sleepX(3000); }
	... continuing code after last timeout!
	
	*/
	//#endregion 
	return new Promise(r => setTimeout(r, msecs));
}
function onkeyupHandler(ev) {
	//console.log('keyup:', ev.key, DA.keyup);
	//if (DA.cancel_keyhandlers) return;
	if (nundef(DA.keyup)) DA.keyup = {};
	for (const k in DA.keyup) {
		//console.log('--->exec k', k);
		DA.keyup[k](ev);
	}
}
function onkeydownHandler(ev) {
	//console.log('keydown:', ev.key);
	if (nundef(DA.keydown)) DA.keydown = {}; for (const k in DA.keydown) { DA.keydown[k](ev); }
}
function addKeyup(k, f) {
	//console.log('adding keyup event for key', k);
	if (nundef(DA.keyup)) DA.keyup = {};
	DA.keyup[k] = f;
	//console.log('added', DA.keyup)
}
function addKeydown(k, f) { if (nundef(DA.keydown)) DA.keydown = {}; DA.keydown[k] = f; }
function removeKeyHandler(k) {
	//console.log('remove keyhandler for', k);
	let f = lookup(DA, ['keyup', k]);
	if (lookup(DA, ['keyup', k])) {
		//console.log('delete existing function ',DA.keyup[k],'\nfor:',k);
		delete DA.keyup[k];
	}
	if (lookup(DA, ['keydown', k])) {
		delete DA.keydown[k];
	}
}
function init_keyhandlers() {
	onkeyup = onkeyupHandler;
	//onkeydown = onkeydownHandler;
}
//#endregion

//#region drag drop
var DragElem = null; //is the clone of HTML element from which drag started
var DDInfo = null;
function addDDSource(source, isCopy = true, clearTarget = false) {
	DDInfo.sources.push(source);
	let d = iDiv(source);
	d.onmousedown = (ev) => ddStart(ev, source, isCopy, clearTarget);
}
function addDDTarget(target, isCopy = true, clearTarget = false) {
	DDInfo.targets.push(target);
	target.isCopy = isCopy;
	target.clearTarget = clearTarget;
	// let d = iDiv(target);
	// d.onmousedown = (ev) => ddStart(ev, source, isCopy, clearTarget);
}
function enableDD(sources, targets, dropHandler, isCopy, clearTarget, dragStartHandler) {
	//console.log('isCopy',isCopy,'startH',dragStartHandler)
	DDInfo = { sources: sources, targets: targets, dropHandler: dropHandler, dragStartHandler };
	let sourceDivs = sources.map(x => iDiv(x));
	for (let i = 0; i < sources.length; i++) {
		let source = sources[i];
		let d = sourceDivs[i];
		d.onmousedown = (ev) => ddStart(ev, source, isCopy, clearTarget);
	}
}
function ddStart(ev, source, isCopy = true, clearTarget = false) {

	//console.log('center',getCenter(iDiv(source)));

	if (!canAct() || isdef(DDInfo.dragStartHandler) && !DDInfo.dragStartHandler(source)) return;
	ev.preventDefault();
	ev.stopPropagation();
	//console.log('ev',ev,'source',source);

	//if (isdef(DDInfo.dragStartHandler)) DDInfo.dragStartHandler(source);
	DDInfo.source = source;
	let d = iDiv(source);
	var clone = DragElem = DDInfo.clone = d.cloneNode(true);
	// clone.eliminateSource = !isCopy;
	clone.isCopy = isCopy;
	//console.log(d,ev.target,clone)
	clone.clearTarget = clearTarget;
	mAppend(document.body, clone);//mClass(clone, 'letter')
	mClass(clone, 'dragelem');//der clone muss class 'dragelem' sein
	mStyleX(clone, { left: ev.clientX - ev.offsetX, top: ev.clientY - ev.offsetY });//der clone wird richtig plaziert
	DDInfo.dragOffset = clone.drag = { offsetX: ev.offsetX, offsetY: ev.offsetY };
	// von jetzt an un solange DragElem != null ist muss der clone sich mit der maus mitbewegen
	document.body.onmousemove = onMovingCloneAround;
	document.body.onmouseup = onReleaseClone;// ev=>console.log('mouse up')
}
function onMovingCloneAround(ev) {
	if (DragElem === null) return;

	let mx = ev.clientX;
	let my = ev.clientY;
	let dx = mx - DragElem.drag.offsetX;
	let dy = my - DragElem.drag.offsetY;
	mStyleX(DragElem, { left: dx, top: dy });
}
function onReleaseClone(ev) {
	//console.log('RELEASE!!!')
	let els = allElementsFromPoint(ev.clientX, ev.clientY);
	//console.log('_________',els);
	let source = DDInfo.source;
	let dSource = iDiv(source);
	let dropHandler = DDInfo.dropHandler;
	//let success
	//console.log(DDInfo.targets);
	for (const target of DDInfo.targets) {
		//console.log('_target',target);
		let dTarget = iDiv(target);
		//console.log('_dTarget',dTarget);
		if (els.includes(dTarget)) {
			//console.log('YES!',firstCond(els,x=>x==dTarget))
			//if (DragElem.clearTarget) clearElement(dTarget);
			if (isdef(dropHandler)) {
				let cDrop = { x: ev.clientX, y: ev.clientY };
				let rTarget = getRect(dTarget);
				let cTarget = { x: rTarget.x + rTarget.w / 2, y: rTarget.y + rTarget.h / 2 };
				//let ct1=getCenter(dTarget);
				//console.log('rTarget', rTarget, '\ncTarget', cTarget, '\ncDrop', cDrop);//, '\nct1',ct1)
				//console.assert(cTarget.x==ct1.x && cTarget.y==ct1.y,'onReleaseClone: getCenter GEHT NICHT!!!');
				let [dx, dy] = [cDrop.x - cTarget.x, cDrop.y - cTarget.y];
				//console.log('dx,dx',dx,dy);
				let [ddx, ddy] = [DragElem.drag.offsetX, DragElem.drag.offsetY];
				//console.log('offx,offy',ddx,ddy);
				//[dx,dy]=[dx-ddx,dy-ddy];
				//console.log('nach -offs: dx,dx',dx,dy);
				dropHandler(source, target, DragElem.isCopy, DragElem.clearTarget, dx, dy, ev, DragElem);
			}
			//console.log('dropped', source.name, 'on target', target);
			break; //as soon as found a target, stop looking for more targets!

		}
	}
	//destroy clone
	//if (DragElem.eliminateSource) dSource.remove();
	DragElem.remove();
	DragElem = null;
	//DDInfo = null;
	document.body.onmousemove = document.body.onmouseup = null;
}
//#endregion

//#region fire
function fireClick(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('click', true, false);
		//console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		//console.log('****************fireClick: node.onclick exists!!!', node)
		//node.click();
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		//console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		//console.log('****************fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireWheel(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('wheel', true, false);
		console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireKey(k, { control, alt, shift } = {}) {
	console.log('fireKey called!' + document.createEvent)
	if (document.createEvent) {
		// var evt = document.createEvent('KeyEvents');
		// evt.initEvent('keyup', true, false);
		console.log('fireKey: createEvent and node.dispatchEvent exist!!!', k, control, alt, shift);
		//el.dispatchEvent(new Event('focus'));
		//el.dispatchEvent(new KeyboardEvent('keypress',{'key':'a'}));
		window.dispatchEvent(new KeyboardEvent('keypress', { key: '+', ctrlKey: true }));
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
//#endregion

//#region file IO
function downloadTextFile(s, filenameNoExt, ext = 'txt') {
	saveFileAtClient(
		filenameNoExt + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));

}
function saveFileAtClient(name, type, data) {
	//usage:
	// json_str = JSON.stringify(someObject);
	// saveFileAtClient("yourfilename.json", "data:application/json", new Blob([json_str], {type: ""}));

	//console.log(navigator.msSaveBlob);
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	let a = document.createElement('a');
	a.style.display = 'none';
	let url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	fireClick(a);
	setTimeout(function () {
		// fixes firefox html removal bug
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function downloadAsText(s, filename, ext = 'txt') {
	downloadTextFile(s, filename, ext);
}
function downloadAsYaml(o, filename) {
	//console.log(symbolDict_)
	let y = jsonToYaml(o);
	downloadTextFile(y, filename, 'yaml');
}
function jsonToYaml(o) {
	// this is your json object
	//JSONObject jsonobject = new JSONObject(map);
	// get json string
	let y = jsyaml.dump(o);
	return y;
	//  let text= JSON.stringify(o); //o.toString(4);
	//  let di = jsyaml.load(text);
	//  let y = jsyaml.dump(di);
}
function previewImageFromUrl(url, img) {
	//var img = mBy('imgPreview');
	img.onerror = function () {
		alert("Error in uploading");
	}
	img.crossOrigin = ""; // if from different origin, same as "anonymous"
	img.src = url;
}

function previewImageFromFile(imgFile, img) {
	//var img = mBy('imgPreview');
	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
		imgFile.data = e.target.result; //img.toDataURL("image/png");
	}
	reader.readAsDataURL(imgFile);
}
function csv2list(allText, hasHeadings = true) {
	var numHeadings = 11;  // or however many elements there are in each row
	var allTextLines = allText.split(/\r\n|\n/);
	//console.log('found',allTextLines.length,'text lines!!!');
	var headings = allTextLines[0].split(',');
	numHeadings = headings.length;
	//console.log('headings',numHeadings,headings);
	let entries = allTextLines.splice(1);
	//entries = entries.slice(0,10);
	//entries.map(x=>console.log(x)); 
	var records = [];
	for (const e of entries) {
		let o = {};
		let values = e.split(',');
		for (let i = 0; i < numHeadings; i++) {
			let k = headings[i];
			o[k] = values[i];
		}
		records.push(o);
	}
	//console.log('recordsByName',recordsByName)
	return records;
}

function processCsvData_from_CBII(allText) {
	var numHeadings = 5;  // or however many elements there are in each row
	var allTextLines = allText.split(/\r\n|\n/);
	//console.log('found',allTextLines.length,'text lines!!!')
	var headings = allTextLines[0].split(',');
	numHeadings = headings.length;
	//console.log('headings',numHeadings,headings);
	let entries = allTextLines.splice(1);
	//entries = entries.slice(0,10);
	//entries.map(x=>console.log(x)); 
	var records = { headings: headings };
	var recordsByName = {};
	for (const e of entries) {
		let o = {};
		let values = e.split(',');
		for (let i = 0; i < numHeadings; i++) {
			let k = headings[i];
			o[k] = values[i];
		}
		records[o.hexcode] = o;
		recordsByName[o.annotation] = o.hexcode;
	}
	//console.log('recordsByName',recordsByName)
	return { records: records, recordsByName: recordsByName };
}

//#endregion

//#region functions
function getFunctionCallerName() {
	// gets the text between whitespace for second part of stacktrace
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
function getFunctionsNameThatCalledThisFunction() {
	let c1 = getFunctionsNameThatCalledThisFunction.caller;
	if (nundef(c1)) return 'no caller!';
	let c2 = c1.caller;
	if (nundef(c2)) return 'no caller!';
	return c2.name;
}
//#endregion

//#region geo helpers
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function distance(x1, y1, x2, y2) { return Math.sqrt(dSquare({ x: x1, y: y1 }, { x: x2, y: y2 })); }
function isCloseTo(n, m, acc = 10) { return Math.abs(n - m) <= acc + 1; }
function getCirclePoints(rad, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = rad * Math.cos(toRadian(angle));
		let py = rad * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}
function getEllipsePoints(radx, rady, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = radx * Math.cos(toRadian(angle));
		let py = rady * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}
function getPoly(offsets, x, y, w, h) {
	//, modulo) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w); //  %modulo;
		//px -= px%modulo;
		//if (px % modulo != 0) px =px % modulo; //-= 1;
		let py = Math.round(y + p[1] * h); //%modulo;
		//py -= py%modulo;
		//if (py % modulo != 0) py -= 1;
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getHexPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
}
function getQuadPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function getTriangleDownPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}
function polyPointsFrom(w, h, x, y, pointArr) {

	x -= w / 2;
	y -= h / 2;

	let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' '); //'0,0 100,0 50,80',
	//testHexgrid(x, y, pts, sPoints);
	return sPoints;
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg
	//from center of poly and w (possibly h), calculate hex poly points and return as string!
	//TODO: add options to return as point list!
	//if h is omitted, a regular hex of width w is produced
	//starting from N:
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];

	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	return polyPointsFrom(w, h, x, y, hexPoints);
}
function size2triup(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 1 }, { X: 0, Y: 1 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function size2tridown(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 1, Y: 0 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function toRadian(deg) { return deg * 2 * Math.PI / 360; }

//#endregion

//#region Example POST method implementation:
async function postData(url = '', data = {}) {
	// Default options are marked with *
	//usage:
	// postData('https://example.com/answer', { answer: 42 })
	// .then(data => {
	//   console.log(data); // JSON data parsed by `data.json()` call
	// });	
	//console.log('url',url,JSON.stringify(data));
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return await response.text(); //'hallo';// response.json(); // parses JSON response into native JavaScript objects
}
async function fetch_wrapper(url) { return await fetch(url); }
async function route_path_yaml_dict(url) {
	let data = await fetch_wrapper(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
async function route_path_json_dict(url) {
	let data = await fetch_wrapper(url);
	let json = await data.json();
	return json;
}
async function route_path_text(url) {
	let data = await fetch_wrapper(url);
	return await data.text();
}
async function localOrRoute(key, url) {
	if (USE_LOCAL_STORAGE) {
		let x = localStorage.getItem(key);
		if (isdef(x)) return JSON.parse(x);
		else {
			let data = await route_path_yaml_dict(url);
			if (key != 'svgDict') localStorage.setItem(key, JSON.stringify(data));
			return data;
		}
	} else return await route_path_yaml_dict(url);
}


//#endregion

//#region measure size and pos ARITHMETIC
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	//console.log('r legend', r.w);

	let labels = fs.getElementsByTagName('label');
	//console.log('labels', labels);
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		//console.log('l', l.innerHTML, r1.w);
		wmax = Math.max(wmax, r1.w);
	}
	//console.log('max width of labels', wmax);

	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		//verschiebe all die labels
		for (const l of labels) { let d = l.parentNode; mStyleX(d, { maleft: diff / 2 }); }

	}
	//each label should be at least 50 px wide!

	//fs min-width setzen
	let wneeded = Math.max(wt, wo) + 10;
	mStyleX(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyleX(l, { display: 'inline-block', wmin: 50 }); mStyleX(d, { wmin: wneeded - 40 }); }



}
function getCenter(elem) { let r = isdef(elem.x) ? elem : getRect(elem); return { x: (r.w) / 2, y: (r.h) / 2 }; }
function getRectInt(elem, relto) {

	if (isString(elem)) elem = document.getElementById(elem);

	let res = elem.getBoundingClientRect();
	//console.log(res)
	if (isdef(relto)) {
		//console.log(relto)
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r4 = { x: Math.round(res.left), y: Math.round(res.top), w: Math.round(res.width), h: Math.round(res.height) };
	extendRect(r4); //r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h;
	return r4;
}
function getRect(elem, relto) {

	if (isString(elem)) elem = document.getElementById(elem);

	let res = elem.getBoundingClientRect();
	//console.log(res)
	if (isdef(relto)) {
		//console.log(relto)
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r4 = { x: res.left, y: res.top, w: res.width, h: res.height };
	extendRect(r4); //r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h;
	return r4;
}
function getSize(elem) { let r = getRectInt(elem); return { w: r.w, h: r.h, sz: Math.min(r.w, r.h) }; }
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }
function makeRect(x, y, w, h) { let r = { x: x, y: y, w: w, h: h }; extendRect(r); return r; }
function setRect(elem, options) {
	let r = getRect(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!

	if (isDict(options)) {
		if (options.hgrow) mStyleX(elem, { hmin: r.h });
		else if (options.hfix) mStyleX(elem, { h: r.h });
		else if (options.hshrink) mStyleX(elem, { hmax: r.h });
		if (options.wgrow) mStyleX(elem, { wmin: r.w });
		else if (options.wfix) mStyleX(elem, { w: r.w });
		else if (options.wshrink) mStyleX(elem, { wmax: r.w });
	}
	return r;
}
function setRectInt(elem, options) {
	let r = getRectInt(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!

	if (isDict(options)) {
		if (options.hgrow) mStyleX(elem, { hmin: r.h });
		else if (options.hfix) mStyleX(elem, { h: r.h });
		else if (options.hshrink) mStyleX(elem, { hmax: r.h });
		if (options.wgrow) mStyleX(elem, { wmin: r.w });
		else if (options.wfix) mStyleX(elem, { w: r.w });
		else if (options.wshrink) mStyleX(elem, { wmax: r.w });
	}
	return r;
}
function setWNeeded(elem) {
	let sz = getSizeNeeded(elem);
	let r = getRect(elem);
	if (sz.w > r.w && elem.style.width != '100%') { r.w = sz.w; mStyleX(elem, { w: r.w }); }
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!
	return r.w;
}
function setHNeeded(elem) {
	let sz = getSizeNeeded(elem);
	let r = getRect(elem);
	if (sz.h > r.h && elem.style.height != '100%') { r.h = sz.h; mStyleX(elem, { h: r.h }); }
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!
	return r.h;
}
function parseRect(elem) {
	let r = elem.getAttribute('rect');
	console.log('elem.rect', r);
	if (nundef(r)) return getRect(elem);
	r = r.split(' ');
	let rect = { w: Number(r[0]), h: Number(r[1]), t: Number(r[2]), l: Number(r[3]), b: Number(r[4]), r: Number(r[5]) };
	return rect;
}
function setSizeNeeded(elem) {
	let sz = getSizeNeeded(elem);
	let r = getRect(elem);
	if (sz.w > r.w && elem.style.width != '100%') { r.w = sz.w; mStyleX(elem, { w: r.w }); }
	if (sz.h > r.h && elem.style.height != '100%') { r.h = sz.h; mStyleX(elem, { h: r.h }); }
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!
	return r;
}
function getSizeNeeded(elem) {
	var d = elem.cloneNode(true); //document.createElement("div");
	d.style.width = 'auto';
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = {};
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyleX(d, cStyles);
	//d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d);
	return { w: Math.round(width), h: Math.round(height) };
}
function getSizeWithStyles(text, styles) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = jsCopy(styles);
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyleX(d, cStyles);
	d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d);
	return { w: Math.round(width), h: Math.round(height) };
}
function idealFontSize(txt, wmax, hmax, fz = 22, fzmin = 6, weight) { return idealFontDims(...arguments).fz; }
function idealFontDims(txt, wmax, hmax, fz = 22, fzmin = 6, weight) {
	let tStyles = { fz: fz, family: 'arial' };
	if (isdef(weight)) tStyles.weight = weight;
	while (true) {
		let tSize = getSizeWithStyles(txt, tStyles);

		//console.log('text size of', txt, 'mit font', tStyles.fz, tSize)

		if (tSize.h <= hmax && tSize.w <= wmax || tStyles.fz <= fzmin) return { w: tSize.w, h: tSize.h, fz: tStyles.fz, family: 'arial' };
		else tStyles.fz -= 1;
	}

}
function measureWord(w, fz) { let styles = { fz: fz, family: 'arial' }; return getSizeWithStyles(w, styles); }
function percentOf(elem, percentW, percentH) {
	if (nundef(percentH)) percentH = percentW;
	if (nundef(percentW)) percentW = percentH = 100;
	let r = getRect(elem);
	return { w: r.w * percentW / 100, h: r.h * percentH / 100 };
}
function percentVh(percent) { return percent * document.documentElement.clientHeight / 100; }
function percentVw(percent) { return percent * document.documentElement.clientWidth / 100; }
function percentVMin(percent) { return Math.min(percentVh(percent), percentVw(percent)); }
function percentVMax(percent) { return Math.max(percentVh(percent), percentVw(percent)); }
function percentVhIncludingScrollbar(percent) {
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	return (percent * h) / 100;
}
function percentVwIncludingScrollbar(percent) {
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	return (percent * w) / 100;
}
function percentVMinIncludingScrollbar(percent) {
	return Math.min(percentVhIncludingScrollbar(percent), percentVwIncludingScrollbar(percent));
}
function percentVMaxIncludingScrollbar(percent) {
	return Math.max(percentVhIncludingScrollbar(percent), percentVwIncludingScrollbar(percent));
}
function toBase10(s, base = 16) {
	//console.log(s);
	let s1 = reverseString(s.toLowerCase());
	//console.log(s1);
	let res = 0;
	let mult = 1;
	for (let i = 0; i < s1.length; i++) {
		let l = s1[i];
		let hexarr = ['a', 'b', 'c', 'd', 'e', 'f'];
		let n = isNumber(l) ? Number(l) : 10 + hexarr.indexOf(l);
		res += mult * n;
		mult *= base;
	}
	return res;
}
//#endregion

//#region merge
//#region internal
const _overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
function _isMergeableObject(val) {
	var nonNullObject = val && typeof val === 'object'

	return nonNullObject
		&& Object.prototype.toString.call(val) !== '[object RegExp]'
		&& Object.prototype.toString.call(val) !== '[object Date]'
}
function _emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function _cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && _isMergeableObject(value)) ? deepmerge(_emptyTarget(value), value, optionsArgument) : value
}
function _defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') { //el[i] nur in source
			destination[i] = _cloneIfNecessary(e, optionsArgument)
		} else if (_isMergeableObject(e)) { //el[i] in beidem
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) { //el[i] nur in target
			destination.push(_cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
function _mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (_isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = _cloneIfNecessary(target[key], optionsArgument)
		})
	}
	Object.keys(source).forEach(function (key) {
		if (!_isMergeableObject(source[key]) || !target[key]) {
			//console.log('das sollte bei data triggern!',key,source[key])
			destination[key] = _cloneIfNecessary(source[key], optionsArgument)
		} else {
			destination[key] = _deepMerge(target[key], source[key], optionsArgument)
		}
	})
	return destination;
}
function _deepMerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: _defaultArrayMerge }
	var arrayMerge = options.arrayMerge || _defaultArrayMerge

	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : _cloneIfNecessary(source, optionsArgument)
	} else {
		return _mergeObject(target, source, optionsArgument)
	}
}
//#endregion

function mergeCombine(base, drueber) { return _deepMerge(base, drueber); }

function mergeOverride(base, drueber) { return _deepMerge(base, drueber, { arrayMerge: _overwriteMerge }); }

//#endregion

//#region objects ( *** ARRAYS ***, dictionaries...)
function addIf(arr, el) {
	if (!arr.includes(el)) arr.push(el);
}
function addByKey(oNew, oOld, except) {
	for (const k in oNew) {
		let val = oNew[k];
		if (isdef(except) && except.includes(k) || !isNumber(val)) continue;
		oOld[k] = isdef(oOld[k]) ? oOld[k] + val : val;
	}
}
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function addSimpleProps(ofrom, oto = {}) { for (const k in ofrom) { if (nundef(oto[k]) && isLiteral(k)) oto[k] = ofrom[k]; } return oto; }
function addIfDict(key, val, dict) { if (!(key in dict)) { dict[key] = [val]; } }
function allCond(arr, cond) { return forAll(arr, cond); }
function allCondDict(o, cond) { return get_keys(o).filter(x => cond(o[x])); }
function any(arr, cond) { return !isEmpty(arr.filter(cond)); }
function anyStartsWith(arr, prefix) { return any(arr, el => startsWith(el, prefix)); }
function arrAdd(arr, elist) { for (const el of elist) arr.push(el); return arr; }
function arr_count(arr,funcprop) {
	//assume: if prop is a string, each elem of arr must be object with that prop set!
	//assume: if prop is not a string, prop must be a func with argument array element
	console.log('arr',arr);
	let di = {};
	if (isdef(funcprop) && isString(funcprop)){
		for (const a of arr) { if (isdef(di[a[funcprop]])) di[a[funcprop]] += 1; else di[a[funcprop]] = 1; }
	}else if (isdef(funcprop)){ //funcprop is a function!
		for (const a of arr) { 
			let val = funcprop(a);
			if (isdef(di[val])) di[val] += 1; else di[val] = 1; 
		}
	}else{
		for (const a of arr) { if (isdef(di[a])) di[a] += 1; else di[a] = 1; }
	}

	//daraus mach jetzt einen array: [{key:rank,val:count}];
	for(const a of arr){
		a.rank=a.key[0];
		a.count=di[a.rank];
	}

	let sorted = sortByDescending(arr,'count');
	return sorted;

}
function arrExcept(arr,el){
	let res = [];
	for(const a of arr){if (a!=el) res.push(a);}
	return res;
}
function arrCount(arr, func) { let filt = arr.filter(func); return filt.length; }
function arrChildren(elem) { return [...elem.children]; }
function arrCreate(n, func) { let res = []; for (let i = 0; i < n; i++) { res.push(func(i)); } return res; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrFirstOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrFirst(l) : null; } else return null; }
function arrFlatten(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr[i].length; j++) {
			res.push(arr[i][j]);
		}
	}
	return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function draw_from_deck_to(deck,arr){top_elem_from_to(deck,arr);}
function return_elem_to_deck_from(el,arr,deck){elem_from_to(el,arr,deck);}
function top_elem_from_to(arr1, arr2) { arr2.push(arr1.shift()); }
function top_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.shift()); }
function last_elem_from_to(arr1, arr2) { arr2.push(arr1.pop()); }
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1,arr2); }
function bottom_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.pop()); }
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function arrFromTo(arr, iFrom, iTo) { return takeFromTo(arr, iFrom, iTo); }
function arrIndices(arr, func) {
	let indices = [];
	for (let i = 0; i < arr.length; i++) { if (func(arr[i])) indices.push(i); }
	return indices;
}
function arrLastOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrLast(l) : null; } else return null; }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMax(arr) { return arr.reduce((m, n) => Math.max(m, n)); }
function arrMin(arr) { return arr.reduce((m, n) => Math.min(m, n)); }
function arrMinMax(arr, func) {
	//console.log('====arr',arr)
	if (nundef(func)) func = x => x;
	let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
	//console.log('arr', arr, '\nmin', min, 'max', max)

	for (let i = 1, len = arr.length; i < len; i++) {
		let v = func(arr[i]);
		if (v < min) {
			min = v; imin = i;
			//console.log('new min!', '\nv', v, 'min', min, 'i', i);
		} else if (v > max) {
			max = v; imax = i;
			//console.log('new max!', '\nv', v, 'max', max, 'i', i);
		}
	}

	return { min: min, imin: imin, max: max, imax: imax };
}
function arrMinus(a, b) { let res = a.filter(x => !b.includes(x)); return res; }
function arrNoDuplicates(arr) {
	//only keeps unique literals in result! non-literals are removed!
	let di = {};
	let arrNew = [];
	for (const el of arr) {
		// console.log('el',el,'isLiteral',isLiteral(el),!isLiteral(el));
		if (!isLiteral(el)) continue;
		// console.log('isdef(di[el])',isdef(di[el]));
		if (isdef(di[el])) continue;
		di[el] = true;
		arrNew.push(el);
	}
	// console.log(arrNew)
	return arrNew;
}
function arrPlus(a, b) { let res = a.concat(b); return res; }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }

function arrReplaceAt(arr, index, val, inPlace = true) { return inPlace ? arrReplaceAtInPlace(arr, index, val) : arrReplaceAtCopy(arr, index, val); }
function arrReplaceAtInPlace(arr, index, val) { arr[index] = val; }
function arrReplaceAtCopy(arr, index, val) {
	//console.log('index',index,'val',val)
	let res = new Array();
	for (let i = 0; i < arr.length; i++) {
		if (i == index) res[i] = val; else res[i] = arr[i];
	}
	return res;
}
function arrRotate(arr, count) {
	// usage:
	// let arr = [1,2,3,4,5];let arr1=jsCopy(arr); arr2=arrRotate(arr1,2);
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;

	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrReverse(arr) { return arr.reverse(); }
function arrSplitByIndices(arr, indices) {
	let [a1, a2] = [[], jsCopy(arr)];
	for (let i = 0; i < indices.length; i++) {
		let el = arr[indices[i]];
		a1.push(el);
		removeInPlace(a2, el);
	}
	return [a1, a2];
}
function arrSwap(arr, i, j) { let h = arr[i]; arr[i] = arr[j]; arr[j] = h; }
function arrSwap2d(arr, r1, c1, r2, c2) { let h = arr[r1][c1]; arr[r1][c1] = arr[r2][c2]; arr[r2][c2] = h; }
function arrString(arr, func) {
	if (isEmpty(arr)) return '[]';
	let s = '[';
	for (const el of arr) {
		if (isList(el)) s += arrString(el, func) + ','; else s += (isdef(func) ? func(el) : el) + ',';

	}
	s = s.substring(0, s.length - 1);
	s += ']';
	return s;
}
function arrSum(arr, props) { if (!isList(props)) props = [props]; return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0); }
function arrTail(arr) { return arr.slice(1); }
function arrTake(arr, n) { return takeFromStart(arr, n); }
function arrTakeFromTo(arr, a, b) { return takeFromTo(arr, a, b); }
function arrTakeFromEnd(arr, n) {
	if (arr.length <= n) return arr.map(x => x); else return arr.slice(arr.length - n);
}
function arr_to_dict_by(arr, prop) { let di = {}; for (const a of arr) { lookupAddToList(di, [a[prop]], a); } return di; }

function arrToggleMember(arr, el) { if (arr.includes(el)) removeInPlace(arr, el); else arr.push(el); }
function arrWithout(a, b) { return arrMinus(a, b); }
function cartesian(...a) { return a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat()))); }
function arrPairs(a) {
	let res = [];
	for (let i = 0; i < a.length; i++) {
		for (let j = i + 1; j < a.length; j++) {
			res.push([a[i], a[j]]);
		}

	}
	return res;
}
function classByName(name) { return eval(name); }
function copyKeys(ofrom, oto, except = {}, only) {
	//console.log(ofrom)
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
}
function copySimpleProps(ofrom, oto = {}) { for (const k in ofrom) { if (isLiteral(k)) oto[k] = ofrom[k]; } return oto; }
function createClassByName(name, ...a) { var c = eval(name); return new c(...a); }
function createKeyIndex(di, prop) {
	let res = {};
	for (const k in di) {
		res[di[k][prop]] = k;
	}
	return res;
}
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function fisherYates(array) {
	var rnd, temp;

	for (var i = array.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = array[i];
		array[i] = array[rnd];
		array[rnd] = temp;
	}
	return array;
}
function filterByKey(o, keyString, exceptString) {
	let keys;
	if (isdef(keyString)) keys = keyString.split(',');
	console.log('keys', keys);
	//else if (isdef(exceptString)) keys=Object.keys(o).filter(x=>exceptString.includes(x));

	let result = {};
	for (const k of keys) {
		if (isdef(o[k])) result[k] = o[k];
	}
	//copyKeys(o,result,null,keys);
	return result;
}
function findLongestWord(arr) { return arr[arrMinMax(arr, x => x.length).imax]; }
function firstCond(arr, func) {
	//return first elem that fulfills condition
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;

	}
	return null;
}
function firstCondDict(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function firstCondDictKey() { return firstCondDictKeys(...arguments); }
function firstCondDictKeys(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function firstNCond(n, arr, func) {
	//return first n elements that fulfills condition
	if (nundef(arr)) return [];
	let result = [];
	let cnt = 0;
	for (const a of arr) {
		cnt += 1; if (cnt > n) break;
		if (func(a)) result.push(a);

	}
	return result;
}
function forAll(arr, func) { for (const a of arr) if (!func(a)) return false; return true; }
function get_keys(o) { return Object.keys(o); }
function get_values(o) { return Object.values(o); }
function getIndicesCondi(arr, func) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		if (func(arr[i], i)) res.push(i);
	}
	return res;
}
function getObjectsWithSame(olist, props, o, up = true, breakWhenDifferent = true) {
	let res = [];
	let val = lookup(o, props);
	//console.log('==>', val)
	if (up) {
		for (let i = 0; i <= olist.length - 1; i++) {
			let val1 = lookup(olist[i], props);
			if (val1 == val) res.push(olist[i]); else if (breakWhenDifferent) return res;
		}
	} else {
		for (let i = olist.length - 1; i >= 0; i--) {
			let val1 = lookup(olist[i], props);
			//console.log('val1', val1)
			if (val1 == val) res.push(olist[i]); else if (breakWhenDifferent) return res;
		}
	}
	//console.log('res', res)
	return res;
}
function getRandomLetterMapping(s) {
	//returns a dictionary mapping each letter of s to a different letter in s
	//replace each letter by a different letter
	if (nundef(s)) s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let alphabet = filterDistinctLetters(s);
	let alphabet2 = shuffle(jsCopy(alphabet));
	let di = {};
	for (let i = 0; i < alphabet.length; i++) {
		di[alphabet[i]] = alphabet2[i];
	}
	return di;
}
function getLetterSwapEncoding(s) {
	let di = getRandomLetterMapping(s);
	let result = '';
	for (let i = 0; i < s.length; i++) {
		result += s[i] in di ? di[s[i]] : s[i];
	}
	return result;
}
function intersection(arr1, arr2) {
	//each el in result will be unique
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function lastCond(arr, func) {
	//return first elem that fulfills condition
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func(arr[i])) return arr[i];
	}

	return null;
}
function loop(n) { return range(1, n); }
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupDef(o, proplist, def) { return lookup(o, proplist) || def; }
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue; //skip undef or null values
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		//console.log(k,d)
		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				alert('lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		if (nundef(d[k])) d[k] = {};

		d = d[k];
		i += 1;
	}
	return d;
}
function lookupAddToList(dict, keys, val) {
	//usage: lookupAddToList({a:{b:[2]}}, [a,b], 3) => {a:{b:[2,3]}}
	//usage: lookupAddToList({a:{b:[2]}}, [a,c], 3) => {a:{b:[2],c:[3]}}
	//usage: lookupAddToList({a:[0, [2], {b:[]}]}, [a,1], 3) => { a:[ 0, [2,3], {b:[]} ] }
	let d = dict;
	//console.log(dict)
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				// alert('lookupAddToList: last key indefined!' + keys.join(' '));
				console.assert(false,'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		// if (i ==ilast && d[k]) d[k]=val;

		if (d[k] === undefined) d[k] = {};

		d = d[k];
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	//usage see lookupAddToList 
	//only adds it to list if not contained!
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupRemoveFromList(dict, keys, val, deleteIfEmpty = false) {
	//usage: lookupRemoveFromList({a:{b:[2]}}, [a,b], 2) => {a:{b:[]}} OR {a:{}} (wenn deleteIfEmpty==true)
	//usage: lookupRemoveFromList({a:{b:[2,3]}}, [a,b], 3) => {a:{b:[2]}}
	//usage: lookupRemoveFromList({a:[ 0, [2], {b:[]} ] }, [a,1], 2) => { a:[ 0, [], {b:[]} ] }
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				alert('lookupRemoveFromList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				removeInPlace(d[k], val);
				if (deleteIfEmpty && isEmpty(d[k])) delete d[k];
			} else {
				if (d[k] === undefined) {
					error('lookupRemoveFromList not a list ' + d[k]);
					return null;
				}
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		// if (i ==ilast && d[k]) d[k]=val;

		if (d[k] === undefined) {
			error('lookupRemoveFromList key not found ' + k);
			return null;
		}

		d = d[k];
		i += 1;
	}
	return d;
}
function range(f, t, st = 1) {
	if (nundef(t)) {
		//if only 1 arg, will return numbers 0..f-1 
		t = f - 1;
		f = 0;
	}
	let arr = [];
	//console.log(f,t)
	for (let i = f; i <= t; i += st) {
		//console.log('dsdsdshallo')
		arr.push(i);
	}
	return arr;
}
function removeInPlace(arr, el) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === el) {
			arr.splice(i, 1);
			i--;
			return;
		}
	}
}
function sameList(l1, l2) {
	// compares 2 lists of strings if have same strings in it
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function shuffle_children(d) {
	let arr = Array.from(d.children);
	// arr.map(x => x.remove()); //not needed
	shuffle(arr);
	for (const ch of arr) { mAppend(d, ch); }
}
function shuffleChildren(dParent) { shuffle_children(dParent); }
function sortBy(arr, key) { arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)); return arr; }
function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByFuncDescending(arr, func) { arr.sort((a, b) => (func(a) > func(b) ? -1 : 1)); return arr; }
function sortNumbers(ilist) { ilist.sort(function (a, b) { return a - b }); return ilist; }
function stripToKeys(o,di){
	//return new object with only the keys in keys list
	let res={};
	for(const k in o){
		if (isdef(di[k])) res[k]=o[k];
	}
	return res;
}

function takeFromStart(ad, n) {
	if (isDict(ad)) {
		let keys = Object.keys(ad);
		return keys.slice(0, n).map(x => (ad[x]));
	} else return ad.slice(0, n);
}
function takeFromTo(ad, from, to) {

	if (isDict(ad)) {
		let keys = Object.keys(ad);
		return keys.slice(from, to).map(x => (ad[x]));
	} else return ad.slice(from, to);
}
function toggle_list_member(arr, el) { arrToggleMember(arr, el); }
function union(lst1, lst2) {
	return [...new Set([...lst1, ...lst2])];
}
//#endregion

//#region random
function coin(percent = 50) {
	let r = Math.random();
	//r ist jetzt zahl zwischen 0 und 1
	r *= 100;
	return r < percent;
}
function choose(arr, n, exceptIndices) {
	var result = [];
	var len = arr.length;
	if (n >= arr.length) return arr;

	var taken = new Array(len);
	if (isdef(exceptIndices) && exceptIndices.length < len - n) {
		for (const i of exceptIndices) if (i >= 0 && i <= len) taken[i] = true;
	}
	if (n > len) n = len;
	while (result.length < n) {
		var iRandom = Math.floor(Math.random() * len);
		while (taken[iRandom]) { iRandom += 1; if (iRandom >= len) iRandom = 0; }
		result.push(arr[iRandom]);
		taken[iRandom] = true;
	}
	return result;
}
function chooseRandom(arr, condFunc = null) {
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!isEmpty(best)) return chooseRandom(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function chooseKeys(dict, n, except) { let keys = Object.keys(dict); let ind = except.map(x => keys.indexOf(x)); return choose(keys, n, ind); }
function getRandomNumberSequence(n, minStart, maxStart, fBuild, exceptStart) { //{op,step,fBuild}) {
	let nStart = randomNumber(minStart, maxStart - n + 1);
	if (exceptStart) {
		let att = 10;
		while (att >= 0 && nStart == exceptStart) { att -= 1; nStart = randomNumber(minStart, maxStart - n + 1); }
	}
	if (isNumber(fBuild)) return range(nStart, nStart + (n - 1) * fBuild, fBuild);
	else {
		let res = [], x = nStart;
		for (let i = 0; i < n; i++) {
			res.push(x);
			x = fBuild(x);
		}
		return res;
	}


}
function nRandomNumbers(n, from, to, step) {
	let arr = range(from, to, step);
	return choose(arr, n);
}
function randomizeNum(n, percentUp = 25, percentDown = 25) {
	let max = n * percentUp / 100;
	let min = n * percentDown / 100;
	return randomNumber(n - min, n + max);
}
function randomAlphanum() {
	let s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	return s[randomNumber(0, s.length - 1)];
}
function randomColor(s, l, a) { return isdef(s) ? randomHslaColor(s, l, a) : randomHexColor(); }
function randomConsonant() { let s = 'bcdfghjklmnpqrstvwxz'; return s[randomNumber(0, s.length - 1)]; }
function randomDarkColor() {
	let s = '#';
	for (let i = 0; i < 3; i++) {
		s += chooseRandom([0, 1, 2, 3, 4, 5, 6, 7]) + chooseRandom(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function randomDigit() { let s = '0123456789'; return s[randomNumber(0, s.length - 1)]; }
function randomHexColor() {
	let s = '#';
	for (let i = 0; i < 6; i++) {
		s += chooseRandom(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function randomHslaColor(s = 100, l = 70, a = 1) {
	//s,l in percent, a in [0,1], returns hsla string
	var hue = Math.round(Math.random() * 360);
	return hslToHslaString(hue, s, l, a);
}
function randomLetter() { let s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; return s[randomNumber(0, s.length - 1)]; }
function randomLightColor() {
	let s = '#';
	for (let i = 0; i < 3; i++) {
		s += chooseRandom(['A', 'B', 'C', 'D', 'E', 'F']) + chooseRandom(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function random_motto() { return chooseRandom(["time to play!", "life's good", "one game at a time!", "let's play!", "no place like home", "cafe landmann"]) }
function randomName() { return chooseRandom(coin() ? GirlNames : BoyNames); }
function randomBotName() { return (coin() ? randomVowel() : '') + randomConsonant() + randomVowel() + 'bot'; }
function randomNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min; //min and max inclusive!
}
function randomUserId(len = 20, isNumeric = false) {
	let id = '';
	if (isNumeric) for (let i = 0; i < len; i++) { id += randomDigit(); }
	else for (let i = 0; i < len; i++) { id += randomAlphanum(); }

	//console.log('id',id)
	return id;
}
function randomVowel() { let s = 'aeiouy'; return s[randomNumber(0, s.length - 1)]; }

//#endregion

//#region string functions
function allIntegers(s) {
	//returns array of all numbers within string s
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allNumbers(s) {
	//returns array of all numbers within string s
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => Number(v)); else return null;
	// {console.log(v,typeof v,v[0],v[0]=='-',v[0]=='-'?-(+v):+v,Number(v));return Number(v);});
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function extendWidth(w) { return replaceEvery(w, 'w', 2); }
function filterByLength(w, min, max, allowSpaces = false) { return w.length <= max && w.length >= min && (allowSpaces || !w.includes(' ')); }
function filterDistinctLetters(s) {
	let arr = [];
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (isLetter(ch) && !arr.includes(ch)) arr.push(ch);
	}
	return arr;
}
function findCommonPrefix(s1, s2) {
	let i = 0;
	let res = '';
	while (i < s1.length && i < s2.length) {
		if (s1[i] != s2[i]) break; else res += s1[i];
		i += 1;
	}
	return res;
}
function firstNumber(s) {
	// returns first number in string s
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function html_to_umlaut(html){
	console.log('html',html);
	if (html =='u00c4'){ return 'Ä'; }
	else return html;
}
function toUmlaut(w) {
	//ue ü, ae ä, oe ö
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(toUmlaut(w1));
		return res;
	} else {
		w = replaceAll(w, 'ue', 'ü');
		w = replaceAll(w, 'ae', 'ä');
		w = replaceAll(w, 'oe', 'ö');
		w = replaceAll(w, 'UE', 'Ü');
		w = replaceAll(w, 'AE', 'Ä');
		w = replaceAll(w, 'OE', 'Ö');
		return w;
	}
}
function fromUmlaut(w) {
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(fromUmlaut(w1));
		return res;
	} else {
		//ue ü, ae ä, oe ö
		w = replaceAll(w, 'ü', 'ue');
		w = replaceAll(w, 'ä', 'ae');
		w = replaceAll(w, 'ö', 'oe');
		w = replaceAll(w, 'Ü', 'UE');
		w = replaceAll(w, 'Ä', 'AE');
		w = replaceAll(w, 'Ö', 'OE');
		return w;
	}
}
function getCorrectPrefix(label, text) {

	// let txt = this.input.value;
	// console.log('input value',txt);

	let req = label.toLowerCase();
	let answer = text.toLowerCase();

	let res1 = removeNonAlphanum(req);
	let res2 = removeNonAlphanum(answer);
	let req1 = res1.alphas;// removeNonAlphanum(req);
	let answer1 = res2.alphas; //removeNonAlphanum(answer);
	let whites = res1.whites;

	let common = findCommonPrefix(req1, answer1);

	let nletters = common.length;
	let ireal = 0;
	let icompact = 0;
	let iwhites = 0;
	let correctPrefix = '';
	while (icompact < nletters) {
		if (req[ireal] == common[icompact]) { correctPrefix += label[ireal]; icompact += 1; }
		else if (whites[iwhites] == req[ireal]) { correctPrefix += label[ireal]; iwhites += 1; }
		else break;
		ireal += 1;
	}
	//console.log('__________result:',correctPrefix);

	return correctPrefix;
}
function includesAnyOf(s, slist) { for (const l of slist) { if (s.includes(l)) return true; } return false; }
function normalize_string(s) {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i])) res += s[i]; else if (s[i] == ' ') res += '_'; }
	return res;
}
function ordinal_suffix_of(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function replaceAllX(str, sSub, sBy) { return replaceAllSpecialChars(str, sSub, sBy); }
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }
function replaceAtString(s, i, ssub) { return s.substring(0, i) + ssub + s.substring(i + 1); }
function replaceEvery(w, letter, nth) {
	let res = '';
	for (let i = 1; i < w.length; i += 2) {
		res += letter;
		res += w[i];
	}
	if (w.length % 2) res += w[0];
	return res;
}
function replaceFractionOfWordBy(w, letter = 'w', fr = .5) {
	let len = Math.ceil(w.length * fr);
	let len1 = Math.floor(w.length * fr);
	let sub = letter.repeat(len);
	w = sub + w.substring(0, len1);
	return w;
}
function removeNonAlphanum(s) {
	let res = '';
	let nonalphas = '';
	for (const l of s) {
		if (isAlphaNumeric(l)) res += l; else nonalphas += l;
	}
	return { alphas: res, whites: nonalphas };
}
function reverseString(s) {
	return toLetterList(s).reverse().join('');
}
function sameCaseInsensitive(s1, s2) {
	return s1.toLowerCase() == s2.toLowerCase();
}
function splitAtAnyOf(s, sep) {
	let arr = [], w = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (sep.includes(ch)) {
			if (!isEmpty(w)) arr.push(w);
			w = '';
		} else {
			w += ch;
		}
	}
	if (!isEmpty(w)) arr.push(w);
	return arr;
}
function startsWith(s, sSub) {
	//console.log('s',s,'sSub',sSub)
	//testHelpers('startWith: s='+s+', sSub='+sSub,typeof(s),typeof(sSub));
	return s.substring(0, sSub.length) == sSub;
}
function stringAfter(sFull, sSub) {
	//testHelpers('s='+sFull,'sub='+sSub)
	let idx = sFull.indexOf(sSub);
	//testHelpers('idx='+idx)
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringBetweenLast(sFull, sStart, sEnd) {
	let s1 = stringBeforeLast(sFull, isdef(sEnd) ? sEnd : sStart);
	return stringAfterLast(s1, sStart);
	//return stringBefore(stringAfter(sFull,sStart),isdef(sEnd)?sEnd:sStart);
}
function substringOfMinLength(s, minStartIndex, minLength) {
	let res = s.substring(minStartIndex).trim();
	let i = 0;
	let res1 = '';
	while (res1.trim().length < minLength && i < res.length) { res1 += res[i]; i += 1; }
	return res1.trim();
}
function lettersToArray(s) { return toLetterList(s); }
function toLetterArray(s) { return toLetterList(s); }
function toLetterList(s) { return [...s]; }
function toLetters(s) { return [...s]; }
function toNoun(s) { return capitalize(s.toLowerCase()); }
//#endregion

//#region time and date
//Y/m/d hh:mm:ss
function get_timestamp() { return new Date().getTime(); }
function formatNow() { return new Date().toISOString().slice(0, 19).replace("T", " "); }
function formatDate3(d) { if (nundef(d)) d = new Date(); return d.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " "); }
//Y-m-d hh:mm:ss
function formatDate2(d) { if (nundef(d)) d = new Date(); return d.toISOString().slice(0, 19).replace("T", " "); }
//d-m-Y
function formatDate1(d) {
	//usage: formatDate(new Date(2010, 7, 5);
	if (nundef(d)) d = Date.now();
	let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
	let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
	let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
	return `${da}-${mo}-${ye}`;
}
//m/d/y
function formatDate(d) {
	const date = isdef(d) ? d : new Date();
	const month = ('0' + date.getMonth()).slice(0, 2);
	const day = date.getDate();
	const year = date.getFullYear();
	const dateString = `${month}/${day}/${year}`;
	return dateString;
}

function format2Digits(i) { return (i < 10) ? "0" + i : i; }
function msNow() { return Date.now(); }
function msToTime(ms) {
	let secs = Math.floor(ms / 1000);
	let mins = Math.floor(secs / 60);
	secs = secs - mins * 60;
	let hours = Math.floor(mins / 60);
	mins = mins - hours * 60;
	return { h: hours, m: mins, s: secs };
}
function format_datetime(timestamp, str = 'y-m-d_h:i:s.r') {
	if (isString(timestamp)) timestamp = Number(timestamp);
	const plus0 = num => `0${num.toString()}`.slice(-2)
	const d = new Date(timestamp)
	const year = d.getFullYear()
	const monthTmp = d.getMonth() + 1
	const month = plus0(monthTmp)
	const date = plus0(d.getDate())
	const hour = plus0(d.getHours())
	const minute = plus0(d.getMinutes())
	const second = plus0(d.getSeconds())
	const rest = timestamp.toString().slice(-5)

	let res = '';
	str = str.toLowerCase();
	for (let i = 0; i < str.length; i++) {
		let ch = str[i];
		res += (ch == 'y' ? year : ch == 'm' ? month : ch == 'd' ? date : ch == 'h' ? hour : ch == 'i' ? minute : ch == 's' ? second : ch == 'r' ? rest : ch);
	}
	return res;
	//return `${year}-${month}-${date}_${hour}:${minute}:${second}.${rest}`; //orig 

}
function msElapsedSince(msStart) { return Date.now() - msStart; }
function timeToMs(h, m, s) { return ((((h * 60) + m) * 60) + s) * 1000; }
//#endregion

//#region Timit Timers TimeoutManager
class TimeoutManager {
	constructor() {
		this.TO = {};
	}
	clear(key) {
		if (nundef(key)) key = Object.keys(this.TO);
		else if (isString(key)) key = [];

		for (const k of key) {
			clearTimeout(this.TO[k]);
			delete this.TO[k];
		}
	}
	set(ms, callback, key) {
		if (nundef(key)) key = getUID();
		TO[key] = setTimeout(ms, callback);
	}
} class TimeIt {
	constructor(msg, showOutput = true) {
		this.showOutput = showOutput;
		this.init(msg);
	}
	getTotalTimeElapsed() {
		let tNew = new Date();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		return tDiffStart;
	}
	tacit() { this.showOutput = false; }
	timeStamp(name) {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.namedTimestamps.start.getTime();// this.t.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs * to', name);
		this.t = tNew;
		this.namedTimestamps[name] = tNew;
	}
	reset() { this.init('timing start') }
	init(msg) {
		this.t = new Date();
		if (this.showOutput) console.log('___', msg);
		this.namedTimestamps = { start: this.t };
	}
	showSince(name, msg = 'now') {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tNamed = this.namedTimestamps[name];
		if (this.showOutput) if (!tNamed) { console.log(name, 'is not a timestamp!'); return; } //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - tNamed.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs', name, 'to', msg);
		this.t = tNew;
	}
	format(t) { return '___' + t.getSeconds() + ':' + t.getMilliseconds(); }
	show(msg) { this.showTime(msg); }
	showTime(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		//if (this.showOutput) console.log(this.format(tNew), ':', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		if (this.showOutput) console.log('___ ', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		this.t = tNew;
	}
	start_of_cycle(msg) {
		this.init(msg);
	}
	end_of_cycle(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log('___ ' + tDiff + ' msecs', msg, 'to EOC (total: ' + tDiffStart + ')');
	}
}
//#endregion

//#region asset helpers
function buildNewSyms() {
	let newSyms = {};
	for (const k of KeySets.all) {
		let info = Syms[k];
		console.log(info)
		delete info.w;
		delete info.h;
		let old = symbolDict[k];
		console.log('old symbol:', old);
		if (isdef(old)) {
			addIf(info.cats, old.group);
			addIf(info.cats, old.subgroups);
		}
		newSyms[k] = Syms[k];
		//break;
	}
	downloadAsYaml(newSyms, 'newSyms')
}

//#endregion

//#region misc helpers (auch type check is...)
function allElementsFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}
function clearElement(elem) {
	//console.log(elem);
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function convertUmlaute(w) {
	//ue ü, ae ä, oe ö

	w = replaceAll(w, 'ue', 'ü');
	w = replaceAll(w, 'ae', 'ä');
	w = replaceAll(w, 'oe', 'ö');
	w = replaceAll(w, 'UE', 'Ü');
	w = replaceAll(w, 'AE', 'Ä');
	w = replaceAll(w, 'OE', 'Ö');
	w = replaceAll(w, 'ß', 'ss');
	return w;
}
function createElementFromHtml(s) { return createElementFromHTML(s); }
function createElementFromHTML(htmlString) {
	//console.log('---------------',htmlString)
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();// '<div>halloooooooooooooo</div>';// htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	//console.log(div.firstChild)
	return div.firstChild;
}
function divInt(a, b) { return Math.trunc(a / b); }
function errlog() { console.log('ERROR!', ...arguments); }
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }
function evToClass(ev, className) {
	//returns first ancestor that has this class
	let elem = findParentWithClass(ev.target, className);
	return elem;
}
function evToClosestId(ev) {
	//returns first ancestor that has an id
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToProp(ev, prop) {
	let x = ev.target;
	while (isdef(x) && nundef(x.getAttribute(prop))) x = x.parentNode;
	return isdef(x) ? x.getAttribute(prop) : null;
}
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function evToClass(ev, className) {
	let elem = findParentWithClass(className);
	return elem;
}
function findAttributeInAncestors(elem, attr) { 
	let val;
	while (elem && nundef(val = elem.getAttribute(attr))) { elem = elem.parentNode; } 
	return val; 
}
function findParentWithClass(elem, className) { while (elem && !mHasClass(elem, className)) { elem = elem.parentNode; } return elem; }
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }
function findAncestorElemWithParentOfType(el, type) {
	while (el && el.parentNode) {
		let t = getTypeOf(el);
		let tParent = getTypeOf(el.parentNode);
		//console.log('el', t, tParent, 'el.id', el.id, 'parentNode.id', el.parentNode.id);
		if (tParent == type) break;
		el = el.parentNode;
	}
	return el;

}
function findAncestorElemOfType(el, type) {
	while (el) {
		let t = getTypeOf(el);
		if (t == type) break;
		el = el.parentNode;
	}
	return el;

}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		//console.log('....findChildWithClass', ch, ch.classList, className)
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function hasWhiteSpace(s) { return /\s/g.test(s); }
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (nundef(elem)) return;
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function getBaseLog(x, b) { return Math.log(x) / Math.log(b); }
function getDivisors(n) {
	let x = Math.floor(Math.sqrt(n));

	let res = [];
	for (let i = 2; i <= x; i++) {
		let q = n / i;
		if (q == Math.round(q)) res.push(i);
	}
	return res;
}
function getTypeOf(param) {
	//console.log('>>>>>getTypeOf',param)
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function getVerticalOverflow(element) { return element.scrollHeight - element.clientHeight; }
function getVisibleChild(id) { for (const ch of mBy(id).children) if (ch.style.display != 'none') return ch.id; }
function isAlphaNum(s) {
	//regex version: Here 
	// ^ means beginning of string and 
	// $ means end of string, and [0-9a-z]+ means one or more of character from 0 to 9 OR from a to z.
	// i means case insensitive

	return /^[a-z0-9_]+$/i.test(s); // only lower case: /^[0-9a-z_]+$/);

	//alternativ: /[a-zA-Z0-9-_ ]/.test(charEntered)
}
function isAlphaNumeric(str) {
	var code, i, len;

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123) && str[i] != '_') { // lower alpha (a-z)
			return false;
		}
	}
	return true;
}
function isCapitalLetter(s) { return /^[A-Z]$/i.test(s); }
function isCapitalLetterOrDigit(s) { return /^[A-Z0-9ÖÄÜ]$/i.test(s); }
function isGermanColorName(s) { return isColorName(s) || isdef(GermanToEnglish[s]) && isColorName(GermanToEnglish[s]); }
function isColorName(s) { ensureColorNames(); return (isdef(ColorNames[s.toLowerCase()])); }
function isdef(x) { return x !== null && x !== undefined; }
function isDOM(x) { let c = lookup(x, ['constructor', 'name']); return c ? startsWith(c, 'HTML') || startsWith(c, 'SVG') : false; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isDictOrList(d) { return typeof (d) == 'object'; }
function isDigit(s) { return /^[0-9]$/i.test(s); }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isSingleDigit(s) { return /^[0-9]$/i.test(s); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function isVisible(elem) { // Where el is the DOM element you'd like to test for visibility
	//console.log(elem)
	if (isString(elem)) elem = document.getElementById(elem);
	let x = elem.style.flex;
	//console.log('flex', x);
	return (elem.style.display != 'none' || elem.offsetParent !== null) && (nundef(elem.style.flex) || !endsWith(elem.style.flex, '0%'));
	// console.log('style',elem.style.flex  == '0 1 0%')
	// if (isdef(elem.style.flex)) return elem.style.flex != '0 1 0%';
	// else return (elem.style.display != 'none' || elem.offsetParent !== null);
}
function isWhiteSpace(ch) { return /\s/.test(ch) }
function isWhiteSpace2(ch) {
	const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	return !alphanum.includes(ch);
}
function isWhiteSpaceString(s) { return isEmptyOrWhiteSpace(s); }
function isOverflown(element) {
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function jsCopy(o) {
	//console.log(o)
	return JSON.parse(JSON.stringify(o));
}
function jsSafeStringify(obj, indent = 2) {
	// usage:
	//console.log('options', JSON.safeStringify(options))
	let cache = [];
	const retVal = JSON.stringify(
		obj,
		(key, value) =>
			typeof value === "object" && value !== null
				? cache.includes(value)
					? undefined // Duplicate reference found, discard key
					: cache.push(value) && value // Store value in our collection
				: value,
		indent
	);
	cache = null;
	//console.log('safeStringify returns',retVal)
	return retVal;
};
function jsCopySafe(o) {
	//der safeStringify schmeisst html elems weg!!!
	//console.log('jsCopySafe',o);
	if (nundef(o)) return;
	//console.log(o)
	return JSON.parse(jsSafeStringify(o)); //macht deep copy
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function normalize(text, language) {
	if (isEmpty(text)) return '';
	text = text.toLowerCase().trim();
	if (language == 'D') {
		text = convertUmlaute(text);
	}
	return text;
}
function nundef(x) { return x === null || x === undefined; }
function purge(elem) {
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			if (typeof elem[n] === 'function') {
				elem[n] = null;
			}
		}
	}
	a = elem.childNodes;
	if (a) {
		l = a.length;
		// for (i = 0; i < l; i += 1) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			//console.log(elem.id, a, elem.childNodes[i]);
			purge(elem.childNodes[i]);
		}
	}
	elem.remove(); //elem.parentNode.removeChild(elem);
}
function queryStringToJson() {
	let q = window.location.search;
	//console.log('query string:', q);
	if (isEmpty(q)) return {};
	q = q.substring(1);
	let result = {};
	let parts = q.split('&');
	for (const p of parts) {
		let key = stringBefore(p, '=');
		let val = stringAfter(p, '=');
		result[key] = val;
	}
	return result;

}
function setCSSVariable(varName, val) {
	let root = document.documentElement;
	root.style.setProperty(varName, val);
}
function setCssVar(varname, val) { document.body.style.setProperty(varname, val); }
function getCssVar(varname) { return getComputedStyle(document.body).getPropertyValue(varname); }// CSSStyleDeclaration.getPropertyValue(varname);} //) document.body.style.getPropertyValue(varname); }
function getCSSVariable(varname) { return getCssVar(varname); } //document.body.style.getPropertyValue(varname); }
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
	return elem;
}
function valf(val, def) { return isdef(val) ? val : def; }
//#endregion

//#region UID helpers
var UIDCounter = 0;
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
var FRUIDCounter = -1;
function getFruid(pref = '') {
	const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	FRUIDCounter += 1;
	if (FRUIDCounter < alpha.length) return pref + alpha[FRUIDCounter];
	return pref + FRUIDCounter - alpha.length;
}
function resetUIDs() { UIDCounter = 0; FRUIDCounter = -1; }

//#endregion

//#region utilities
function collectPropFromCss(prop) {
	const styles = document.styleSheets;
	let cssArr = [...styles[0].cssRules].map(x => ({
		class: x.selectorText,
		color: rgbToHex(x.style[prop]),
	}));
	return cssArr;
}
function extractColorsFromCss() {

	let arr = collectPropFromCss('background-color');
	var di = {};

	for (const o of arr) {
		let sarr = splitAtAnyOf(o.class, ' .-:,');
		let sColor = null;
		for (const w of sarr) {
			if (['w3', 'text', 'hover', 'border'].includes(w)) continue;
			sColor = w;
			break;
		}

		//console.log('color', o.color, typeof o.color, "'" + o.color + "'")
		if (sColor && o.color) {
			//console.log('eintrag!', o.color)
			di[sColor] = o.color; //"'" + o.color + "'"; //'hallo'; //o.color.toString();
		}
	}

	//console.log('diaaaaaaaaaa', di);
	//downloadAsYaml(di, 'diColors');
	return di;

}

//#endregion

//#region PerlenGame common code!

function createServerBoard(layout, filename, rows, cols) {
	let sz = 100;
	return { filename: 'brett10', layout: 'hex', cells: { w: 100, h: 120, wgap: 10, hgap: 10 } };
}
function createServerPoolKeys(perlenDict, settings = {}) { return getRandomPerlenKeys(perlenDict, valf(settings.numPool, 20)); }
function getRandomPerlenKeys(di, n) { return choose(Object.keys(di), n); }
function ensureKeys(o, def) {
	addKeys(def, o);
}
function initServerPool(settings, state, perlenDict) {
	let pool = {};
	let poolArr = [];
	let maxPoolIndex = 0;
	addKeys(settings, { poolSelection: 'random', numPool: 20 });
	let n = settings.poolSelection != 'player' ? settings.numPool : 0;

	let keys = getRandomPerlenKeys(perlenDict, n);

	//keys[0]='gelb';

	for (const k of keys) {
		addToPool(pool, poolArr, perlenDict[k], maxPoolIndex);
		maxPoolIndex += 1;
	}
	state.pool = pool;
	state.poolArr = poolArr;
	return maxPoolIndex;
}
function addToPool(pool, poolArr, perle, index) {
	let p = pool[index] = { key: perle.key, index: index };
	poolArr.push(index);
	return p;
}
function getFilename(path, withExt = true) {
	let fname = stringAfterLast(path, '/');
	let name = stringBefore(fname, '.');
	let ext = stringAfter(fname, '.');
	if (isEmpty(ext)) ext = 'png';
	let result = withExt ? (name + '.' + ext) : name;
	console.log(`filename (ext:${withExt}): ${result}`);
	return result;
}
function getPublicPath(filename) {
	let result = './public/' + getFilename(filename);
	console.log('pubPath', result);
	return result;
}
function uploadImgData(imgFile) {
	let pack = {};
	let data = imgFile.data;
	let filename = imgFile.name; console.log('filename', filename);
	let key = stringBefore(filename, '.');
	pack[key] = { data: data, name: key, filename: filename, type: 'imageData' };
	Socket.emit('generalImages', { pack: pack });
	console.log('uploading pack', pack);
}

function previewBrowsedFile(dParent, imgFile) {

	// container
	var imgView = document.createElement("div");
	imgView.className = "image-view";
	mAppend(dParent, imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
		imgFile.data = e.target.result; //img.toDataURL("image/png");
	}
	reader.readAsDataURL(imgFile);
}
//#endregion

//#region TO BE SORTED
function dictToKeyList(x) { return Object.keys(lst).join(' '); }
function dictToValueList(x) { return Object.values(lst).join(' '); }
function dictToKVList(x) { return Object.entries(lst).join(' '); }
function dictOrListToString(x, ifDict = 'keys') {
	let lst = x;
	if (isList(lst) && !isEmpty(lst)) { return lst.join(' '); }
	else if (isDict(lst)) {
		return ifDict == 'keys' ? Object.keys(lst).join(' ')
			: ifDict == 'values' ? Object.keys(lst).join(' ')
				: Object.entries(lst).join(' ');
	}
	else return null;
}
function indexOfFuncMax(arr, prop, f) {
	let max = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		let val = isdef(prop) && isdef(v[prop]) ? v[prop] : v;
		if (isdef(f)) val = f(val);
		if (max == null || val > max) { max = val; imax = i }
	}
	return { i: imax, val: max };
}
function indexOfFuncMin(arr, prop, f) {
	let min = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		let val = isdef(prop) && isdef(v[prop]) ? v[prop] : v;
		if (isdef(f)) val = f(val);
		if (min == null || val < min) { min = val; imax = i }
	}
	return { i: imax, val: min };
}

function indexOfMax(arr, prop) {
	let max = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			//console.log(i,v[prop])
			if (max == null || v[prop] > max) {
				//console.log(max,lookup(v, [prop]))
				max = v[prop];
				imax = i;
			}
		} else {
			if (max == null || v > max) {
				max = v;
				imax = i;
			}
		}

	}
	return { i: imax, val: max };
}
function indexOfMin(arr, prop) {
	let min = null;
	let imin = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			if (min == null || lookup(v, [prop]) < min) {
				//console.log(min,lookup(v, [prop]))
				min = v[prop];
				imin = i;
			}
		} else {
			if (min == null || v < min) {
				min = v;
				imin = i;
			}
		}
	}
	return { i: imin, val: min };
}
function listToString(lst) { return isEmpty(lst) ? lst : lst.join(' '); }
function mNodeFilter(o, { sort, dParent, title, lstFlatten, lstOmit, lstShow, className = 'node', omitEmpty = false } = {}) {
	let oCopy = !isEmpty(lstShow) ? filterByKey(o, lstShow) : jsCopySafe(o);
	if (isList(lstFlatten)) recConvertToSimpleList(oCopy, lstFlatten);
	if (nundef(lstOmit)) lstOmit = [];
	if (omitEmpty || !isEmpty(lstOmit)) oCopy = recDeleteKeys(oCopy, omitEmpty, lstOmit);
	let d = mCreate('div');
	if (isdef(className)) mClass(d, className);
	switch (sort) {
		case 'keys': oCopy = sortKeys(oCopy); break;
		case 'all': oCopy = JSON.sort(oCopy); break;
	}
	mYaml(d, oCopy);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function presentNode(o, title, area, lstFlatten, lstShow, lstOmit = [], lstOmitTopLevel = []) {

	if (!isEmpty(lstOmitTopLevel)) {
		let oNew = {};
		for (const k in o) {
			if (lstOmitTopLevel.includes(k)) continue;
			oNew[k] = o[k];
		}
		o = oNew;
	}

	addIf(lstOmit, 'act');
	addIf(lstOmit, 'ui');
	addIf(lstOmit, 'live');

	let d = isString(area) ? mBy(area) : area;
	mNodeFilter(o, { dParent: d, title: title, lstFlatten: lstFlatten, lstShow: lstShow, lstOmit: lstOmit });
}
function recConvertToList(n, listOfProps) {
	//console.log(n)
	if (isList(n)) { n.map(x => recConvertToList(x, listOfProps)); }
	else if (isDict(n) && isList(listOfProps)) {
		for (const prop of listOfProps) {
			let lst = n[prop];
			if (isList(lst) && !isEmpty(lst)) { n[prop] = lst.join(' '); }
		}
		for (const k in n) { recConvertToList(n[k], listOfProps); }
	}
}
function recConvertToSimpleList(n, listOfProps) {
	//console.log(n)
	if (isList(n)) { n.map(x => recConvertToList(x, listOfProps)); }
	else if (isDict(n) && isList(listOfProps)) {
		for (const prop of listOfProps) {
			let conv = dictOrListToString(n[prop]);
			if (conv) n[prop] = conv;
			// let lst = n[prop];
			// if (isList(lst) && !isEmpty(lst)) { n[prop] = lst.join(' '); }
			// else if (isDict(lst)) { n[prop] = Object.keys(lst).join(' '); }
		}
		for (const k in n) { recConvertToList(n[k], listOfProps); }
	}
}
function recDeleteKeys(o, deleteEmpty = true, omitProps) {
	//console.log('hallllllllllllllllllll')
	if (isLiteral(o)) return o;
	else if (isList(o)) return o.map(x => recDeleteKeys(x, deleteEmpty, omitProps));
	let onew = {};
	for (const k in o) {
		if (omitProps.includes(k)) continue;
		//console.log(k)
		if (isLiteral(o[k]) || !isEmpty(o[k])) {
			onew[k] = recDeleteKeys(jsCopy(o[k]), deleteEmpty, omitProps);
		} else {
			//console.log('EMPTY!!!!!!!!!!!!!',k,o[k])
		}
	}
	return onew;
}
function sortKeysNonRecursive(o) {
	// sort by keys only topmost objects!
	if (Array.isArray(o)) {
		return o.map(sortKeysNonRecursive); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.sort()
			.reduce(function (a, k) {
				a[k] = o[k];

				return a;
			}, {});
	}
	return o;
}
function sortKeysNonRecursiveDescending(o) {
	// sort by keys only topmost objects!
	if (Array.isArray(o)) {
		return o.map(sortKeysNonRecursiveDescending); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.reverse()
			.reduce(function (a, k) {
				a[k] = o[k];

				return a;
			}, {});
	}
	return o;
}
function sortKeys(o) {
	// sortKeys does NOT sort lists!!!!
	if (Array.isArray(o)) {
		return o.map(sortKeys); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.sort()
			.reduce(function (a, k) {
				a[k] = sortKeys(o[k]);

				return a;
			}, {});
	}
	return o;
}


