#region init
from flask import jsonify, Flask, request, send_from_directory, render_template, redirect
app = Flask(__name__)
BUILD = 'home' # public | heroku   False #set True for production (need to re-create db on heroku!)
Basepath = "https://www.telecave.net/aroot/base/" if BUILD == 'heroku' else "http://127.10.0.1:8080/aroot/base/" if BUILD == 'public' else "http://localhost:8080/aroot/base/"
app.config['SECRET_KEY'] = 'IJustHopeThisWorks!' #do I need this???

from dbutils import *
db_init(app)

from flask_cors import CORS
import json
import logging
#endregion

@app.route('/singlepage')
def r_singlepage_get():
	print('*** GET /singlepage ***')
	return render_template('singlepage.html', Basepath=Basepath, Serverdata={"users":get_users(),"games":get_games()})

@app.route('/singlepost', methods=['POST'])
def r_singlepost():
	print('*** POST /singlepage ***')
	x = request.form['text']
	jx = json.loads(x)
	print(':::received',jx['type'],jx['data']['players'])
	reqtype = jx['type']
	data = jx['data']
	if reqtype == 'startgame':
		#add game from data
		g=startgame(data['gamename'],data['players'],json.dumps(data['fen']))

	#print(':::',jx['gamename'],jx['players'],jx['fen']['players'])
	
	return render_template('singlepage.html', Basepath=Basepath, Serverdata={"game":g, "users":get_users(),"games":get_games()})

@app.route('/')
def base_route():	return redirect ('/singlepage'); # ('/game/paris/felix')

@app.route('/index')
def r_index():
	return render_template('index.html')

@app.route('/reset')
def r_reset(): 
	create_random_data()
	return redirect('/')

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
#endregion

if __name__ == "__main__":
	#print('hallo')
	#app.run()
	app.run(debug=True) #host='0.0.0.0', port=5051, debug=True)
	


