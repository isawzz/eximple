
function present_account(userdata) {
	DA.imageChanged = DA.colorChanged = false; //DA.colorPickerLoaded = false;
	//console.log('userdata', userdata);
	return `
	<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
		<div id="error">some text</div>
		<div style='text-align:center'>
			<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
				<span id='img_dd_instruction' style="font-size:11px;">drag and drop an image to change</span><br>
				<img id="imgPreview" onload='addColorPicker("${userdata.color}");' src='${get_image_path(userdata)}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
					style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="motto" placeholder='motto' value="${userdata.motto}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`; //onload='addColorPicker(${userdata.color})' 
}
function present_login(obj) { param_present_contacts(obj, mBy('inner_left_panel'), 'onclick_user_login'); }
function present_games() {
	let html = `<div id='game_menu' style="text-align: center; animation: appear 1s ease both">`;
	for (const g of dict2list(DB.games)) { html += ui_game_menu_item(g, Session.tables_by_game[g.id]); }
	mBy('inner_left_panel').innerHTML = html;
	mCenterCenterFlex(mBy('game_menu'));

}
function present_intro() {
	let dParent = mBy('divTest'); show(dParent); clearElement(dParent);
	mStyle(dParent, { position: 'absolute', top: 0, bg: 'green', wmin: '100vw', hmin: '100vw' });
	param_present_contacts(Session, dParent, 'onclick_user_in_intro');
}
function present_non_admin_user(username) {
	//Session.cur_user = username;
	//console.log('===>present_non_admin_user username',username,Session.cur_user);
	load_user(username);
	get_dictionary();
	poll_for_table_started();
	//get_tables();
}
function present_non_admin_waiting_screen(){
	//console.log('llllllllllllll',)
	let dParent = mBy('divTest'); show(dParent); clearElement(dParent);
	mStyle(dParent, { position: 'absolute', top: 0, bg: 'green', wmin: '100vw', hmin: '100vw' });
	
	//show logout link in upper right corner
	let dlogout = mDiv(dParent,{position:'absolute',right:10,top:4,cursor:'pointer'},'ddd_logout',`logout`);
	dlogout.onclick = onclick_logout;

	show_user_image(Session.cur_user, dParent);
	status_message_new(`hi, ${capitalize(Session.cur_user)}, a game is starting soon...`, dParent, { classname: 'slow_gradient_blink' });
	mLinebreak(dParent, 100);
	show_rankings(dParent);

	//poll_for_table_started();
}












