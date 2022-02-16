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
	return render_template('loggedin.html',basepath=basepath, serverData={"user":get_user(user),"games":get_games_for(user)}) #,"actions":get_user_actions(user)})

@app.route('/table/<game>/<user>', methods=['GET','POST'])
def r_table(game,user): 
	if user == 'anonymous':
		return 'show anonymous table'
	return render_template('table.html',basepath=basepath, serverData={"user":get_user(user),"game":get_game(game)}) #,"actions":get_user_actions(user)})
#endregion

#region spiele: complex stuff!!!!!!!!!!!!!!!!!
def process_action(data,choice):
	print('...user picked action',choice)
	data['hallo'] = 'hallo'
	pass

@app.route('/game/<gamename>/<username>', methods=['GET','POST'])
def game_route(gamename,username):	
	user = get_user(username) if username!='anonymous' else {'name':'anonymous'}
	game = get_game(gamename)
	actions = get_actions(game,user)
	serverData = {'actions':actions,'user':user,'game':game}
	if request.method == 'POST':
		process_action(serverData,request.form['text'])

	return render_template('simplegame.html',serverData=serverData) 

#endregion

if __name__ == "__main__":
	app.run(port=5051, debug=True)













