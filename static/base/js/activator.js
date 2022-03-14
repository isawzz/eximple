function register_node(content, type, oid, path, r) {
	let n = {
		content: content,
		type: type,
		oid: oid,
		path: path,
		children: [],
	};
	r.add_node(n, oid);
	return n;
}
function rec_create_nodes_tree(r, t, path, keys) {
	if (isLiteral(t)) {
		let type = is_game_card(t) ? 'card' : typeof t;
		return register_node(t, type, getUID('o'), path, r);
	} else if (isList(t)) {

		//variante 1: if list contains card keys, content will be of type cardlist, content: this list:
		let content = t;
		let type;
		if (startsWith(path, 'deck') || startsWith(path, 'achievements')) {
			type = 'deck';
		} else if (!isEmpty(t) && is_game_card(t[0])) { 
			type = 'cardlist';
		}
		//variante 2: default: content ist ein title aus dem path, type string:
		else {
			type = 'string';
		}
		let n = register_node(content, type, getUID('o'), path, r);
		//akku.push(path);

		//variante 3: each list element ist its own object:
		//uncomment if want each card to be its own object!
		if (type == 'cardlist') {
			let ch = [];
			let i = 0;
			for (const el of t) {
				if (!isLiteral(el)) continue;
				//let n1 = traverse_tree(r, el, path + '.' + i, keys);
				let type = is_game_card(el) ? 'card' : typeof t;
				let n1 = register_node(el, type, getUID('o'), path + '.' + el, r);
				i += 1;
				ch.push(n1.oid);
			}
			n.children = ch;
		}
		return n;
	} else if (isDict(t)) {
		let n = register_node(stringAfterLast(path, '.'), 'string', getUID('o'), path, r);
		let ch = [];
		for (const k in t) {
			if (nundef(keys[k]) && k.length > 1) { continue; } //console.log('continue at',k); continue;}
			let pnew = isEmpty(path) ? k : path + '.' + k;
			//console.log('path',pnew); akku.push(pnew);
			let tnew = t[k];
			let n1 = rec_create_nodes_tree(r, tnew, pnew, keys);
			//console.log('n1',n1);
			ch.push(n1.oid);
		}
		n.children = ch;
		return n;
	} else { 
		let type = 'null'; 
		return register_node('null', type, getUID('o'), path, r);
	}
}
function rec_create_nodes_tree_akku(r, t, path, keys, akku) {
	if (isLiteral(t)) {
		let type = is_game_card(t) ? 'card' : typeof t;
		return register_node(t, type, getUID('o'), path, r);
	} else if (isList(t)) {

		//variante 1: if list contains card keys, content will be of type cardlist, content: this list:
		let content = t;
		let type;
		if (startsWith(path, 'deck') || startsWith(path, 'achievements')) {
			type = 'deck';
		} else if (!isEmpty(t) && is_game_card(t[0])) { 
			type = 'cardlist';
		}
		//variante 2: default: content ist ein title aus dem path, type string:
		else {
			type = 'string';
		}
		let n = register_node(content, type, getUID('o'), path, r);
		//akku.push(path);

		//variante 3: each list element ist its own object:
		//uncomment if want each card to be its own object!
		if (type == 'cardlist') {
			let ch = [];
			let i = 0;
			for (const el of t) {
				if (!isLiteral(el)) continue;
				//let n1 = traverse_tree(r, el, path + '.' + i, keys);
				let type = is_game_card(el) ? 'card' : typeof t;
				let n1 = register_node(el, type, getUID('o'), path + '.' + el, r);
				i += 1;
				ch.push(n1.oid);
			}
			n.children = ch;
		}
		return n;
	} else if (isDict(t)) {
		let n = register_node(stringAfterLast(path, '.'), 'string', getUID('o'), path, r);
		let ch = [];
		for (const k in t) {
			if (nundef(keys[k]) && k.length > 1) { continue; } //console.log('continue at',k); continue;}
			let pnew = isEmpty(path) ? k : path + '.' + k;
			//console.log('path',pnew); 
			akku.push(pnew);
			let tnew = t[k];
			let n1 = rec_create_nodes_tree_akku(r, tnew, pnew, keys, akku);
			//console.log('n1',n1);
			ch.push(n1.oid);
		}
		n.children = ch;
		return n;
	} else { 
		let type = 'null'; 
		return register_node('null', type, getUID('o'), path, r);
	}
}
function inno_create_ui_tree(n, dParent, r) {
	let d;
	//console.log('create_ui_tree', n.path, n.type);

	if (n.path.includes('splays')) {
		//console.log('splays not presented!')
	} else if (n.path.includes('achievements')) {
		let id = getUID('u');
		d = mDiv(dParent, { bg: 'sienna', fg: 'white', w: '100%' }, id, n.path);
		mFlexWrap(d);
		for (const cont of n.content) {
			let card = InnoById[cont];
			let d1 = mDiv(d, { bg: 'sienna', margin: 4, border: 'blue', wmin: 25 }, null, isdef(card) ? card.age : cont);
		}
		r.add_ui_node(d, id, n.oid);

	} else if (startsWith(n.path, 'deck')) {
		mFlexWrap(dParent);
		let id = getUID('u');
		let styles = isNumber(stringAfterLast(n.path, '.')) ? { bg: 'beige', fg: 'black', margin: 4, border: 'red', wmin: 25 } : { bg: 'beige', fg: 'black' };
		d = mDiv(dParent, styles, id, n.path);
		r.add_ui_node(d, id, n.oid);

	} else if (r.otree.player_names.includes(n.content)) {

		let id = getUID('u');
		let bg = r.otree[n.content].color;
		let styles = { bg: bg, fg: 'contrast', w: '100%' };
		d = mDiv(dParent, styles, id, n.path);
		r.add_ui_node(d, id, n.oid);

	} else if (n.type == 'cardlist' && !n.path.includes('board')) {

		let id = getUID('u');
		d = mDiv(dParent, { bg: '#00000080', gap: 10, padding: 10 }, id, stringAfterLast(n.path, '.'));
		mCenterFlex(d);
		r.add_ui_node(d, id, n.oid);

	} else if (n.type == 'string' && !endsWith(n.path, 'board')) {

		//if (n.oid == 'o_1') console.log('===>o_1 n',n)
		let id = getUID('u');
		d = mDiv(dParent, { bg: 'inherit' }, id, n.content);
		r.add_ui_node(d, id, n.oid);

	} else if (endsWith(n.path, 'board')) { // *** BOARD !!!!!!!!!!!!!!!!!!!!!!***
		//console.log('n.path', n.path)
		let id = getUID('u');
		d = mDiv(dParent, { bg: 'inherit' }, id, n.content);
		mFlexWrap(d);
		r.add_ui_node(d, id, n.oid);

	} else if (n.type == 'cardlist' && n.path.includes('board')) { // *** BOARD COLOR !!!!!!!!!!!!!!!!!!!!!!***

		let id = getUID('u');
		d = mDiv(dParent, {}, id);

		//splay: 
		let splay = inno_get_splay(r.otree, n.path);
		//console.log('splay of', n.path, splay); 
		let [num, wcard, hcard, ov] = [n.content.length, 300, 200, 78];
		mContainerSplay(d, splay, wcard, hcard, num, ov);
		r.add_ui_node(d, id, n.oid);

	} else if (n.type == 'card') {

		let c;
		if (n.path.includes('board')) { // *** BOARD COLOR CARD !!!!!!!!!!!!!!!!!!!!!!!! ***
			c = inno_present_card(dParent, n.content);
			let list = lookup(Session.otree, stringBeforeLast(n.path, '.').split('.'));
			let splay = inno_get_splay(r.otree, n.path);
			mItemSplay(c, list, splay);

			// let d = iDiv(c);
			// let idx = list.indexOf(n.content);
			//d.style.zIndex = splay != 2 ? list.length - idx : 0;
			//console.log('card', n.content, 'is', idx, 'th in list of', list.length);

		} else {
			c = inno_present_card(dParent, n.content);
			let d = iDiv(c);
		}
		r.add_ui_node(iDiv(c), c.id, n.oid);

	}
	//if (n.oid == 'o_1') console.log('===>o_1 n',n)
	if (nundef(d)) return;
	for (const ch of n.children) {
		inno_create_ui_tree(r.nodes[ch], d, r);
	}
}

