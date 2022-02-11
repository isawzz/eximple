
function color_users(){
	//console.log('HALLO!!!');
	for(const u of serverData.users){
		let elem=mBy(`tr_${u.id}`);
		let links = Array.from(elem.getElementsByTagName('a'));
		for(const l of links) mStyle(elem,{fg:'white'});
		mStyle(elem,{bg:u.color,fg:'contrast'});
	}
}
function set_user(id){
	User = firstCond(serverData.users,x=>x.id == id);
	
}














