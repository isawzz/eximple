from flask import jsonify, Flask, request, send_from_directory, render_template, redirect
app = Flask(__name__)
HEROKUPROD = False #set True for production (need to re-create db on heroku!)
Basepath = "https://www.telecave.net/aroot/base/" if HEROKUPROD else "http://127.10.0.1:8080/aroot/base/"

from dbutils import *
db_init(app)

#region socketio
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
import eventlet
CORS(app)
eventlet.monkey_patch()
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('message')
def handle_message(msg):
	print('message: '+msg)
	send('rec '+msg, broadcast=True) #without broadcast, will just send to msg sender

@app.route('/testsocketio')
def testsock():	
	return render_template('tests/test_socketio.html')

@app.get('/stop')
def shutdown():
	socketio.stop()
#endregion

@app.route('/')
def base_route():	return redirect ('/info'); # ('/game/paris/felix')

@app.route('/reset')
def r_reset(): 
	create_random_data()
	return redirect('/info')

@app.route('/info')
def r_info(): 
	return render_template('info.html', Basepath=Basepath, Serverdata={"users":get_users(),"games":get_games(),"actions":get_actions()})

@app.route('/loggedin/<user>', methods=['GET','POST'])
def r_loggedin(user): 
	return render_template('loggedin.html', Basepath=Basepath, Serverdata={"user":get_user(user),"games":get_games_for(user),"actions":get_user_actions(user)}) 

@app.route('/table/<game>/<user>', methods=['GET','POST'])
def r_table(game,user): 
	if user == 'anonymous':
		return render_template('table.html', Basepath=Basepath, Serverdata={"user":{"name":"anonymous","color":'YELLOW'},"game":get_game(game)}) 
	return render_template('table.html', Basepath=Basepath, Serverdata={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user)}) 

@app.route('/action/<game>/<user>/<action>', methods=['GET','POST'])
def r_action(game,user,action): 
	print('action',action)
	action_result = process_action(game,user,action)
	return render_template('table.html', Basepath=Basepath, Serverdata={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user), "action_result":action_result}) 

def process_action(game,user,action):
	g=Game.query.filter_by(name=game).first()
	u=User.query.filter_by(name=user).first()
	a = Action.query.filter_by(user_id=u.id, game_id=g.id).first()
	a.choice = action
	s = a.choices.replace(action,'').replace('  ',' ')
	a.choices = s # '2 3 4 5' #a.choices.split('\W+')
	db.session.commit()

	agame = Action.query.filter_by(game_id=g.id).all()
	print([x.toDict() for x in agame])
	done = True
	for rec in agame:
		if not rec.choice:
			done = False
			break
	if done:
		msg = f'STEP_COMPLETE {g.step}' 
		print('!!!!!',msg)
		send(msg, broadcast=True)	



	return a.toDict()

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
	#app.run(port=5051, debug=True)
	socketio.run(app, port=5051, debug=True)