class RSG {
	constructor() {
		this.nodes = {};
		this.uiNodes = {};
		this.isUiActive = false;
		this.uid2oids = {};
		this.oid2uids = {};
		this.path2oid = {};
	}
	//addUI(item,oid)
	add_node(n, oid) {
		this.nodes[oid] = n;
		if (isEmpty(n.path)) this.root = n;
		if (isList(n.content) && n.content.length == 0) {
			//console.log('CONTENT EMPTY LIST!!!!!!!!!!!!');
			n.type = 'empty_list';
		}
		this.path2oid[n.path] = n.oid;
		console.assert(nundef(Items[n.path]), 'duplicate path in Items!!! ' + n.path);
		console.assert(nundef(Items[oid]), 'duplicate oid in Items!!! ' + oid);
		Items[n.oid] = Items[n.path] = n;

	}
	add_ui_node(ui, uid, oid) {
		this.uiNodes[uid] = ui;
		lookupAddIfToList(this.uid2oids, [uid], oid);
		lookupAddIfToList(this.oid2uids, [oid], uid);
		if (Items[oid].type != 'card') console.assert(nundef(Items[uid]), 'duplicate uid in Items!!! ' + uid);
		Items[uid] = ui;
		let o = Items[oid];
		ui.setAttribute('oid', oid);
		iAdd(o, { div: ui });
	}
	getUI(uid) { return this.uiNodes[uid]; }
	get_item_from_path(path) { return Items[path]; }
	get_item(id) {
		if (id[0] == '_') {
			let oid = Items[id].getAttribute('oid');
			return Items[oid];
		} else return Items[id];
	}

}
class Activator {
	static maxZIndex = 0;
	constructor(n, ui, R) {
		this.n = n; //a uiNode
		this.ui = isdef(n.uiActive) ? n.uiActive : ui;
		this.uid = n.uid;
		this.R = R;
		this.hoverActive = false;
		this.clickActive = false;
	}
	activate(fEnter, fLeave, fClick) {
		//console.log('activate', this.uid);
		this.activateHover(fEnter, fLeave); this.activateClick(fClick);
	}
	activateHover(fEnter, fLeave) {
		if (this.hoverActive) return;
		this.hoverActive = true;
		this.ui.onmouseenter = (ev) => { ev.stopPropagation(); fEnter(this.uid, this.R); }
		this.ui.onmouseleave = (ev) => { ev.stopPropagation(); fLeave(this.uid, this.R); }
	}
	activateClick(fClick) {
		if (this.clickActive) return;
		this.clickActive = true;
		this.ui.onclick = (ev) => { ev.stopPropagation(); fClick(this.uid, this.R); }
	}
	deactivate() {
		if (!this.hoverActive && !this.clickActive) return;
		this.deactivateHover();
		this.deactivateClick();
	}
	deactivateHover() {
		if (!this.hoverActive) return;
		this.hoverActive = false;

		removeEvents(this.ui, 'mouseenter', 'mouseleave');
	}
	deactivateClick() {
		if (!this.clickActive) return;
		this.clickActive = false;

		removeEvents(this.ui, 'click');
	}
}

