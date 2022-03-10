onload = startsinglepage;

async function startsinglepage() {
	await ensureAssets();

	dTitle = mBy('dTitle');
	show_title('My Little World');
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });

	dTable = mBy('dTable');
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	

	//DA.useritems = show_users(dTable);
	DA.gameitems = show_gametable(dTable);

	show_user(); //show_home_logo();

	//console.log('G',G, 'Serverdata.game',Serverdata.game)
	if (isdef(G)) {
		presentgame(G,dTable,U.name);
		activategame(G,U.name);
	}

	//show_card(dTable); //OK!
	//if (Serverdata.games.length<4) startgame('dixit');

}

function regular_poll(){

	if (isdef(TO.poll) && isdef(U) && isdef(G) && G.fen.plturn != U.name){
		TO.poll = setTimeout(()=>{
			let d=mBy('dUpdateInput');
			d.value = JSON.stringify({user:U.name,game:G.name});
			submit_form('dUpdateForm');
		})
	}
}

















