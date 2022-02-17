from flask import jsonify, Flask, request, send_from_directory, render_template, redirect
app = Flask(__name__)
HEROKUPROD = False #set True for production (need to re-create db on heroku!)
basepath = "https://www.telecave.net/aroot/base/" if HEROKUPROD else "http://localhost:8080/aroot/base/"

from dbutils import *
db_init(app)

@app.route('/')
def base_route():	return redirect ('/info'); # ('/game/paris/felix')

@app.route('/reset')
def r_reset(): 
	create_random_data()
	return redirect('/info')

#region test routes
@app.route('/get_players/<game>')
def r_get_players(game): return jsonify(get_players(game))
@app.route('/get_playernames/<game>')
def r_get_playernames(game): return jsonify(get_playernames(game))
@app.route('/get_games/<user>')
def r_get_games_for(user): return jsonify(get_games_for(user))
@app.route('/get_gamenames/<user>')
def r_get_gamenames_for(user): return jsonify(get_gamenames_for(user))
@app.route('/get_game_actions/<game>')
def r_get_game_actions(game): return jsonify(get_game_actions(game))

#region ui routes
@app.route('/info')
def r_info(): 
	return render_template('info.html',basepath=basepath, serverData={"users":get_users(),"games":get_games(),"actions":get_actions()})

@app.route('/loggedin/<user>', methods=['GET','POST'])
def r_loggedin(user): 
	games = get_games_for(user)
	#for each of these games should get actions
	return render_template('loggedin.html',basepath=basepath, serverData={"user":get_user(user),"games":games,"actions":get_user_actions(user)}) 

@app.route('/table/<game>/<user>', methods=['GET','POST'])
def r_table(game,user): 
	if user == 'anonymous':
		return render_template('table.html',basepath=basepath, serverData={"user":{"name":"anonymous","color":'YELLOW'},"game":get_game(game)}) 
	return render_template('table.html',basepath=basepath, serverData={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user)}) 

@app.route('/action/<game>/<user>/<action>', methods=['GET','POST'])
def r_action(game,user,action): 
	print('action',action)
	action_result = process_action(game,user,action)
	return render_template('table.html',basepath=basepath, serverData={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user), "action_result":action_result}) 

def process_action(game,user,action):
	#die gewaehlte action muss aus der action list raus
	#choice wird zu action gesetzt
	print('...user',user,'game',game,'action',action)
	g=Game.query.filter_by(name=game).first()
	print('=>game.id',g.id)
	u=User.query.filter_by(name=user).first()
	print('=>user.id',u.id)
	a = Action.query.filter_by(user_id=u.id,game_id=g.id).first()
	print('=>action.choices',a.choices)
	a.choice = action
	s = a.choices
	s=s.replace(action,'').replace('  ',' ')
	print('...res=',s)
	
	a.choices = s # '2 3 4 5' #a.choices.split('\W+')
	print('....',a.choices)
	#choices.remove(action)
	#a.choices = ' '.join(choices)
	#a.choices.remove(action)
	print('a',a.toDict()) #,a.choice)
	db.session.commit()
	return a.toDict()

#endregion

if __name__ == "__main__":
	app.run(port=5051, debug=True)













