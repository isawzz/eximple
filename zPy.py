
#region feb 16 22
def process_action(game,user,action):
	#die gewaehlte action muss aus der action list raus
	#choice wird zu action gesetzt
	#print('...user',user,'game',game,'action',action)
	g=Game.query.filter_by(name=game).first()
	#print('=>game.id',g.id)
	u=User.query.filter_by(name=user).first()
	#print('=>user.id',u.id)
	a = Action.query.filter_by(user_id=u.id,game_id=g.id).first()
	#print('=>action.choices',a.choices)
	a.choice = action
	s = a.choices
	s=s.replace(action,'').replace('  ',' ')
	#print('...res=',s)
	
	a.choices = s # '2 3 4 5' #a.choices.split('\W+')
	#print('....',a.choices)
	#choices.remove(action)
	#a.choices = ' '.join(choices)
	#a.choices.remove(action)
	#print('a',a.toDict()) #,a.choice)
	db.session.commit()
	return a.toDict()


@app.route('/game/<gamename>/<username>', methods=['GET','POST'])
def game_route(gamename,username):	
	user = get_user(username) if username!='anonymous' else {'name':'anonymous'}
	game = get_game(gamename)
	actions = get_actions(game,user)
	serverData = {'actions':actions,'user':user,'game':game}
	if request.method == 'POST':
		process_action(serverData,request.form['text'])

	return render_template('simplegame.html',serverData=serverData) 




















