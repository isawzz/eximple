window.onload = start; //start_testing | start
async function start() {
	
	//load assets
	document.body.style.opacity=1;

	Syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	console.log('Syms',Syms);
	ByGroupSubgroup = await route_path_yaml_dict('../base/assets/symGSG.yaml');
	WordP = await route_path_yaml_dict('../base/assets/math/allWP.yaml');
	C52 = await route_path_yaml_dict('../base/assets/c52.yaml');
	Cinno = await route_path_yaml_dict('../base/assets/fe/inno.yaml');
	inno_create_card_assets();
	ari_create_card_assets('rbgyop');
	KeySets = getKeySets();
	DB = await route_path_yaml_dict('../base/DB.yaml');

	//loader_off();
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');

	Session.cur_user = valf(queryStringToJson().user, 'guest');
	G=Session;
	

}

async function start_testing(){}
