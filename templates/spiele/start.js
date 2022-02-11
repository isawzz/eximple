
function color_users(){
	//console.log('HALLO!!!');
	for(const u of Users){
		let elem=mBy(`tr_${u.id}`);
		let links = Array.from(elem.getElementsByTagName('a'));
		for(const l of links) mStyle(elem,{fg:'white'});
		mStyle(elem,{bg:u.color,fg:'contrast'});
	}
}
function onclick_play(elem){
	let tr = elem.parentNode.parentNode;
	console.log('clicked on ',tr);
	let id = Number(tr.id.substring(3));
	Table = firstCond(Tables,x=>x.id == id);
	Table.admin = Table.players[0];
	console.log('table picked is',Table.name, Table);
}














