
#region feb 16 22
@app.route('/game/<gamename>/<username>', methods=['GET','POST'])
def game_route(gamename,username):	
	user = get_user(username) if username!='anonymous' else {'name':'anonymous'}
	game = get_game(gamename)
	actions = get_actions(game,user)
	serverData = {'actions':actions,'user':user,'game':game}
	if request.method == 'POST':
		process_action(serverData,request.form['text'])

	return render_template('simplegame.html',serverData=serverData) 




















