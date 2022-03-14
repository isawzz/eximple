TestInfo.list = arrRange(100, 113); //[];// [100, 101, 102, 103, 104];
TestInfo.number = 306; // do NOT set this to 107 in real mode!

function ari_ut306_create_staged() { //prep double visit
	console.log('*** test 306: prep double visit ***');
	TestInfo.number = 306;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);

	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farms = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];

	fen.phase = 'queen';

	DA.fen0 = fen;
	DA.auto_moves = [ [],
		[['visit'],['last'],[0]],
		[['visit'],['last'],[1]],
		[['pass']],
		// [['pass']], [['pass']], //end of jack phase
		// [[0]], [[0]], //stall selection king phase
		// [['pass']], [['pass']], //end of king phase
		// [[1]], //NOT ending game!
	];

	return [fen, player_names];
}
function ari_ut206_create_staged() { //prep double visit
	console.log('*** test 206: prep double visit ***');
	TestInfo.number = 206;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);

	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farms = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];

	fen.phase = 'queen';

	DA.fen0 = fen;

	return [fen, player_names];
}


//#region echte ari unit tests!
function ari_ut113_create_staged() { //buy from open discard w/ jack
	console.log('*** test 113: buy from open discard w/ jack ***');
	TestInfo.number = 113;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['JSy']);

	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';

	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};

	return [fen, player_names];
}
function ari_ut112_create_staged() { //auction payment test 2
	console.log('*** test 112: auction payment test 2 ***');
	TestInfo.number = 112;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele', 'felix', 'amanda'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);

	fen.phase = 'queen';

	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [['pass']],
		5: [['pass']],
		6: [[1]],
		7: [[0]],
		8: [[2]],
		9: [[2]],
		10: [[1]],
		11: [[0]], //card
		12: [[1]], //card
	};
	DA.iter_verify = 13;
	DA.verify = (ot) => {
		//derjenige der 2 gezahlt hat muss um 1 kaufen!
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 11;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};


	return [fen, player_names];
}
function ari_ut111_create_staged() { //auction payment test
	console.log('*** test 111: auction payment test ***');
	TestInfo.number = 111;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);

	fen.phase = 'queen';

	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [[0]],
		5: [[1]],
		6: [[2]],
		7: [[0]],
	};
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		//derjenige der 2 gezahlt hat muss um 1 kaufen!
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 8;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};


	return [fen, player_names];
}
function ari_ut110_create_staged() { //end game 2
	console.log('*** test 110: end game 2 ***');
	TestInfo.number = 110;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);

	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';

	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']], //end of jack phase
		[[0]], [[0]], //stall selection king phase
		[['pass']], [['pass']], //end of king phase
		[[1]], //NOT ending game!
	];
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		let res = ot.stage == 3;
		//console.log('stage',ot.stage);
		if (!res) console.log('Not ending game FAIL!', ot.stage);
		return res;
	};

	return [fen, player_names];
}
function ari_ut109_create_staged() { //harvest
	console.log('*** test 109: harvest ***');
	TestInfo.number = 109;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);

	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2 }, leo: { farms: 3 }, meckele: { farms: 2 } });
	fen.phase = 'jack';

	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']], [['pass']], //end of jack phase
		[[0]], [[0]], [[0]], //tax: one each
		[[0, 1]], [[0, 1]], [[0, 1]], //stall selection
		[['harvest'], [0]],
	];
	DA.iter_verify = 11;
	DA.verify = (ot) => {
		let uname = ot.plturn;
		let res = ot[uname].buildings.farms[0].h == null && ot[uname].hand.length == 6;
		if (!res) console.log('harvest FAIL!', ot[uname]);
		return res;
	};

	return [fen, player_names];
}
function ari_ut108_create_staged() { //buy from open discard
	console.log('*** test 108: buy from open discard ***');
	TestInfo.number = 108;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);

	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';

	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};

	return [fen, player_names];
}
function ari_ut107_create_staged() { //end game
	console.log('*** test 107: end game ***');
	TestInfo.number = 107;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);

	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });

	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['pass']],
		leo_2: [['pass']],
		3: [[0]], //mimi is ending the game
	};
	DA.iter_verify = 4;
	DA.verify = (ot) => {
		let res = ot.winner = 'mimi';
		if (!res) console.log('end game mimi should win didnt work!', ot);
		//hier muss gameover screen beseitigt werden! wie mach ich das?
		return res;
	};

	return [fen, player_names];
}
function ari_ut106_create_staged() { //double visit
	console.log('*** test 106: double visit ***');
	TestInfo.number = 106;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);

	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'chateau');
	stage_building(fen, 2, 'chateau');

	fen.phase = 'queen';

	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0]],
		mimi_2: [['visit'], [0], [0]],
	};
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let uname_visited = ot.plorder[1];
		let chateaus = ot[uname_visited].buildings.chateaus;
		console.log('chateaus:', uname_visited, chateaus);
		let res = ot.mimi.coins == 5 || ot[uname_visited].buildings.chateaus.length == 0;
		if (!res) console.log('double visit failed or building is correct!!!');
		return res;
	};

	return [fen, player_names];
}
function ari_ut105_create_staged() { //visit
	console.log('*** test 105: visit ***');
	TestInfo.number = 105;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy']);

	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'estate');
	stage_building(fen, 2, 'estate');

	fen.phase = 'queen';

	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let uname_visited = ot.plturn;
		let building = ot[uname_visited].buildings.estates[0];
		let res = ot.mimi.coins == 2 || ot.mimi.coins == 4 || ot.mimi.hand.length + ot.mimi.stall.length == 6;
		if (!res) console.log('mimi visit payment did not work!', building.list);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0], ['pass']],
	};

	return [fen, player_names];
}
function ari_ut104_create_staged() { //downgrade from estate to farm
	console.log('*** test 104: downgrade from estate to farm ***');
	TestInfo.number = 104;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);

	stage_building(fen, fen.iturn, 'estate');

	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {

		let stall_sz = { mimi: 0, leo: 3 };
		let res = ot.mimi.buildings.farms.length == 1 && ot.mimi.buildings.estates.length == 0;
		if (!res) console.log('mimi buildings', ot.mimi.buildings);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['downgrade'], [0]],
		//leo_3: () => { A.selected = [0]; ari_post_action(); },
	};

	return [fen, player_names];
}
function ari_ut103_create_staged() { //trade
	console.log('*** test 103: trade ***');
	TestInfo.number = 103;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);

	//arisim_stage_4(fen); //da passiert die stall selection
	arisim_stage_4_all_mimi_starts(fen, 2);

	DA.fen0 = fen;
	//console.log('...........fen.market[1]',fen.market[1]);

	DA.auto_moves = {
		mimi_1: [['trade'], [1, 3]],
		mimi_2: [['pass']],
		leo_3: [['trade'], [1, 3]],
		leo_4: [['pass']],
	};
	DA.iter_verify = 5;
	DA.verify = (ot) => {
		let res = firstCond(ot.mimi.hand, x => x == DA.fen0.market[1]);
		if (!res) console.log('mimi stall does not contain market card from start!!!');
		return res;
	};

	return [fen, player_names];
}
function ari_ut102_create_staged() { //stall selection with empty hands
	console.log('*** test 102: stall selection mimi-leo ***');
	TestInfo.number = 102;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	ari_test_hand_to_discard(fen, 'mimi'); //mimi has no hand! this makes sure that it is leo's turn!
	fen.stage = 3;

	DA.fen0 = fen;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, leo: 3 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	DA.auto_moves = {
		leo_2: [[0, 1, 2]],
	};

	return [fen, player_names];
}
function ari_ut101_create_staged() { //stall selection with empty hands
	console.log('*** test 101: stall selection 5 players ***');
	TestInfo.number = 101;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);

	ari_test_hand_to_discard(fen, 'mimi'); //mimi has no hand!
	ari_test_hand_to_discard(fen, 'felix'); //felix has no hand!

	fen.stage = 3;

	DA.fen0 = fen;

	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 6;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, amanda: 3, felix: 0, lauren: 1, blade: 2 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	//DA.auto_moves = {};
	DA.auto_moves = {
		amanda_2: [[0, 1, 2]],
		lauren_4: [[0]],
		blade_5: [[0, 1]],
	}

	return [fen, player_names];
}
function ari_ut100_create_staged() { //tax
	console.log('*** test 100: tax ***');
	TestInfo.number = 100;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);

	ari_test_hand_to_discard(fen, 'mimi'); //mimi has no hand!
	deck_add(fen.deck, 3, fen.players.amanda.hand); //amanda has to pay 3 tax
	ari_test_hand_to_discard(fen, 'felix', 3); //felix hand size 3, no tax!
	//deck_add(fen.deck,1,fen.players.felix.hand); //felix has to pay 1 tax
	// lauren pays no tax
	deck_add(fen.deck, 1, fen.players.blade.hand); //blade has to pay 1 tax


	let sz = ARI.sz_hand;
	fen.pl_tax = { mimi: -sz, amanda: 3, felix: -sz + 3, lauren: 0, blade: 1 };
	[fen.iturn, fen.plturn] = [1, 'amanda'];
	fen.stage = 2;

	DA.fen0 = fen;

	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let res = forAll(ot.plorder, x => ot[x].hand.length <= sz);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'hand', ot[uname].hand.length, 'should be', Math.min(sz, DA.fen0.players[uname].hand.length));

		// for(const uname of ot.plorder) if (ot[uname].hand.length>sz) return false;
		// return true;

		return res;
	};
	DA.auto_moves = {
		amanda_1: [[0, 1, 2]],
		blade_2: [[0]],
	}

	return [fen, player_names];
}



