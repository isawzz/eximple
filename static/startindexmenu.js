function onclick_startgame() {
	console.log('starting the game!');
}
async function startloading() {
	let path = `${Basepath}/DB.yaml`;
	var DB = await route_path_yaml_dict(path);
}
async function route_path_yaml_dict(url) {
	let data = await fetch(url, {
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
			'Content-Type': 'text/x-yaml',
			'Access-Control-Allow-Origin': '*',
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
