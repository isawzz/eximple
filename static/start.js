onload = start;
async function start() {
	await ensureAssets();

	dTitle = mBy('dTitle');
	show_title('My Little World');
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });

	dTable = mBy('dTable'); mCenterCenterFlex(dTable); mStyle(dTable,{fg:'white',bg:GREEN})
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });

	DA.gameItems = show_gametable(mBy('dAllTables'));
	show_user(); 
	console.log('U',U,'G',G);


	mStyle(mBy('dMessage'),{bg:GREEN,alpha:80,fg:'red'})
	mStyle(mBy('dStatus'),{bg:GREEN,alpha:80})
	mStyle(mBy('dInstruction'),{bg:GREEN,alpha:80})
}