//#region aristo tests mimi-leo, realistic
function ari_ut10_create_staged() { //just setup
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut11_create_staged() { //buy
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	let [mimi, leo] = [fen.players.mimi, fen.players.leo];
	mimi.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	leo.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.open_discard = deck_deal(fen.deck, 4);

	fen.market = deck_deal(fen.deck, 2);
	fen.phase = 'king';
	arisim_stage_4(fen, 3, 3);

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut12_create_staged() { //just setup 5 players
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut13_create_staged() { //2 hands empty in stage 4
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);

	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'lauren');

	console.log('mimi', fen.players.mimi)
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut14_create_staged() { //pickup single card
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.fen0 = jsCopy(fen);

	arisim_stage_3(fen);
	arisim_stage_4_all(fen, 1);

	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let plast = arrLast(ot.round);
		//this player's hand must now be exactly as at beginning!
		let ok = sameList(ot[plast].hand, DA.fen0.players[plast].hand);
		console.log('pl', plast, 'hand', ot[plast].hand, 'should be', DA.fen0.players[plast].hand);
		return ok;
	}
	return [fen, player_names];
}
function ari_ut15_create_staged() { //4 hands empty in stage 4
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = DA.fen0 = ari_setup(player_names);

	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'amanda');
	ari_test_hand_to_discard(fen, 'lauren');
	ari_test_hand_to_discard(fen, 'blade');

	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => ot.plturn == 'felix';
	return [fen, player_names];
}
function ari_ut16_create_staged() { //just setup mimi, leo
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}

