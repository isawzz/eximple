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

	//console.log('Table',Table, 'Serverdata.game',Serverdata.game)
	if (isdef(Table)) {
		presentgame(Table,dTable,User.name);
		activategame(Table,User.name);
	}

	//show_card(dTable); //OK!
	//if (Serverdata.games.length<4) startgame('dixit');

}

function regular_poll(){

	if (isdef(TO.poll) && isdef(User) && isdef(Table) && Table.fen.plturn != User.name){
		TO.poll = setTimeout(()=>{
			let d=mBy('dUpdateInput');
			d.value = JSON.stringify({user:User.name,game:Table.name});
			submit_form('dUpdateForm');
		})
	}
}

