function activateUis(R) {
	//console.log('activating uis!!!')
	for (const uid in R.uiNodes) {
		let n = R.uiNodes[uid];
		if (isdef(n.oid) && isdef(n.ui)) {
			n.act.activate(highSelfAndRelatives, unhighSelfAndRelatives, selectUid);
		}
	}
	R.isUiActive = true;
}
function deactivateUis(R) {
	//console.log('deactivating uis!!!')
	for (const uid in R.uiNodes) {
		let n = R.uiNodes[uid];
		if (n.oid && n.ui) {
			//console.log(n);
			n.act.deactivate();
		}
	}
	R.isUiActive = false;
}
function highSelfAndRelatives(uid, R) {
	for (const oid of R.uid2oids[uid]) {
		for (const uid1 of R.oid2uids[oid]) {
			//console.log('high',uid1)
			//console.log('activate','uid',uid,'oid',oid);
			//if (oid == '145') continue;
			let ui = R.getUI(uid1);
			mHigh(ui);
		}
	}
	//also if this uid is an object overlapped by other objects, bringToFront
	let n = R.uiNodes[uid];
	if (n.potentialOverlap) {
		let ui = R.getUI(uid);
		bringToFront(ui);
	}
}
function unhighSelfAndRelatives(uid, R) {
	for (const oid of R.uid2oids[uid]) {
		for (const uid1 of R.oid2uids[oid]) {
			let ui = R.getUI(uid1);
			mUnhigh(ui);
		}
	}
	let n = R.uiNodes[uid];
	if (n.potentialOverlap) {
		let ui = R.getUI(uid);
		sendToBack(ui);
	}
}
function selectUid(uid, R) {
	console.log('user has selected', uid);
}


function bringToFront(ui) {
	ui.style.zIndex = Activator.maxZIndex;
	Activator.maxZIndex += 1;
}
function sendToBack(ui) {
	ui.style.zIndex = 0;
	//delete ui.style.zIndex; // = Activator.maxZIndex;
	//Activator.maxZIndex += 1;
}