//#region aristo tests mimi-leo, no moves
function ari_ut0_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb ASb 2Db 4Db 6Db KDb QSb'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 4Sr 4Sb 4Dr'.split(' '), h: null }, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.mimi.buildings.estates = [{ list: 'TCr TSr TSb TDr TDb'.split(' '), h: null }];

	//log_object(fen, 'fen');
	//log_object(fen.players.mimi, 'mimi')
	//log_object(fen.players.leo, 'leo')

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut1_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	//move 2 cards from deck to market
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;

	//move 2 or 3 cards to stalls
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);

	fen.iturn = 1;
	fen.plturn = 'leo';
	fen.round = ['mimi'];

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut2_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	arisim_stage_3(fen);

	arisim_stage_4(fen);

	//fen.players.mimi.hand.push('KHg');

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut3_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	// fen.players.mimi.hand = '4Cb 6Cb KCb QDb'.split(' ');
	// fen.players.leo.hand = 'ACb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');
	arisim_stage_4(fen, 3, 2);
	// fen.players.mimi.stall = 'AHb ADb 2Cb'.split(' ');
	// fen.players.leo.stall = 'KDb QSb'.split(' ');
	// fen.stage = 5;

	//log_object(fen, 'fen');
	//log_object(fen.players.mimi, 'mimi')
	//log_object(fen.players.leo, 'leo')

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut4_create_staged() { //start in queen phase
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');

	fen.phase = 'queen';
	fen.stage = 11;

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut5_create_staged() { //start in jack phase
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];

	fen.phase = 'jack';
	fen.stage = 3;

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut6_create_staged() { //start in jack phase
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];

	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
		//top_elem_from_to(fen.players.mimi.hand,fen.players.mimi.stall);
		//top_elem_from_to(fen.players.leo.hand,fen.players.leo.stall);
	}

	fen.phase = 'jack';
	arisim_stage_4(fen);


	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut7_create_staged() { //double visit
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];

	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
		//top_elem_from_to(fen.players.mimi.hand,fen.players.mimi.stall);
		//top_elem_from_to(fen.players.leo.hand,fen.players.leo.stall);
	}

	fen.phase = 'jack';
	arisim_stage_4(fen);


	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut8_create_staged() { //harvest, tax
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	deck_add(fen.deck, 1, fen.players.mimi.hand); //'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	//deck_add(fen.deck, 2, fen.players.leo.hand); //'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: '3Hb' }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.players.leo.buildings.estates = [{ list: deck_deal(fen.deck, 5), h: null }];

	fen.market = deck_deal(fen.deck, 3);
	fen.phase = 'jack';
	arisim_stage_4(fen);

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
function ari_ut9_create_staged() { //transfer to new round
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);

	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}

	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');

	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: '3Hb' }];//, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.leo.buildings.farms = [{ list: 'JCr JSr JSb JDr'.split(' '), h: '3Sr' }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];

	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
		//top_elem_from_to(fen.players.mimi.hand,fen.players.mimi.stall);
		//top_elem_from_to(fen.players.leo.hand,fen.players.leo.stall);
	}

	fen.phase = 'king';
	arisim_stage_4(fen);

	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];

}
//#endregion


//#region NEW unit tests for inno!
function inno_undo_random_deal(fen) {
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		last_elem_from_to(pl.hand, fen.decks.E[1]);
		last_elem_from_to(pl.hand, fen.decks.B[1]);
	}
}
function inno_ut0_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	console.log('fen', fen)
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'mimi.board.yellow.agriculture', 'mimi.hand.comb',
		'leo.board.red.metalworking', 'leo.board.red.metalworking', 'mimi.board.yellow.agriculture', 'pass', 'mimi.board.yellow.agriculture', 'pass'];
	DA.iter = 100;
	//DA.verify = (ot)=>ot.turn[0]=='mimi';
	// DA.verify = (ot)=>ot.mimi.board.yellow[0]==['agriculture'] && ot.leo.board.yellow[0]=='soap' && ot.turn[0]=='mimi';
	return [fen, player_names];
}

//test activating agriculture
function inno_ut1_create_staged() {
	console.log('*** TEST: activate agriculture ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'mimi.board.yellow.agriculture', 'mimi.hand.comb'];//,'mimi.hand.comb','leo.board.red.metalworking'];
	DA.iter = 13;
	return [fen, player_names];
}

//test minimal: just basic selection 2 players
function inno_ut2_create_staged() {
	//console.log('*** TEST: init 2 players ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking'];
	DA.iter = 100;
	return [fen, player_names];
}

function inno_ut3_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix', 'amanda'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix, amanda] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix, fen.players.amanda];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);
	elem_from_to('pottery', deck1, amanda.hand);
	elem_from_to('dice', deck2, amanda.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.metalworking', 'felix.hand.agriculture', 'amanda.hand.dice'];
	DA.iter = 100;
	return [fen, player_names];
}

//test sharing agriculture
function inno_ut4_create_staged() {
	console.log('*** TEST: sharing agriculture ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('pottery', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.pottery', 'leo.hand.soap', 'felix.hand.agriculture'];
	DA.iter = 100;
	return [fen, player_names];
}

//test sharing metalworking
function inno_ut5_create_staged() {
	console.log('*** TEST: sharing metalworking ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.metalworking', 'felix.hand.agriculture', 'draw.decks.B.1'];
	DA.iter = 100;
	return [fen, player_names];
}

//test draw
function inno_ut6_create_staged() {
	console.log('*** TEST: draw ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.soap'];//,'draw.decks.B.1'];
	DA.iter = 100;
	return [fen, player_names];
}

//test draw 2
function inno_ut7_create_staged() {
	console.log('*** TEST: draw 2 ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.soap', 'decks.E.1', 'decks.B.1', 'decks.B.1'];//,'draw.decks.B.1'];
	DA.iter = 100;
	return [fen, player_names];
}
//test ui: splay up
function inno_ut8_create_staged() {
	console.log('*** TEST: splay up ***');

	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('puppet', deck2, leo.hand);

	elem_from_to('chopsticks', deck2, mimi.board.yellow);
	elem_from_to('soap', deck2, mimi.board.yellow);
	elem_from_to('fermenting', decks.B[2], mimi.board.yellow);

	fen.players.mimi.splays.yellow = 3;

	DA.iter = 100;
	return [fen, player_names];
}

//test ui: splay complex
function inno_ut9_create_staged() {
	console.log('*** TEST: splay complex ***');

	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('puppet', deck2, leo.hand);

	let mydeck1 = decks.B[1].map(x => ({ key: x, deck: decks.B[1] }));
	let mydeck2 = decks.B[2].map(x => ({ key: x, deck: decks.B[2] }));
	let mydeck3 = decks.B[3].map(x => ({ key: x, deck: decks.B[3] }));
	let mydecks = mydeck1.concat(mydeck2).concat(mydeck3);
	for (const x of mydecks) { elem_from_to(x.key, x.deck, mimi.board[inno_get_cardinfo(x.key).color]); }
	fen.players.mimi.splays.blue = 3;
	fen.players.mimi.splays.red = 0;
	fen.players.mimi.splays.green = 1;
	fen.players.mimi.splays.yellow = 2;
	fen.players.mimi.splays.purple = 2;

	DA.iter = 100;
	return [fen, player_names];
}

//test draw 
function inno_ut10_create_staged() {
	//console.log('*** TEST: draw ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'draw', 'draw', 'draw', 'draw'];
	DA.iter = 100;
	return [fen, player_names];
}

//test meld
function inno_ut11_create_staged() {
	//console.log('*** TEST: meld ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'draw', 'draw', 'draw', 'draw', 'meld', 'meld', 'draw', 'draw', 'meld', 'meld'];
	//wo kommen eigentlich die meld actions (hand_actions) hin? gleich die ersten provided hand hat cards!
	DA.iter = 100;
	return [fen, player_names];
}

//test activating code_of_laws 
function inno_ut12_create_staged() {
	console.log('*** TEST: activate code_of_laws ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];

	inno_undo_random_deal(fen);

	//now re-deal staged:
	elem_from_to('code_of_laws', deck1, mimi.hand);
	elem_from_to('puppet', deck2, mimi.hand);
	elem_from_to('sailing', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);

	//stage_moves('mimi.hand.agriculture','leo.hand.soap','mimi.board.yellow.agriculture');
	DA.staged_moves = ['mimi.hand.code_of_laws', 'leo.hand.sailing', 'mimi.board.purple.code_of_laws', 'leo.hand.soap', 'mimi.hand.puppet'];//,'mimi.hand.comb','leo.board.red.metalworking'];
	DA.iter = 100;
	return [fen, player_names];
}


//unit test helpers

// function test_engine(){
// 	TestInfo.list=[100,101,102];

// 	//wie starte ich die tests?
// 	test_engine_run_next(TestInfo.list);
// }
function test_engine_run_next(list) {
	if (nundef(list)) {
		list = TestInfo.list = arrRange(100, TestInfo.number - 1); //[101, 102, 103];
		//console.log('setting TestInfo.list to',TestInfo.list,'TestInfo.number',TestInfo.number)
	}
	//console.log('list',jsCopy(list))
	if (isEmpty(list)) {
		console.log('*** all tests finished ***');
		TestInfo.suiteRunning = TestInfo.running = false;
		shield_off();

		//remove test shield!
		return;
	}
	let n = list.shift();
	//console.log('list',jsCopy(list));
	ITER = 0;
	onclick_ut_n('ari', n);

}

function verify_unit_test(otree) {
	//console.log('hallo verify!')
	if (isdef(DA.verify) && ITER == DA.iter_verify) {
		TestInfo.running = false;
		let res = DA.verify(otree);
		console.log('***UNIT TEST ' + TestInfo.number, res ? 'passed...' : 'FAILED!!!!!!!!!!!!!!!!');
		console.assert(res, '*** STOP TEST FAIL ***')
		//hier ist test zu ende!
		//console.log('===>TestInfo.list',TestInfo.list);
		if (TestInfo.suiteRunning) test_engine_run_next(TestInfo.list);
	}
	return true;
}
function add_to_chain(list) { DA.chain = DA.chain.concat(list); }
function old_stage_moves() {
	for (const a of arguments) {
		let [uname, x, cardname] = a.split('.');

		DA.chain.push(() => {
			//console.log('player',pl,'selects',a);
			let g = Session;
			let state = { selected: {} }; //{ id: a }
			state.selected[uname] = [a];
			let o = { uname: uname, tid: g.table.id, state: state, player_status: 'joined' };
			//console.log('sending to server',o)
			to_server(o, 'turn_send_move');

		})
	}
}
function stage_moves() {
	for (const a of arguments) {
		let [uname, x, cardname] = a.split('.');

		DA.chain.push(() => {
			//console.log('player',pl,'selects',a);
			let g = Session;
			let state = { selected: {} }; //{ id: a }
			state.selected[uname] = [a];
			let o = { uname: uname, tid: g.table.id, state: state, player_status: 'joined' };
			//console.log('sending to server',o)
			to_server(o, 'turn_update');

		})
	}
}
//#region ARI test staging helpers
function arisim_stage_3(fen) {
	//move 2 cards from deck to market
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	if (fen.phase == 'jack') top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;
}
function arisim_stage_4(fen, n_mimi = 2, n_leo = 3) {
	//move 2 or 3 cards to stalls
	for (let i = 0; i < n_mimi; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	for (let i = 0; i < n_leo; i++)	top_elem_from_to(fen.players.leo.hand, fen.players.leo.stall);


	//need to set num_actions! and iturn to player with least stall value!
	fen.stage = 5;
	let valmimi = fen.players.mimi.stall_value = arrSum(fen.players.mimi.stall.map(x => Aristocards[x].val));
	let valleo = fen.players.leo.stall_value = arrSum(fen.players.leo.stall.map(x => Aristocards[x].val));
	let minplayer = valmimi <= valleo ? 'mimi' : 'leo';
	fen.iturn = fen.plorder.indexOf(minplayer); fen.plturn = minplayer;
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLOOOOOOOOO', minplayer, fen.num_actions)
}
function arisim_stage_4_all_mimi_starts(fen, n = 3) {
	//move 2 or 3 cards to stalls
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const uname of others) {
		for (let i = 0; i < n; i++)	top_elem_from_to(fen.players[uname].hand, fen.players[uname].stall);
	}

	let list = [];
	for (const uname of get_keys(fen.players)) {
		fen.players[uname].stall_value = arrSum(fen.players[uname].stall.map(x => Aristocards[x].val));
		list.push({ uname: uname, val: fen.players[uname].stall_value });
	}

	//need to set num_actions! and iturn to player with least stall value!
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;

	//change minplayer stall with mimi stall and set mimi minplayer!
	if (minplayer != 'mimi') {
		console.log('NOT mimi!!! minplayer', minplayer)
		let best_stall = fen.players[minplayer].stall;
		let best_stall_value = fen.players[minplayer].stall_value;
		fen.players[minplayer].stall = fen.players.mimi.stall;
		fen.players[minplayer].stall_value = fen.players.mimi.stall_value;
		fen.players.mimi.stall = best_stall;
		fen.players.mimi.stall_value = best_stall_value;
		minplayer = 'mimi';
	}

	fen.iturn = fen.plorder.indexOf(minplayer);
	fen.plturn = minplayer;
	console.assert(fen.plturn == 'mimi', 'WTF?????????????????');
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLOOOOOOOOO', minplayer, fen.num_actions)
}
function arisim_stage_4_all(fen, n = 3) {
	//move 2 or 3 cards to stalls
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const uname of others) {
		for (let i = 0; i < n; i++)	top_elem_from_to(fen.players[uname].hand, fen.players[uname].stall);
	}

	let list = [];
	for (const uname of get_keys(fen.players)) {
		fen.players[uname].stall_value = arrSum(fen.players[uname].stall.map(x => Aristocards[x].val));
		list.push({ uname: uname, val: fen.players[uname].stall_value });
	}

	//need to set num_actions! and iturn to player with least stall value!
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;
	fen.iturn = fen.plorder.indexOf(minplayer);
	fen.plturn = minplayer;
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLOOOOOOOOO', minplayer, fen.num_actions)
}
function ari_test_hand_to_discard(fen, uname, keep = 0) {
	let list = fen.players[uname].hand;
	//fill up open discard
	while (fen.open_discard.length < 4 && list.length > keep) top_elem_from_to(list, fen.open_discard);
	while (list.length > keep) top_elem_from_to(list, fen.deck_discard);
	//fen.players[uname].hand = [];

}
function stage_building(fen, i_pl, type) {
	let n = type == 'chateau' ? 6 : type == 'estate' ? 5 : 4;
	type += 's';
	let uname = fen.plorder[i_pl];
	fen.players[uname].buildings[type].push({ list: deck_deal(fen.deck, n), h: null });
}
function stage_correct_buildings(fen, o) { //unames, types, ranks) {
	//eg. o={mimi:{farms:2,estates:2,chateaus:1},leo:{farms:3}};
	//only use yellow and green cards!
	//first count how many ranks we need! or: take ranks der reihe nach
	let ranks = toLetters(Card.ranks);
	let irank = 0;
	for (const uname in o) {
		let pl = fen.players[uname];
		let bo = pl.buildings;
		let dinums = o[uname];
		for (const type in dinums) {
			let n = dinums[type];
			for (let i = 0; i < n; i++) {
				let r = ranks[irank]; irank++;
				let s = type == 'farms' ? `${r}Cy ${r}Sy ${r}Sy ${r}Dy` :
					type == 'estates' ? `${r}Cy ${r}Sy ${r}Sy ${r}Dy ${r}Cg` : `${r}Cy ${r}Sy ${r}Sy ${r}Dy ${r}Cg ${r}Hg`;
				bo[type].push({ list: s.split(' '), h: null });
			}
		}
	}
}
function stage_replace_hand_cards_by(fen, uname, keys) { let i = 0; for (const key of keys) fen.players[uname].hand[i++] = key; }













